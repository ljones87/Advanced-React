import React from "react";
import StripeCheckout from "react-stripe-checkout";
import { Mutation } from "react-apollo";
import Router from "next/router";
import gql from "graphql-tag";
import NProgress from "nprogress";
import calcTotalPrice from "../lib/calcTotalPrice";
import Error from "./ErrorMessage";
import User, { CURRENT_USER_QUERY } from "./User";

const CREATE_ORDER_MUTATION = gql`
  mutation createOrder($token: String!) {
    createOrder(token: $token) {
      id
      charge
      total
      items {
        id
        title
      }
    }
  }
`;

const totalItems = cart =>
  cart.reduce((tally, item) => {
    tally + item.quantity;
  }, 0);

const onToken = async (res, createOrder )=> {
NProgress.start()
const order = await createOrder({
    variables: {
      token: res.id
    }
  }).catch(err => alert(err.message))

  Router.push({
    pathname: '/order',
    query: { id: order.data.createOrder.id }
  })
};

const TakeMoney = props => {
  return (
    <>
      <User>
        {({ data: { me } }) => (
          <Mutation 
            mutation={CREATE_ORDER_MUTATION} 
            refetchQueries={[ {query: CURRENT_USER_QUERY} ]}>
            {createOrder => (
              <StripeCheckout
                amount={calcTotalPrice(me.cart)}
                name="sick fits"
                description={`Order of ${totalItems(me.cart)} items`}
                image={me.cart.length && me.cart[0].item.image}
                stripeKey="pk_test_owro2B6gR42iVBXPTSiENQuE00adgbwoj6"
                currency="USD"
                email={me.email}
                token={res => onToken(res, createOrder)}
              >
              {props.children}
            </StripeCheckout>
            )}
            
          </Mutation>
        )}
      </User>
    </>
  );
};

export default TakeMoney;
