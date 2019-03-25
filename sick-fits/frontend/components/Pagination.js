import React, { Component } from 'react'
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import { perPage } from '../config';
import PaginationStyles from './styles/PaginationStyles';
import Error from './ErrorMessage';

const PAGINATION_QUERY = gql`
  query PAGINATION_QUERY {
    itemsConnection {
      aggregate {
        count
      }
    }
  }
`;

const Pagination = props => {
  console.log("PAGE PROPS", props)
  return <PaginationStyles>
    <Query query={PAGINATION_QUERY}>
      {({ data, loading, error }) => {
        if (loading) return <p>Loading...</p>;
        if (error) return <Error error={error} />;
        const count = data.itemsConnection.aggregate.count;
        const pages = Math.ceil(count / perPage);
        return <p>{`on page ${1} of ${pages}`}</p>;
      }}
    </Query>
  </PaginationStyles>
    };

export default Pagination;
