import Link from "next/link";
import NavStyles from "./styles/NavStyles";
import User from "../components/User";
import gql from 'graphql-tag';
import { graphql, compose } from 'react-apollo';
import SignOut from './SignOut';


const Nav = props => (
  <User>
    {({ data: { me } }) => (
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
        </>
        )}
        {!me && (
            <Link href="/signup">
            <a>Sign In</a>
          </Link>
        )}
      </NavStyles>
    )}
  </User>
);

export default Nav;
