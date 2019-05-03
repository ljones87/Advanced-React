const { forwardTo } = require('prisma-binding');
const { hasPermission } = require('../utils');
const Query = {
  items: forwardTo('db'),
  item: forwardTo('db'),
  itemsConnection: forwardTo('db'),
  me(parent, args, ctx, info) {
    //check if there is a current userId
    if(!ctx.request.userId) {
      return null;
    } 
    return ctx.db.query.user({
      where: { id: ctx.request.userId }
    }, info)
  },
  async users(parent, args, ctx, info) {
    //check if logged in
    if(!ctx.request.userId) throw new Error('You must be logged in')
    //check if user has permissions to query all users
    hasPermission(ctx.request.user, ['ADMIN', 'PERMISSIONUPDATE']);
    // if they do, query all users
    return ctx.db.query.users({}, info)
      
  },
  async order(parent, args, ctx, info) {
    // 1 make sure they're logged in
    console.log('CTX', ctx)
    console.log('Info', info)
    console.log('args', args)
    console.log('parent', parent)
    if(!ctx.request.userId) {
      throw new Error('You are not logged in ')
    }
    const order = await ctx.db.query.order({
      where: { id: args.id },
    }, info);
    // query the curent order

    // check if have permissions
    const ownsOrder = order.user.id === ctx.request.userId
    const hasPermission = ctx.request.user.permissions.includes('ADMIN')
    if(!ownsOrder | !hasPermission) {
      throw new Error('Not allowed')
    }
    // return order
    return order;
  }
};

module.exports = Query;
