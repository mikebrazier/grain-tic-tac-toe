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

const createUserMutationData = {
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
  

describe('createUser creates user', ()=>{
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
})