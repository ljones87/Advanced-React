import React from "react";
import gql from "graphql-tag";
import { graphql, compose } from "react-apollo";
import { withFormik, Field, Form as FormikForm } from "formik";

import StyledForm from "./styles/StyledForm";
import Error from "./ErrorMessage";


const RESET_MUTATION = gql`
  mutation RESET_MUTATION(
    $password: String!, $confirmPassword: String!, $resetToken: String!
  ) {
    resetPassword(
        password: $password, 
        confirmPassword: $confirmPassword, 
        resetToken: $resetToken) {
      id
      email 
      name
    }
  }
`;

const handleSubmit = (
  values,
  { props, resetForm, setErrors, setSubmitting, setStatus }
) => {
  props
    .resetPassword({ variables: values })
    .then((res) => {
      resetForm();
      setStatus(res.data.resetPassword)
    })
    .catch(err => {
      setErrors(err);
      setSubmitting(false);
    });
};

let RequestReset = props => {
  const password = "password";
  const confirmPassword = "confirmPassword"
  const { isSubmitting, errors, status } = props;
  const resetToken = props.resetToken;
    console.log(props)
  return (

    <StyledForm>
      <FormikForm method="post" onSubmit={props.handleSubmit}>
        <fieldset disabled={isSubmitting} aria-busy={isSubmitting}>
          <h2>Reset Your Password</h2>
          <Error error={errors} />
          {!isSubmitting && status && status.name &&
          <p>{`Thanks ${status.name}! Password successfully reset`}</p>
          }
          <label>
            New Password
            <Field type={password} name={password} placeholder="Enter new password" />
          </label>
          <label>
            Confirm Password
            <Field type={password} name={confirmPassword} placeholder="Confirm Password" />
          </label>
          <Field type="hidden" value={resetToken} name="resetToken" />
          <button type="submit">Submit New Password</button>
        </fieldset>
      </FormikForm>
    </StyledForm>
  );
};

RequestReset = compose(
  graphql(RESET_MUTATION, { name: 'resetPassword' }),
  withFormik({
    mapPropsToValues({ password, confirmPassword, resetToken}) {
      return {
        password: password || "",
        confirmPassword: confirmPassword || "",
        resetToken
      };
    },
    handleSubmit
  })
)(RequestReset);

export default RequestReset;
