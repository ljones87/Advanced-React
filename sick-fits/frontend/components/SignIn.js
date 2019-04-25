import React, { useMemo } from "react";
import gql from "graphql-tag";
import Cookies from 'js-cookie';
import { graphql, compose, Mutation, Query } from "react-apollo";
import { withFormik, Field, Form as FormikForm } from "formik";
import { CURRENT_USER_QUERY } from './User';

import StyledForm from "./styles/StyledForm";
import Error from "./ErrorMessage";


const SIGNIN_MUTATION = gql`
  mutation SIGNIN_MUTATION(
    $email: String!
    $password: String!
  ) {
    signin(email: $email, password: $password) {
      id
      email
      name
    }
  }
`;

const handleSubmit = (
  values,
  { props, resetForm, setErrors, setSubmitting }
) => {
  const { refetch } = props.data
  props
    .mutate({ variables: values })
    .then(() => {
      refetch(CURRENT_USER_QUERY)
      resetForm();
    })
    .catch(err => {
      setErrors(err);
      setSubmitting(false);
    });
};

let SignIn = props => {
  const email = "email";
  const password = "password";
  const { isSubmitting, errors } = props;

  return (

    <StyledForm>
      <FormikForm method="post" onSubmit={props.handleSubmit}>
        <fieldset disabled={isSubmitting} aria-busy={isSubmitting}>
          <h2>Sign In</h2>
          <Error error={errors} />
          <label>
            Email
            <Field type={email} name={email} placeholder="Email" />
          </label>
          <label>
            Password
            <Field type={password} name={password} placeholder="Password" />
          </label>
          <button type="submit">Submit</button>
        </fieldset>
      </FormikForm>
    </StyledForm>
  );
};

SignIn = compose(
  graphql(SIGNIN_MUTATION),
  graphql(CURRENT_USER_QUERY),
  withFormik({
    mapPropsToValues({ email, password }) {
      return {
        email: email || "",
        password: password || "",
      };
    },
    handleSubmit
  })
)(SignIn);

export default SignIn;
