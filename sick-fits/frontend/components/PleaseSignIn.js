import { Query } from "react-apollo";
import { CURRENT_USER_QUERY } from "./User";
import SignIn from "./SignIn";

const PleaseSignIn = props => (
  <Query query={CURRENT_USER_QUERY}>
    {({ data, loading }) => {
      console.log(data)
      if (loading) return <p>loading</p>;
      if (!data.me)
        return (
          <div>
            <p>Please Sign In to Continue</p>
            <SignIn />
          </div>
        );
       else return props.children;
    }}
  </Query>
);

export default PleaseSignIn



/*
USING HOCS AND HOOKS
import { graphql, compose} from "react-apollo";
import { useState, useMemo } from "react";
import { CURRENT_USER_QUERY } from "./User";
import SignIn from "./SignIn";

const PleaseSignIn = props => (
  //   const {
  //     data: { refetch }
  //   } = props;
  //   const [user, setUser] = useState();

  //   useMemo(() => {
  //     const fetchUser = async () => {
  //       const user = await refetch(CURRENT_USER_QUERY);
  //       setUser(user.data.me);
  //     };
  //     fetchUser();
  //   }, [{}]);

  //   if (!user) {
  //     return (
  //       <div>
  //         <p>Please sign in before continuting</p>
  //         <SignIn />
  //       </div>
  //     );
  //   }

//);

export default compose(graphql(CURRENT_USER_QUERY))(PleaseSignIn);

*/