import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { split, HttpLink } from '@apollo/client';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { ApolloClient, InMemoryCache } from "@apollo/client";


export function makeBrowserApolloClient()
{
    const httpLink = new HttpLink({
        uri: "http://localhost:81/api/"
    })

    const wsLink = new GraphQLWsLink(createClient({
        url: "ws://localhost:81/api/"
    }))

    const splitLink = split(
    ({ query }) => {
            const definition = getMainDefinition(query);
            return (
            definition.kind === 'OperationDefinition' &&
            definition.operation === 'subscription'
            );
        },
        wsLink,
        httpLink,
    );

    // apollo client for browser client
    const client = new ApolloClient({
        link: splitLink,
        cache: new InMemoryCache(),
    });

    return client
}

