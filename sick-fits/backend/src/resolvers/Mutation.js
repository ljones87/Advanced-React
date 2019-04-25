const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const { promisify } = require('util');
const { transport, makeNiceEmail } = require('../mail');

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
      data: { ...args }
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
    const item = await ctx.db.query.item({ where }, `{id title}`)
    //2 check if person deleting it downs it/has permissions
     //todo
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
  }
}; 

module.exports = mutations;
