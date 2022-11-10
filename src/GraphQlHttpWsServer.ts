import { ApolloServer } from '@apollo/server'
import { TicTacToeApp } from './TicTacToeApp'
import { TicTacToeGameWithUsers, GameManagerEvents } from './GameManager'
import * as express from 'express'
import * as cors from 'cors'
import {json} from 'body-parser'
import { expressMiddleware } from '@apollo/server/express4';
import * as http from 'http';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws'
import { useServer } from 'graphql-ws/lib/use/ws'
import { PubSub } from 'graphql-subscriptions';
import { UserManagerEvents } from './UserManager'
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

type GameData {
    grid: [[Int]]
    gridSize: Int
    state: Int
    turn: Int
    winningPlayer: Int
}

type Game {
    gameData: GameData
    id: String
    playerIds: [String]
}

type QueryGetGamesResponse {
    games: [Game]
}
type Query {
    getGames: QueryGetGamesResponse
}

type GamesMutationResponse {
    game: Game
    games: [Game]
}

type Mutation {
    createGame(gridSize: Int, playerOneId: String) : GamesMutationResponse
}

mutation createGame {
    createGame(gridSize: Int, playerOneId: String) {
        game
        games
    }
}

type Mutation {
    addUserToGame(gameId: String, userId: String) : GamesMutationResponse
}

mutation addUserToGame {
    addUserToGame(gameId: String, userId: String) {
        game
        games
    }
}

type Mutation {
    startGame(gameId: String) : GamesMutationResponse
}

mutation startGame { 
    startGame(gameId: String) {
        game
        games
    }
}

type Mutation {
    executeGameTurn(gameId: String, playerId: String, x: Int, y: Int) : GamesMutationResponse
}

mutation executeGameTurn {
    executeGameTurn(gameId: String, playerId: String, x: Int, y: Int) {
        game
        games
    }
}

type Subscription {
     newGames : GamesMutationResponse
}

subscription newGames {
    newGames {
        game
        games
    }
}

type Subscription {
    newUsers : QueryGetUsersResponse
}

subscription newUsers {
    newUsers {
        users
    }
}
`;

function makeGamesMutationResponse( game: TicTacToeGameWithUsers, games:   TicTacToeGameWithUsers[] )
{
    return {
        game: {
            gameData: game.game.getGameData(),
            id: game.id,
            playerIds: game.playerIds
        },
        games: games.map((g)=>({
            gameData: g.game.getGameData(),
            id: g.id,
            playerIds: g.playerIds,
        }))
    }
}

/**
 * connects API to app instance
 * 
 * @param port 
 * @param app 
 * @returns 
 */
export const createAppApolloServer = async (app: TicTacToeApp, port=4000) => {


    /**
     * subscribe pubsub to game events
     */

     const pubsub = new PubSub();

     app.games.addListener(GameManagerEvents.NEW_GAMES, ({game, games})=>{
         pubsub.publish(GameManagerEvents.NEW_GAMES, {
             newGames: makeGamesMutationResponse(game,games)
         })
     })

     app.users.addListener(UserManagerEvents.NEW_USERS, ({users})=>{
        console.log(`users: ${JSON.stringify(users)}`)
        pubsub.publish(UserManagerEvents.NEW_USERS, {
            newUsers: {
                users
            }
        })
    })

     /**
      * define resolvers
      */

    const resolvers = {
        Mutation: {
            createUser: ()=> app.users.createUser(),
            // @ts-ignore
            setUsername: (_, { id, username })=>app.users.setUserUsername(id, username),
            // @ts-ignore
            createGame: (_, {gridSize, playerOneId}) =>{
                const {game, games} = app.games.createGame(gridSize, playerOneId)
                return makeGamesMutationResponse(game, games)
            },
            // @ts-ignore
            addUserToGame: (_, {gameId, userId})=>{
                const {game, games} = app.games.addUserToGame(gameId, userId)
                return makeGamesMutationResponse(game, games)
            },
            // @ts-ignore
            startGame: (_, {gameId})=>{
                const {game, games} = app.games.startGame(gameId)
                return makeGamesMutationResponse(game, games)
            },
            // @ts-ignore
            executeGameTurn: (_, {gameId, playerId, x, y})=>{
                const {game, games} = app.games.executeGameTurn(gameId, playerId, x, y)
                return makeGamesMutationResponse(game, games)
            },
        },
        Query: {
            // @ts-ignore
            hello: (_, { name }) => `Hello ${name}!`,
            getUsers: () => ({ users: app.users.makeUserArray()}),
            getGames: () => ({ games: app.games.makeGamesArray().map((g)=>({
                gameData: g.game.getGameData(),
                id: g.id,
                playerIds: g.playerIds,
                
                
            })) })
        },
        Subscription: {
            newGames: {
                subscribe: () => pubsub.asyncIterator([GameManagerEvents.NEW_GAMES])
            },
            newUsers: {
                subscribe: () => pubsub.asyncIterator([UserManagerEvents.NEW_USERS])
            }
          },
    };

    /**
     * configure GraphQL Http/WS server
     */

    const expressApp = express();
    const httpServer = http.createServer(expressApp);

    const wsServer = new WebSocketServer({
        server: httpServer,
        path: '/api/'
    })

    const schema = makeExecutableSchema({ typeDefs, resolvers });
    const serverCleanup = useServer({ schema }, wsServer);
    
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        plugins: [
            ApolloServerPluginDrainHttpServer({ httpServer }),
                // Proper shutdown for the WebSocket server.
            {
                async serverWillStart() {
                    return {
                        async drainServer() {
                        await serverCleanup.dispose();
                        },
                    };
                },
            },
        ],
    });

    await server.start()

    expressApp.use(
        '/', 
        cors<cors.CorsRequest>(), 
        json(), 
        expressMiddleware(server)
        )

    await new Promise<void>((resolve) => httpServer.listen({ port: port }, resolve));
    
    return { server,  url: `http://localhost:${port}` }
}