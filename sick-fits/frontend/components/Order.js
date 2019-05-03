import React from "react";
import { Query } from "react-apollo";
import { format } from "date-fns";
import Head from "next/head";
import gql from "graphql-tag";
import formatMoney from "../lib/formatMoney";
import Error from "./ErrorMessage";
import OrderStyles from "./styles/OrderStyles";
import OrderItemStyles from './styles/OrderItemStyles'
const SINGLE_ORDER_QUERY = gql`
  query SINGLE_ORDER_QUERY($id: ID!) {
    order(id: $id) {
      id
      total
      charge
      createdAt
      user {
        id
      }
      items {
        id
        title
        image
        price
        quantity
      }
    }
  }
`;

const Order = ({ id }) => {
  console.log("id", id);
  return (
    <Query query={SINGLE_ORDER_QUERY} variables={{ id }}>
      {({ data, error, loading }) => {
        const { order } = data;
        if (error) <Error error={error} />;
        if (loading) <p>Loading</p>;
        return (
          <OrderStyles>
            <Head>
              <title>Sick Fits - Order</title>
            </Head>
            <p>
              <span>Order Id:</span>
              <span>{order.id}</span>
            </p>
            <p>
              <span>Charge</span>
              <span>{order.charge}</span>
            </p>
            <p>
              <span>Date</span>
              <span>{format(order.createdAt, "MMM d, YYYY, h:mm a")}</span>
            </p>
            <p>
              <span>Item Quantity</span>
              <span>{order.items.length}</span>
            </p>
            <p>
              <span>Total</span>
              <span>{formatMoney(order.total)}</span>
            </p>
            <div className="items">
            {order.items.map(item => (
              <div className="order-item" key={item.id}>
                 <img src={item.image}  alt={item.title} />
                 <div className="item-details">
                    <p>Qty: {item.quantity}</p>
                    <p>Each: {formatMoney(item.price)}</p>
                    <p>SubTotal: {formatMoney(item.price *item.quantity)}</p>
                    <p>{item.description}</p>
                 </div>
              </div>
              
            ))}
            </div>
          </OrderStyles>
        );
      }}
    </Query>
  );
};

export default Order;
