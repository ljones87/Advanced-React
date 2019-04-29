import React, { useEffect } from "react";
import { Query, Mutation, compose, graphql } from "react-apollo";
import gql from "graphql-tag";
import { CURRENT_USER_QUERY } from "./User";
import CartStyles from "./styles/CartStyles";
import Supreme from "./styles/Supreme";
import CloseButton from "./styles/CloseButton";
import SickButton from "./styles/SickButton";
import CartItem from './CartItem';

const LOCAL_STATE_QUERY = gql`
  query {
    cartOpen @client
  }
`;

const TOGGLE_CART_MUTATION = gql`
  mutation {
    toggleCart @client
  }
`;

const Cart = props => {
  const {
    localStateQuery: { cartOpen },
    currentUserQuery: { me },
    toggleCart
  } = props;

  if (!me) return null;
  return (
    <CartStyles open={cartOpen}>
      <header>
        <CloseButton title="close" onClick={toggleCart}>
          &times;
        </CloseButton>
        <Supreme>{me.name}'s Cart</Supreme>
        <p>{`You have ${me.cart.length} Item${
          me.cart.length > 1 ? "s" : ""
        } in your cart.`}</p>
      </header>
      <ul>
        {me.cart.map(item => (
          <CartItem key={item.id} 
            cartItem={item}
          />
        ))}
      </ul>
      <footer>
        <p>$100</p>
        <SickButton>Checkout</SickButton>
      </footer>
    </CartStyles>
  );
};

export default compose(
  graphql(LOCAL_STATE_QUERY, { name: "localStateQuery" }),
  graphql(CURRENT_USER_QUERY, { name: "currentUserQuery" }),
  graphql(TOGGLE_CART_MUTATION, { name: "toggleCart" })
)(Cart);

export { LOCAL_STATE_QUERY, TOGGLE_CART_MUTATION, CURRENT_USER_QUERY };
