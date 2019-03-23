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
  }
};

module.exports = mutations;
