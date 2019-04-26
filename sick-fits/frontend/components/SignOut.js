import { graphql, compose, Mutation } from "react-apollo";
import gql from "graphql-tag";
import PropTypes from "prop-types";
import { CURRENT_USER_QUERY } from "./User";
import { useEffect } from 'react'

const SIGN_OUT = gql`
  mutation SIGN_OUT {
    signout {
      message
    }
  }
`;

const SignOut = props => {
  const { mutate, data: { refetch} } = props;
  const signout = () =>  {
      mutate().then(() => {
        refetch(CURRENT_USER_QUERY)
      })
  }
  return (
    <button onClick={signout}>
      Sign Out
    </button>
  );
};

export default compose(
  graphql(SIGN_OUT),
  graphql(CURRENT_USER_QUERY)
)(SignOut);
