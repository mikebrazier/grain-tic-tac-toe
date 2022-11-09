import { 
    makeFrontEndProxyExpressApp,
    FRONT_END_PROXY_PORT,
    FRONT_END_PROXY_URI
} from './FrontendProxy'

import { Express }from "express";
import { Server } from "http"
import * as request from 'supertest'
import { 
    AppWithServer, 
    createAppWithServer 
} from './../AppWithServer'
import exp = require('constants');

describe('frontend proxy',
    ()=>{

        it(
            'sets cookie on request',
            async ()=>{
                // create tic tac toe app with GraphQL interface on 4000
                const gameServer = await createAppWithServer()

                // create express app on port 81, or other
                const { app, server } = await makeFrontEndProxyExpressApp()
                
                const response = await request(FRONT_END_PROXY_URI).get('/').set("content-type","application/json")
                console.log(`response: ${JSON.stringify(response)}`)
                expect( response.header["set-cookie"].length ).toBe(1)

                await gameServer.server.stop()
                await server.close()
            }
        )

    //     it('GET /user should show all users', async () => {
 
    //         // const res = await requestWithSupertest.get('/users');
    //         //   expect(res.status).toEqual(200);
    //         //   expect(res.type).toEqual(expect.stringContaining('json'));
    //         //   expect(res.body).toHaveProperty('users')
    //       });
    // }
        })