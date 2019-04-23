import React, { Component, useState } from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import { withFormik, Formik, Field, Form as FormikForm } from "formik";

import StyledForm from "./styles/StyledForm";
import Error from "./ErrorMessage";

let Signup = props => {
  const email = "email";
  const password = "password";
  const name = "name";

  return (
    <StyledForm>
      <FormikForm>
        <fieldset>
          <h2>Sign up for account</h2>
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

Signup = withFormik({
  mapPropsToValues({ email, password, name }) {
      return {
        email: email || '',
        password: password || '',
        name: name || ''
      }
  },
  handleSubmit(values, { resetForm, setErrors }) {
    console.log(values);
    resetForm();
    setErrors();
  }
})(Signup);

export default Signup;
