import { graphql, compose } from "react-apollo";
import { useState, useEffect } from "react";
import { CURRENT_USER_QUERY } from "./User";
import SignIn from "./SignIn";

const PleaseSignIn = props => {
  const {
    data: { refetch }
  } = props;
  const [user, setUser] = useState();
  useEffect(() => {
    const fetchUser = async () => {
      const user = await refetch(CURRENT_USER_QUERY);

      setUser(user.data.me);
    };
    fetchUser();
  }, {});

  if (!user) {
    return (
      <div>
        <p>Please sign in before continuting</p>
        <SignIn />
      </div>
    );
  }
  return props.children;
};

export default compose(graphql(CURRENT_USER_QUERY))(PleaseSignIn);
