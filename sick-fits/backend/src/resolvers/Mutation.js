const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const cookieSettings = {
  httpOnly: true,
  maxAge: 1000 * 60 * 60 * 24 * 30 // 1 month cookie
}

const mutations = {
  async createItem(parent, args, ctx, info) {
    //TODO: check if they're logged in
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
  async signout(parent, args ,ctx, info) {
    delete ctx.response.clearCookie('token')
    return { message: 'Successfully signed out '}
  }
}; 

module.exports = mutations;
