import { createAppApolloServer } from './GraphQlHttpWsServer';
import { ApolloServer, BaseContext } from '@apollo/server'
import {TicTacToeApp} from './TicTacToeApp'
import * as request from 'supertest'
import exp = require('constants');

const queryData = {
    query: `query sayHello($name: String) {
      hello(name: $name)
    }`,
    variables: { name: 'world' },
  };

const createUserMutationData
 = {
    query: `mutation createUser {
        createUser {
            user {
                id
                username
            }
            users {
                id
                username
            }
        }
    }`
  }

const createGameMutationData = {
    query: `mutation createGame($gridSize: Int, $playerOneId: String) {
        createGame(gridSize: $gridSize, playerOneId: $playerOneId) {
            game {
                gameData {
                    grid
                    gridSize
                    state
                    turn
                    winningPlayer
                }
                id
                playerIds
            }
            games {
                gameData {
                    grid
                    gridSize
                    state
                    turn
                    winningPlayer
                }
                id
                playerIds
            }
        }
    }`,
    variables: {
        gridSize: 3,
        playerOneId: '1234'
    }
}

const getUsersQueryData = {
    query: `query getUsers {
        getUsers {
            users {
                id
                username
            }
        }
    }`
}
  
const getGamesQueryData = {
    query: `query getGames {
        getGames {
            games {
                gameData {
                    grid
                    gridSize
                    state
                    turn
                    winningPlayer
                }
                id
                playerIds
            }
        }
    }`
}
const makeAddUserToGameMutationData = (gameId: string) => ({
    query: `mutation addUserToGame($gameId: String, $userId: String) {
        addUserToGame(gameId: $gameId, userId: $userId) {
            game {
                gameData {
                    grid
                    gridSize
                    state
                    turn
                    winningPlayer
                }
                id
                playerIds
            }
            games {
                gameData {
                    grid
                    gridSize
                    state
                    turn
                    winningPlayer
                }
                id
                playerIds
            }
        }
    }`,
    variables: {
        gameId: gameId,
        userId: '5678'
    }
})

const makeGameStartMutationData = (gameId: string) => ({
    query: `mutation startGame($gameId: String) {
        startGame(gameId: $gameId) {
            game {
                gameData {
                    grid
                    gridSize
                    state
                    turn
                    winningPlayer
                }
                id
                playerIds
            }
            games {
                gameData {
                    grid
                    gridSize
                    state
                    turn
                    winningPlayer
                }
                id
                playerIds
            }
        }
    }
    `,
    variables: {
        gameId
    }
})

const makeExecuteGameTurnData = (
    gameId: string,
    playerId: string,
    x: number,
    y: number) => ({
        query: `mutation executeGameTurn($gameId: String, $playerId: String, $x: Int, $y: Int) {
            executeGameTurn(gameId: $gameId, playerId: $playerId, x: $x, y: $y) {
                game {
                    gameData {
                        grid
                        gridSize
                        state
                        turn
                        winningPlayer
                    }
                    id
                    playerIds
                }
                games {
                    gameData {
                        grid
                        gridSize
                        state
                        turn
                        winningPlayer
                    }
                    id
                    playerIds
                }
            }

        }
        `,
        variables: {
            gameId,
            playerId,
            x,
            y
        }
    })

describe('App GraphQL API ', ()=>{
    let app : TicTacToeApp;
    let server : ApolloServer<BaseContext>;
    let url : string;

    beforeAll(async () => {
        app = new TicTacToeApp();
        ({server, url} = await createAppApolloServer(app))
    })

    afterAll(async ()=>{
        await server?.stop()
    })
    
    it('adds user on add user mutation', async ()=>{
        // expect(response.error).toBeUndefined();
        const response = await request(url).post('/').send(createUserMutationData);
        // users are indexed by their id
        expect(response.body.data.createUser.user.id).toBe( Object.keys(app.users.users)[0] );
    })

    it('updates user name on update name mutation', async ()=>{
        // add user
        const response = await request(url).post('/').send(createUserMutationData);

        // mutate user username
        const setUserUsernameMutationData = {
            query: `mutation setUsername($id: String, $username: String){
                setUsername(id: $id, username: $username) {
                    user {
                        id
                        username
                    }
                    users {
                        id
                        username
                    }
                }
            }`,
            variables: { 
                id: response.body.data.createUser.user.id,
                username: 'test'
            }
        }

        const un_response = await request(url).post('/').send(setUserUsernameMutationData);

        expect( un_response.body.data.setUsername.user.username).toBe( 'test' );
    })

    it('returns users on users query', async()=>{
        const add_user_response = await request(url).post('/').send(createUserMutationData);
        const get_users_response =  await request(url).post('/').send(getUsersQueryData)
        expect( get_users_response.body.data.getUsers.users.length).toBe(app.users.makeUserArray().length)
    })

    it('gets games', async ()=>{
        const get_games_response = await request(url).post('/').send(getGamesQueryData);
        expect(get_games_response.body.data.getGames.games.length).toBe(0)
    })

    it('create games', async ()=>{
        const create_games_response = await request(url).post('/').send(createGameMutationData);
        expect(create_games_response.body.data.createGame.games.length).toBe(1)
    })

    it('adds users to games', async ()=>{
        const create_games_response = await request(url).post('/').send(createGameMutationData);
        
        const add_user_to_game_response = await request(url).post('/').send(makeAddUserToGameMutationData(
            create_games_response.body.data.createGame.game.id
        ));
        expect(
            add_user_to_game_response.body.data.addUserToGame.game.playerIds.length
        ).toBe(2)
    })

    it('starts games', async () => {
        const create_games_response = await request(url).post('/').send(createGameMutationData);
        const add_user_to_game_response = await request(url).post('/').send(makeAddUserToGameMutationData(
            create_games_response.body.data.createGame.game.id
        ));
        const start_game_response = await request(url).post('/').send(makeGameStartMutationData(
            create_games_response.body.data.createGame.game.id
        ))
        expect(start_game_response.body.data.startGame.game.gameData.state ).toBe(2)
    })

    it('execute game turns', async () => {
        const create_games_response = await request(url).post('/').send(createGameMutationData);
        const add_user_to_game_response = await request(url).post('/').send(makeAddUserToGameMutationData(
            create_games_response.body.data.createGame.game.id
        ));
        const start_game_response = await request(url).post('/').send(makeGameStartMutationData(
            create_games_response.body.data.createGame.game.id
        ))
        const execute_game_turn_repsonse = await request(url).post('/').send(
            makeExecuteGameTurnData(
                create_games_response.body.data.createGame.game.id,
                '1234',
                0,
                0
            )
        )
        expect(execute_game_turn_repsonse.body.data.executeGameTurn.game.gameData.turn).toBe(2)
    })
})