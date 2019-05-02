import React, { useState } from "react";
import Downshift, {resetIdCounter} from "downshift";
import Router from "next/router";
import { ApolloConsumer } from "react-apollo";
import gql from "graphql-tag";
import debounce from "lodash/debounce";
import {
  SearchStyles,
  DropDownItem,
  DropDown
} from "./styles/DropDown";

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
      description
    }
  }
`;

const componentOnChange = debounce(async (e, client, stat, updateFunc) => {
  console.log("searching");
  updateFunc(() => ({ ...stat, loading: true }));
  const res = await client.query({
    query: SEARCH_ITEMS_QUERY,
    variables: { 
      searchTerm: e.target.value 
    }
  });

  updateFunc(() => ({ items: res.data.items, loading: false }));
}, 350);

const routeToItem = (item) => {
  Router.push({
    pathname: '/item',
    query: {
      id: item.id
    }
  })
}
const AutoComplete = () => {
  const [status, updateStatus] = useState({
    items: [],
    loading: false
  });

  resetIdCounter()
  return (
    <SearchStyles>
      <Downshift 
        onChange={routeToItem}
        itemToString={item => (item === null? '' : item.title)}>
        { ({
          getInputProps,
          getItemProps,
          isOpen,
          inputValue,
          highlightedIndex
        }) => (
            <div>
              <ApolloConsumer>
                {client => (
                  <input
                    {...getInputProps({
                      type: "search",
                      placeholder: "Search for an item",
                      id: "search",
                      className: status.loading ? "loading" : "",
                      onChange: e => {
                        e.persist();
                        componentOnChange(e, client, status, updateStatus);
                      }
                    })}
                  />
                )}
              </ApolloConsumer>
              {isOpen && (
                <DropDown>
                  {status.items.map((item, i) => (
                    <DropDownItem 
                      {...getItemProps({item})}
                      key={item.id}
                      highlighted={i === highlightedIndex}
                    >
                      <img width="50" src={item.image} alt={item.title} />
                      {`${item.title} - ${item.description}`}
                    </DropDownItem>
                  ))}
                  {!status.items.length && !status.loading && (
                    <DropDownItem>
                      Nothing found for {inputValue}
                    </DropDownItem>
                  )}
                </DropDown>
              )}
            </div>
          )}
      </Downshift>
    </SearchStyles>
  );
};

export default AutoComplete;
