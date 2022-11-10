// import * as proxy from 'express-http-proxy'
import express from "express";
import cookieParser from 'cookie-parser'
import { request, gql } from 'graphql-request'
import httpProxy from 'http-proxy'

export const FRONT_END_PROXY_PORT = 81
export const FRONT_END_PROXY_URI = `http://localhost:${FRONT_END_PROXY_PORT}`
export const NEXT_HTTP_SERVER = 'http://localhost:3000/'
export const NEXT_WS_SERVER = 'ws://localhost:3000/'
export const GRAPHQL_SERVER = 'http://localhost:4000/'

const USER_ID_COOKIE = 'user_id'

export const makeFrontEndProxyExpressApp = async () => {

    const app = express();
   
    const nextJsProxy = httpProxy.createProxyServer({
        target:{
            host: 'localhost', 
            port: 3000
        }
    });

   const graphQlProxy = httpProxy.createProxyServer({
        target:{
            host: 'localhost', 
            port: 4000
        }
    });

    // parse cookies
    app.use(cookieParser())

    // set user_id cookie if non-existant
    app.use((req, res, next) => {
        
        if(req.cookies['user_id'] === undefined)
        {

            const query = gql`mutation createUser {
                createUser {
                    user {
                        id
                    }
                }
            }`
            request(GRAPHQL_SERVER, query).then(
                (data)=>
                {
                    res.cookie(USER_ID_COOKIE, data.createUser.user.id)   
                    next();
                }
            ).catch((err)=>{
                console.log(`err: ${err}`)
            })
        }
        else
        {
            next()
        }
    })

    // proxy API requests to GraphQL server
    app.all('/api/*', function(req, res, ){
        graphQlProxy.web(req, res)
    });
    
    // proxy HTTP requests to Next dev server
    app.use(function (req, res) {
        nextJsProxy.web(req, res);
    })

    // create, start server
    const server = await app.listen(FRONT_END_PROXY_PORT)

    // proxy HTTP WS upgrades
    server.on('upgrade', function (req, socket, head){
        if(req.url?.includes('/_next'))
        {
            nextJsProxy.ws(req, socket, head) ;
        }
        else
        {
            graphQlProxy.ws(req, socket, head) ;
        }
    })
    
    return { app, server }
}