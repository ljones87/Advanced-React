import { Query } from "react-apollo";
import Error from "./ErrorMessage";
import gql from "graphql-tag";
import { useState } from "react";
import PropTypes from "prop-types";
import Table from "./styles/Table";
import SickButton from "./styles/SickButton";

const ALL_USERS_QUERY = gql`
  query ALL_USERS_QUERY {
    users {
      id
      name
      email
      permissions
    }
  }
`;

const possiblePermissions = [
  "ADMIN",
  "USER",
  "ITEMCREATE",
  "ITEMUPDATE",
  "ITEMDELETE",
  "PERMISSIONUPDATE"
];

const Permissions = props => (
  <Query query={ALL_USERS_QUERY}>
    {({ data, loading, error }) => (
      <div>
        <Error error={error} />
        <div>
          <h2>Manage Permissions</h2>
          <Table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                {possiblePermissions.map(permission => (
                  <th key={permission}>{permission}</th>
                ))}
                <th />
              </tr>
            </thead>
            <tbody>
              {data.users.map(user => (
                <UserPermissions 
                  user={user}
                  key={user.id}
                 />
              ))}
            </tbody>
          </Table>
        </div>
      </div>
    )}
  </Query>
);

const UserPermissions = ({ user }) => {
  const [permissions, setPermissions] = useState(user.permissions);
  const handlePermissionChange = e => {
      const checkbox = e.target;
      const { value } = e.target;
      let updatedPermissions = [...permissions];

      if(checkbox.checked) {
          updatedPermissions.push(value)
          setPermissions(updatedPermissions)
      } else {
        updatedPermissions =  updatedPermissions.filter(p => p !== value)
        setPermissions(updatedPermissions)
      }
  }
  return (
    <tr>
      <td>{user.name}</td>
      <td>{user.email}</td>
      {possiblePermissions.map(permission => (
        <td key={permission}>
          <label htmlFor={`${user.id}-permission-${permission}`} onChange={handlePermissionChange}>
            <input 
              id={`${user.id}-permission-${permission}`}
              type="checkbox" 
              value={permission}
              checked={permissions.includes(permission)}
             
            />
          </label>
        </td>
      ))}
      <td>
        <SickButton>Update</SickButton>
      </td>
    </tr>
  );
};

UserPermissions.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    id: PropTypes.string,
    permissions: PropTypes.array
  }).isRequired
};

export default Permissions;
