import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'
import { TicTacToeApp } from './TicTacToeApp'

// Schema definition
export const typeDefs = `
#graphql
type Query {
    hello(name: String): String!
}

type User {
    id: String
    username: String
}

type UserMutationResponse {
    user: User
    users: [User]
}

type Mutation {
    createUser: UserMutationResponse
}

mutation UserCreate {
    createUser {
        user
        users
    }
}

type Mutation {
    setUsername(id: String, username: String) : UserMutationResponse
}

mutation UserSetUsername {
    setUsername(id: String, username: String) {
        user
        users
    }
}

type QueryGetUsersResponse {
    users: [User]
}

type Query {
    getUsers: QueryGetUsersResponse
}
`;

/**
 * connects API to app instance
 * 
 * @param port 
 * @param app 
 * @returns 
 */
export const createAppApolloServer = async (app: TicTacToeApp, port=4000) => {



    const resolvers = {
        Mutation: {
            createUser: ()=> app.users.createUser(),
            // @ts-ignore
            setUsername: (_, { id, username })=>app.users.setUserUsername(id, username)
        },
        Query: {
            // @ts-ignore
            hello: (_, { name }) => `Hello ${name}!`,
            getUsers: () => ({ users: app.users.makeUserArray()}),
        },
    };

    const server = new ApolloServer({
            typeDefs,
            resolvers,
        });
    
    const { url } = await startStandaloneServer(server, {listen: { port: port }})
    
    return { server, url }
}