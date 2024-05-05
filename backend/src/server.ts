import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { Context, createContext } from './context';
import { schema } from './schema';
import express from 'express';
import moviesImages from './assets/moviesImages';

const cors = require('cors');
const app = express();
app.use(cors());

const server = new ApolloServer<Context>({ schema })
startStandaloneServer(server, {
  context: createContext
}).then(({ url }) => {
  console.log(`\
    🚀 Server ready at: ${url}
    ⭐️ See sample queries: http://pris.ly/e/ts/graphql-auth#using-the-graphql-api`,
  );
})

app.post('/downloadMoviesImages', (req,res) => {
  res.send(JSON.stringify(moviesImages));
});

app.listen(4001);