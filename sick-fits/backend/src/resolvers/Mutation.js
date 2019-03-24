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
    }, info
    )
  },
  async deleteItem(parent, args, ctx, info) {
    const where = { id: args.id };
    // 1 find item
    const item = await ctx.db.query.item({ where }, `{id title}`)
    //2 check if person deleting it downs it/has permissions
     //todo
    //delete
    return ctx.db.mutation.deleteItem({where}, info);
  }
};

module.exports = mutations;
