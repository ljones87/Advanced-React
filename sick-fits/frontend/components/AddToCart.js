import React from 'react'
import { compose, graphql } from  'react-apollo';
import { CURRENT_USER_QUERY } from './User';
import gql from 'graphql-tag';

const ADD_TO_CART_MUTATION = gql`
  mutation addToCart($id: ID!) {
    addToCart(id: $id) {
      id
      quantity
    }
  }
`

let AddToCart = props => {
  const { id, addToCart, currentUserQuery: { refetch, error, loading } } = props;

  const addToCartHandler = () => {
    addToCart(id)
     .then(() => {
      refetch(CURRENT_USER_QUERY)
    }).catch(err => {
   
    })
  }
    
  return(
    <button 
      onClick={addToCartHandler}
      disabled={loading}
      >Add To Cart</button>
  )
}

export default compose(
  graphql(ADD_TO_CART_MUTATION, { name: 'addToCart' }),
  graphql(CURRENT_USER_QUERY, { name: 'currentUserQuery' })
)(AddToCart)