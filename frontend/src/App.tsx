import './App.css';
import { InMemoryCache } from '@apollo/client';
import { ApolloClient, ApolloProvider } from '@apollo/client';
import { BrowserRouter, Route, Routes} from 'react-router-dom';
import Welcome from './sites/Welcome';
import Signup from './sites/Signup';
import { setContext } from 'apollo-link-context';
import { HttpLink } from '@apollo/client'; 
import Login from './sites/Login';
import IsAuthenticated from './components/IsAuthenticated';
import IsNotAuthenticated from './components/IsNotAuthenticated';
import Movies from './sites/Movies';

const httpLink = new HttpLink({uri:'http://localhost:4000'});
const authLink = setContext(async(request,{headers}) => {
  const token = localStorage.getItem("Movie App Authentication Token");
  return {
    ...headers,
    headers: {
      Authorization: token ? `Bearer ${token}` : null
    }
  }
});

const aLink = authLink.concat(httpLink as any);
export const aClient = new ApolloClient({
  link: aLink as any,
  cache: new InMemoryCache()
});

function App() {
  return (
    <ApolloProvider client={aClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<IsAuthenticated />}>
            <Route path='/movies' element={<Movies />} />
          </Route>
          <Route element={<IsNotAuthenticated />}>
            <Route path='/' element={<Welcome />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ApolloProvider>
  );
}

export default App;