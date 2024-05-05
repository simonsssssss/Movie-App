import { gql, useQuery } from '@apollo/client';
import { Navigate, Outlet, useLocation  } from "react-router-dom";

const IS_LOGGED_IN = gql`
{
    me {
        id
    }
}
`;

export default function IsAuthenticated(){
    const {loading, error, data} = useQuery(IS_LOGGED_IN); // loading state, error state and data returned by the query
    const location = useLocation(); // returns the location object from the current URL
    if(loading) return '';
    if(error) return <Navigate to='/' replace />; // returns text "Not Authorised!"; "replace" won't let you go back to a certain page in a browser and "state" allows to store information in a history state
    return data.me ? <Outlet /> : null; // "<Outlet />" renders the child route's element
}