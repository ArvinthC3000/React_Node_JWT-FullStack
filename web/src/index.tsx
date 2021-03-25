import React from 'react';
import ReactDOM from 'react-dom';
// import ApolloClient, { InMemoryCache } from "apollo-boost";
import App from './App';
// import { ApolloProvider } from '@apollo/react-hooks';
import { ApolloProvider, ApolloClient, InMemoryCache } from '@apollo/client';



// const cache = new InMemoryCache();
// const link = ;


const client = new ApolloClient({
  uri: "http://localhost:4000/graphql",
  cache: new InMemoryCache()

})

ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
  ,
  // <React.StrictMode>
  // </React.StrictMode>,
  document.getElementById('root')
);

