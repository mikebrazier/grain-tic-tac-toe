import { ApolloClient, InMemoryCache } from '@apollo/client'
import { GRAPHQL_SERVER } from './FrontendProxy/FrontendProxy'

const defaultOptions = {
  watchQuery: {
    // fetchPolicy: 'cache-and-network',
    // errorPolicy: 'ignore',
  },
  query: {
    fetchPolicy: 'no-cache',
    // errorPolicy: 'all',
  },
  mutate: {
    // errorPolicy: 'all',
  },

};

export const makeApolloNextClient = () => new ApolloClient({
  uri: GRAPHQL_SERVER,
  cache: new InMemoryCache(),
  //   @ts-ignore
  defaultOptions: defaultOptions
});