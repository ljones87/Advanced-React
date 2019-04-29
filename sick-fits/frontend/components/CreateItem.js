import React, { useState } from "react";
import { Mutation, compose, graphql } from "react-apollo";
import Router from "next/router";
import Form from "./styles/StyledForm";
import { withFormik, Field, Form as FormikForm } from "formik";
import formatMoney from "../lib/formatMoney";
import gql from "graphql-tag";
import Error from "./ErrorMessage";
import { CLOUD_URL } from "../secrets";

export const CREATE_ITEM_MUTATION = gql`
  mutation CREATE_ITEM_MUTATION(
    $title: String!
    $price: Int!
    $description: String!
    $image: String
    $largeImage: String
  ) {
    createItem(
      title: $title
      price: $price
      description: $description
      image: $image
      largeImage: $largeImage
    ) {
      id
    }
  }
`;

const handleSubmit = (
  item,
  { props, resetForm, setErrors, setSubmitting }
) => {
  console.log(props)
  props
    .createItem({ variables: item })
    .then(res => {
      resetForm();
      Router.push({
        pathname: "/item",
        query: { id: res.data.createItem.id }
      });
    })
    .catch(err => {
      setErrors(err);
      setSubmitting(false);
    });
};

let CreateItem = props => {

  const uploadFile = async e => {
    console.log("..uploading file");
    const { files } = e.target;
    const { values, setFieldValue } = props;
    const data = new FormData();
    data.append("file", files[0]);
    data.append("upload_preset", "sickfits");
    const res = await fetch(CLOUD_URL, {
      method: "POST",
      body: data
    });
    const file = await res.json();
    setFieldValue('image', file.secure_url)
    setFieldValue('largeImage', file.eager[0].secure_url)
    console.log("upload complete");
  };

  const { isSubmitting, errors, values  } = props;

  return (
      <Form>
        <FormikForm method="post" onSubmit={props.handleSubmit}>
          <Error error={errors} />
          <fieldset disabled={isSubmitting} aria-busy={isSubmitting}>
            <label htmlFor="title">
              File
              <input
                type="file"
                id="file"
                name="file"
                placeholder="Upload File"
                required
                onChange={uploadFile}
              />
              {values.image && (
                <img src={values.image} alt="upload preview" />
              )}
            </label>
            <label htmlFor="title">
              Title
              <Field 
                type="text"
                id="text"
                placeholder="Title"
                required
                name="title"
              />
            </label>
            <label htmlFor="price">
              Price
              <Field 
                type="number"
                id="price"
                placeholder="Price"
                required
                name="price"
              />
            </label>
            <label htmlFor="description">
              Description
              <Field 
                type="textarea"
                name="description"
                placeholder="Description"
              />
            </label>
            <button type="submit">Submit</button>
          </fieldset>
          </FormikForm>
        </Form>
  );
}

export default compose(
  graphql(CREATE_ITEM_MUTATION, { name: 'createItem'}),
  withFormik({
    mapPropsToValues({ title, price, description, image, largeImage}) {
      return {
        title: title || '',
        price: price || '',
        description: description || '',
        image: image || '',
        largeImage: largeImage || ''
      }
    },
    handleSubmit
  })
)(CreateItem)
