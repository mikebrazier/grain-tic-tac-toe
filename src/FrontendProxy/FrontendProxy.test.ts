import { 
    makeFrontEndProxyExpressApp,
    FRONT_END_PROXY_URI
} from './FrontendProxy'
import request from 'supertest'
import { 
    createAppWithServer 
} from './../AppWithServer'

describe('frontend proxy',
    ()=>{

        it(
            'sets cookie on request',
            async ()=>{
                // create tic tac toe app with GraphQL interface on 4000
                const gameServer = await createAppWithServer()

                // create express app on port 81, or other
                const { server } = await makeFrontEndProxyExpressApp()
                
                const response = await request(FRONT_END_PROXY_URI).get('/').set("content-type","application/json")
                expect( response.header["set-cookie"].length ).toBe(1)

                await gameServer.server.stop()
                await server.close()
            }
        )
})