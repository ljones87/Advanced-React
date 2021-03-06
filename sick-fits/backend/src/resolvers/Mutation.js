const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const { promisify } = require('util');
const { transport, makeNiceEmail } = require('../mail');
const stripe = require('../stripe');

const cookieSettings = {
  httpOnly: true,
  maxAge: 1000 * 60 * 60 * 24 * 30 // 1 month cookie
}

const mutations = {
  async createItem(parent, args, ctx, info) {
    //TODO: check if they're logged in
    if(!ctx.request.userId) {
      throw new Error('You must be logged in for requested aciton')
    }
    const item = await ctx.db.mutation.createItem({
      data: {
        ...args,
        //how we create a relationship between item and user
        user: {
          connect: {
            id: ctx.request.userId
          }
        }
      }
    }, info)
    return item;
  },
  updateItem(parent, args, ctx, info) {
    //first take copy of updates
    const updates = {...args};
    //remove id from updates
    delete updates.id
    //run update method
    return ctx.db.mutation.updateItem({
      data: updates,
      where: {
        id: args.id
      },
    }, user)
  },
  async deleteItem(parent, args, ctx, info) {
    const where = { id: args.id };
    // 1 find item
    const item = await ctx.db.query.item({ where }, `{id title user { id }}`)
    //2 check if person deleting it downs it/has permissions
    const ownsItem = item.user.id === ctx.request.userId
    const hasPermissions = ctx.request.user.permissions.some(permissions => {
      ['ADMIN', 'ITEMDELETE'].includes(permissions)
    })
    if(!ownsItem && !hasPermissions) {
      throw new Error(`You don't have necessary permissiont to delete this`)
    }
    //delete
    return ctx.db.mutation.deleteItem({where}, info);
  },
  async signup(parent, args, ctx, info) {
    args.email = args.email.toLowerCase();
    const password = await bcrypt.hash(args.password, 10)
    const user = await ctx.db.mutation.createUser({
      data: {
        ...args,
        password,
        permissions: { set: ['USER']}
      }
    },
    info
    );
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET)
    ctx.response.cookie('token', token, cookieSettings);
    return user
  },
  async signin(parent, { email, password }, ctx, info) {
    //check if there is a user w/that email
      const user = await ctx.db.query.user({ where: { email }});
      if(!user) throw new Error('No such user found with that email');
    //check if pword is correct
      const valid = await bcrypt.compare(password, user.password);
      if(!valid) throw new Error('Invalid password');
    //generate JWT
      const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    //set cookie w/token
      ctx.response.cookie('token', token, cookieSettings)
    //return the user
      return user;
  },
  signout(parent, args ,ctx, info) {
    delete ctx.response.clearCookie('token')
    return { message: 'Successfully signed out '}
  },
  async requestReset(parent, args ,ctx, info) {
    //check if real user
    const user = await ctx.db.query.user({where: {
      email: args.email
    }});
    if(!user) throw new Error('No such user found with that email');
    //set rest token and expiry
    const resetToken = ( await promisify(randomBytes)(20)).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; //1 hour from now
    const res = await ctx.db.mutation.updateUser({
      where: { email: args.email },
      data: { resetToken, resetTokenExpiry}
    })
    
    //email reset token
    const mailResponse = await transport.sendMail({
      from: 'testEcom.com',
      to: user.email,
      subject: 'Your password reset token',
      html: makeNiceEmail(`Your password reset token is here
      \n\n <a href="${process.env.FRONTEND_URL}/reset?resetToken=${resetToken}">
      Click here to reset
      </a> `)
    })
    
    return { message: 'Reset request received'}
  },
  async resetPassword(parent, args ,ctx, info) {
      //check if passwords match
      const { password, confirmPassword, resetToken } = args;
      const valid = password === confirmPassword;
      if(!valid) throw new Error('Passwords do not match');

      //check if its a legit reset token
      //check if its expired
      const [user] = await ctx.db.query.users({
        where: {
          resetToken,
          resetTokenExpiry_gte: Date.now() - 3600000
        }
      });

      if(!user) throw new Error('Reset token is either invalid or expired')
      //hash their new password
      const newPassword = await bcrypt.hash(password, 10)
      //save new password to user an remove reset token
      
      const updatedUser = await ctx.db.mutation.updateUser({
        where: { email: user.email },
        data: { 
          password: newPassword,
          resetToken: null,
          resetTokenExpiry: null
         }
      });
      //generate JWT
      const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
      //set cookie w/token
      ctx.response.cookie('token', token, cookieSettings)
      //return new user
      return updatedUser;
  },  
  async addToCart(parent, args, ctx, info) {
    // make sure they're signed in
    const { userId } = ctx.request;
    if(!userId) throw new Error('You must be signed in')
    //query the users current cart
    const [existingCartItem] = await ctx.db.query.cartItems({
      where: {
        user: { id: userId },
        item: { id: args.id }
      },
    }, info)
    //check if item is already in cart and increment by 1 if is
    if(existingCartItem) {
      return await ctx.db.mutation.updateCartItem({ 
        where: { id: existingCartItem.id},
        data: { quantity: existingCartItem.quantity +1}
      });
    } 
     //if not, create fresh cart item
    return ctx.db.mutation.createCartItem({
      data: {
        user: {
          connect: { id: userId },
        },
        item: {
          connect: { id: args.id }
        }
      }
    }, info)   
  },
  async removeFromCart(parent, args, ctx, info) {
    // find cart item
    const cartItem = await ctx.db.query.cartItem({
      where: { id: args.id }
    }, `{ id, user { id } }`) 
    
    if(!cartItem) throw new Error('No cart item')
    // make sure they own cart item
    if(cartItem.user.id !== ctx.request.userId) {
      throw new Error('Not Authorized')
    }
    // delete cart item
    return await ctx.db.mutation.deleteCartItem({
      where: { id: args.id }
    }, info)
  },
  async createOrder(parent, args, ctx, info) {
    // query current user and make sure theyre signed in
    const { userId } = ctx.request;
    const { token } = args;
    if(!userId) throw new Error('you must be signed in to complete this order')
    const user = await ctx.db.query.user({
      where: {id: userId}
    }, `{
      id
      name
      email
      cart {
        id
        quantity
        item { title price id description image largeImage}
      }
    }`)
    // recalc the total for price
    const amount = user.cart.reduce((tally, item) => tally + item.item.price * item.quantity, 0)
     // create the stripe charge ( turn token into money)
    const charge = await stripe.charges.create({
      amount,
      currency: 'USD',
      source: token,
    })

    // convert cartItems to orderItems
    const orderItems = user.cart.map(cartItem => ({     
          title: cartItem.item.title,
          description: cartItem.item.description,
          image: cartItem.item.image,
          largeImage: cartItem.item.largeImage,
          price: cartItem.item.price,
          quantity: cartItem.quantity,
          user: { connect: { id: userId }}
        }
      ))
      
    // create order
    const order = await ctx.db.mutation.createOrder({
      data: {
        total: charge.amount,
        charge: charge.id,
        items: { create: orderItems },
        user: { connect: { id: userId }}
      }
    }, info).catch(err => {
      console.log(err)
      throw new Error('something went wrong')
    })
    // clean up - clear users cart, delete cart items.
    user.cart.forEach(async item => (
      await ctx.db.mutation.deleteCartItem({
        where: {
          id: item.id
        }
      })
    ))
    // return order to client
      return order
  }
}; 

module.exports = mutations;
