import Link from "next/link";
import NavStyles from "./styles/NavStyles";
import gql from "graphql-tag";
import { graphql, compose } from "react-apollo";
import { TOGGLE_CART_MUTATION } from "./Cart";
import { CURRENT_USER_QUERY } from "./User";

import SignOut from "./SignOut";

const Nav = ({ toggleCart, data: { me } }) => (
  <NavStyles>
    <Link href="/items">
      <a>Shop</a>
    </Link>
    {me && (
      <>
        <Link href="/sell">
          <a>Sell</a>
        </Link>
        <Link href="/me">
          <a>Account</a>
        </Link>
        <Link href="/orders">
          <a>Orders</a>
        </Link>
        <SignOut />
        <button onClick={toggleCart}>My Cart</button>
      </>
    )}
    {!me && (
      <Link href="/signup">
        <a>Sign In</a>
      </Link>
    )}
  </NavStyles>
);

export default compose(
  graphql(TOGGLE_CART_MUTATION, { name: "toggleCart" }),
  graphql(CURRENT_USER_QUERY)
)(Nav);
