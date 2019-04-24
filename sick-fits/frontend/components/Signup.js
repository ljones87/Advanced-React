import React, { Component, useState } from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import { graphql, compose } from "react-apollo";
import { withFormik, Formik, Field, Form as FormikForm } from "formik";

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

const handleSubmit = (values, { props, resetForm, setErrors, setSubmitting }) => {
  props.mutate({ variables: values }).then(() => {
    resetForm();
  })
  .catch(err => {
      setErrors(err)
      setSubmitting(false)
  })
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
          <label>Email</label>
          <Field type={email} name={email} placeholder="Email" />
          <label>Name</label>
          <Field type={name} name={name} placeholder="Name" />
          <label>Password</label>
          <Field type={password} name={password} placeholder="Password" />
        </fieldset>
        <button type="submit">Submit</button>
      </FormikForm>
    </StyledForm>
  );
};

Signup = compose(
  graphql(SIGNUP_MUTATION),
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
