import React from "react";
import gql from "graphql-tag";
import formatDistance from 'date-fns/formatDistance';
import { Query } from "react-apollo";
import { ErrorMessage } from "formik";
import OrderItemStyles from "./styles/OrderItemStyles";
import formatMoney from "../lib/formatMoney";
import styled from "styled-components";
import Link from "next/link";

const GET_ORDERS_QUERY = gql`
  query GET_ORDERS_QUERY {
    orders(orderBy: createdAt_DESC) {
      id
      total
      createdAt
      items {
        id
        title
        price
        quantity
        description
        image
      }
    }
  }
`;

const orderUl = styled.ul`
  display: grid;
  grid-gap: 4rem;
  grid-template-columns: repeat(auto-fit, minmax(40%, 1fr));
`;

const Orders = props => {
  return (
    <Query query={GET_ORDERS_QUERY}>
      {({ data: { orders }, error, loading }) => {
        if (error) return <ErrorMessage error={error} />;
        return (
          <>
            <h2>You have {orders.length} orders</h2>
            <orderUl>
              {orders.map(order => (
                <OrderItemStyles key={order.id}>
                  <Link
                    href={{
                      pathname: "/order",
                      query: { id: order.id }
                    }}
                  >
                    <a>
                      <div className="order-meta">
                        <p>
                         {
                           order.items.reduce((a,b) => (
                             a + b.quantity
                           ), 0) 
                         } Items
                        </p>
                        <p>{order.items.length} Products</p>
                        <p>{formatDistance(order.createdAt, new Date())}</p>
                        <p>Total: {formatMoney(order.total)}</p>
                      </div>
                      <div className="images">{
                        order.items.map(item => (
                          <img key={item.id} src={item.image} alt={item.title}/>
                        )) 
                      }</div>
                    </a>
                  </Link>            
                </OrderItemStyles>
              ))}
            </orderUl>
          </>
        );
      }}
    </Query>
  );
};

export default Orders;
