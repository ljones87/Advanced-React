import React, { useState } from "react";
import Downshift from "downshift";
import Router from "next/router";
import { ApolloConsumer } from "react-apollo";
import gql from "graphql-tag";
import debounce from "lodash/debounce";
import { SearchStyles, DropDrownItem, DropDown, DropDownItem } from "./styles/DropDown";

const SEARCH_ITEMS_QUERY = gql`
  query SEARCH_ITEMS_QUERY($searchTerm: String!) {
    items(
      where: {
        OR: [
          { title_contains: $searchTerm }
          { description_contains: $searchTerm }
        ]
      }
    ) {
      id
      image
      title
    }
  }
`;
const AutoComplete = props => {
  const [status, updateStatus] = useState({
    items: [],
    loading: false
  });
  const componentOnChange = debounce(async (e, client) => {
    console.log("searching");
    updateStatus(() => ({ ...status, loading: true }));
    const res = await client.query({
      query: SEARCH_ITEMS_QUERY,
      variables: { searchTerm: e.target.value }
    });
    console.log(res);
    updateStatus(() => ({ items: res.data.items, loading: false }));
  }, 350);
  return (
    <SearchStyles>
      <div>
        <ApolloConsumer>
          {client => (
            <input
              type="search"
              onChange={e => {
                e.persist();
                componentOnChange(e, client);
              }}
            />
          )}
        </ApolloConsumer>
        {status.items.map(item => (
          <DropDownItem key={item.id}>
            <img width="50" src={item.image} alt={item.title} />
            {item.title}
          </DropDownItem>
        ))}
      </div>
    </SearchStyles>
  );
};

export default AutoComplete;
