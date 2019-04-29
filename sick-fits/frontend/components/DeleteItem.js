import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import { ALL_ITEMS_QUERY } from './Items';

const DELETE_ITEM_MUTATION = gql`
  mutation DELETE_ITEM_MUTATION($id: ID!) {
    deleteItem(id: $id) {
      id
    }
  }
`;

export default class DeleteItem extends Component {
  update = (cache, payload) => {
   //manually update cache on client so it matches server
    const data = cache.readQuery({ query: ALL_ITEMS_QUERY });
    //2 filter deleted item out of cache/page
    const removedItemId = payload.data.deleteItem.id
    data.items = data.items.filter(item => item.id !== removedItemId)
    //3. put items back/update cache
    cache.writeQuery({ query: ALL_ITEMS_QUERY, data });
  }

  render() {
    return (
      <Mutation
        mutation={DELETE_ITEM_MUTATION}
        variables={{
          id: this.props.id
        }}
        update={this.update}
        >
      {(deleteItem, { error} ) => (
        <button
          onClick={() => {
            if (confirm('Are you sure you want to remove this item?')) {
              deleteItem().catch(err => {
                alert(err.message)
              })
            };
          }}
        >{this.props.children}</button>
      )}

      </Mutation>
    )
  }
}
