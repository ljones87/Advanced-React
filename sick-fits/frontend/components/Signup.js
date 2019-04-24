import React, { Component, useState } from "react";
import gql from "graphql-tag";
import { graphql, compose } from "react-apollo";
import { withFormik, Field, Form as FormikForm } from "formik";
import { CURRENT_USER_QUERY } from './User';

import StyledForm from "./styles/StyledForm";
import Error from "./ErrorMessage";

const SIGNUP_MUTATION = gql`
  mutation SIGNUP_MUTATION(
    $email: String!
    $name: String!
    $password: String!
  ) {
    signup(email: $email, name: $name, password: $password) {
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

let Signup = props => {
  const email = "email";
  const password = "password";
  const name = "name";
  const { isSubmitting, errors } = props;

  return (
    <StyledForm>
      <FormikForm method="post" onSubmit={props.handleSubmit}>
        <fieldset disabled={isSubmitting} aria-busy={isSubmitting}>
          <h2>Sign up for account</h2>
          <Error error={errors} />
          <label>
            Email
            <Field type={email} name={email} placeholder="Email" />
          </label>
          <label>
            Name
            <Field type={name} name={name} placeholder="Name" />
          </label>
          <label>
            Password
            <Field type={password} name={password} placeholder="Password" />
          </label>
          <button type="submit">Sign Up</button>
        </fieldset>
      </FormikForm>
    </StyledForm>
  );
};

Signup = compose(
  graphql(SIGNUP_MUTATION),
  graphql(CURRENT_USER_QUERY),
  withFormik({
    mapPropsToValues({ email, password, name }) {
      return {
        email: email || "",
        password: password || "",
        name: name || ""
      };
    },
    handleSubmit
  })
)(Signup);

export default Signup;
