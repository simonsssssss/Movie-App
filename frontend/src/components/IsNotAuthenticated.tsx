import { gql, useQuery } from '@apollo/client';
import { Navigate, Outlet, useLocation  } from "react-router-dom";

const IS_LOGGED_IN = gql`
{
    me {
        id
    }
}
`;

export default function IsNotAuthenticated(){
    const {loading, error, data} = useQuery(IS_LOGGED_IN); // loading state, error state and data returned by the query
    const location = useLocation(); // returns the location object from the current URL
    if(loading) return '';
    if(error) { // when not authenticated
        return <Outlet />;
    }
    else { // when authenticated
        return data.me ? <Navigate to='/movies' replace /> : null;
    }
}