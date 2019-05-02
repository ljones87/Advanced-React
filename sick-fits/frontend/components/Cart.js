import React from "react";
import { compose, graphql, Mutation, Query } from "react-apollo";
import gql from "graphql-tag";
// import { adopt } from 'react-adopt';
import formatMoney from "../lib/formatMoney";
import { CURRENT_USER_QUERY } from "./User";
import CartStyles from "./styles/CartStyles";
import Supreme from "./styles/Supreme";
import CloseButton from "./styles/CloseButton";
import SickButton from "./styles/SickButton";
import CartItem from "./CartItem";
import TakeMoney from './TakeMoney';

// const Composed = adopt({
//   user: <User />,
//   toggleCart: <Mutation mutation={TOGGLE_CART_MUTATION} />,
//   localState: <Query query={LOCAL_STATE_QUERY} />
// });

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

const totalPriceCalc = me => {
  const total = me.cart.reduce((a, b) => {
    if (!b.item) return a;
    return (a += b.item.price * b.quantity);
  }, 0);
  return formatMoney(total);
};

const cartItemList = me =>
  me.cart.map(item => <CartItem key={item.id} cartItem={item} />);

const Cart = props => {
  const {
    localStateQuery: { cartOpen },
    currentUserQuery: { me },
    toggleCart
  } = props;

  const formattedTotal = me ? totalPriceCalc(me) : null;
  const cartItems = me? cartItemList(me): null;
  
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
      <ul>{cartItems}</ul>
      <footer>
      <p>{formattedTotal}</p>
      {me.cart.length ? 
          <TakeMoney>
            <SickButton>Checkout</SickButton>
          </TakeMoney>
          : null
        }
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
