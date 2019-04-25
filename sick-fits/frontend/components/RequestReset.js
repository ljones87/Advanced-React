import React from "react";
import gql from "graphql-tag";
import { graphql, compose } from "react-apollo";
import { withFormik, Field, Form as FormikForm } from "formik";

import StyledForm from "./styles/StyledForm";
import Error from "./ErrorMessage";


const REQUEST_RESET_MUTATION = gql`
  mutation REQUEST_RESET_MUTATION(
    $email: String!
  ) {
    requestReset(email: $email) {
      message
    }
  }
`;

const handleSubmit = (
  values,
  { props, resetForm, setErrors, setSubmitting, setStatus }
) => {
  props
    .resetRequest({ variables: values })
    .then((res) => {
      resetForm();
      setStatus(res.data.requestReset)
    })
    .catch(err => {
      setErrors(err);
      setSubmitting(false);
    });
};

let RequestReset = props => {
  const email = "email";
  const { isSubmitting, errors, status } = props;
 
  return (

    <StyledForm>
      <FormikForm method="post" onSubmit={props.handleSubmit}>
        <fieldset disabled={isSubmitting} aria-busy={isSubmitting}>
          <h2>Request password reset</h2>
          <Error error={errors} />
          {!isSubmitting && status && status.message &&
          <p>Success check your email for reset link</p>
          }
          <label>
            Email
            <Field type={email} name={email} placeholder="Email" />
          </label>
          <button type="submit">Request Reset</button>
        </fieldset>
      </FormikForm>
    </StyledForm>
  );
};

RequestReset = compose(
  graphql(REQUEST_RESET_MUTATION, { name: 'resetRequest' }),
  withFormik({
    mapPropsToValues({ email }) {
      return {
        email: email || "",
      };
    },
    handleSubmit
  })
)(RequestReset);

export default RequestReset;
