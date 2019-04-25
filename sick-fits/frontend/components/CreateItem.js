import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import Router from 'next/router'
import Form from './styles/StyledForm';
import formatMoney from '../lib/formatMoney';
import gql from 'graphql-tag';
import Error from './ErrorMessage';
import { CLOUD_URL } from '../secrets';

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

export default class CreateItem extends Component {
  state = {
    title: '',
    price: 0,
    description: '',
    image: '',
    largeImage: '',
  }

  handleChange = (e) => {
    const { name, type, value } = e.target;
    const val = type == 'number' ? parseFloat(value) : value;
    this.setState({ [name]: val })
  }

   uploadFile = async (e) => {
    console.log('..uploading file');
    const { files } = e.target;
    const data = new FormData();
    data.append('file', files[0])
    data.append('upload_preset', 'sickfits')
    const res = await fetch(CLOUD_URL, {
      method: 'POST',
      body: data
    })
    const file = await res.json()
    this.setState({
      image: file.secure_url,
      largeImage: file.eager[0].secure_url
    })
  }

  createItem = async (e) => {
    console.log('SUBMIT CLICKED')
    e.preventDefault();
    const res = await createItem(this.state)
    Router.push({
      pathname: '/item',
      query: { id: res.data.createItem.id}
    })
  }

  render() {
    return (
      <Mutation mutation={CREATE_ITEM_MUTATION} variables={this.state}>
        {(createItem, { loading, error, called, data }) => (
          <Form >
            <Error error={error} />
            <fieldset disabled={loading} aria-busy={loading}>
            <label htmlFor="title">File
              <input
                type="file"
                id="file"
                name="file"
                placeholder="Upload File"
                required
                onChange={this.uploadFile}
              />
              {this.state.image && <img src={this.state.image} alt="upload preview" /> }
            </label>
              <label htmlFor="title">Title
                <input
                  type="text"
                  id="title"
                  name="title"
                  placeholder="Title"
                  required
                  value={this.state.title}
                  onChange={this.handleChange}
                />
              </label>
              <label htmlFor="price">Price
                 <input
                  type="number"
                  id="price"
                  name="price"
                  placeholder="Price"
                  required
                  value={this.state.price}
                  onChange={this.handleChange}
                />
              </label>
              <label htmlFor="description">Description
                 <textarea
                  type="text"
                  id="description"
                  name="description"
                  placeholder="Enter A Description"
                  required
                  value={this.state.description}
                  onChange={this.handleChange}
                />
              </label>
              <button type="submit" onClick={createItem}>Submit</button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    )
  }
}
