import { 
    makeFrontEndProxyExpressApp,
    FRONT_END_PROXY_PORT 
} from './FrontendProxy'
import { 
    AppWithServer, 
    createAppWithServer 
} from './../AppWithServer'


let _app, _server;

const gameServer = createAppWithServer().then(()=>console.log('game server up'))
makeFrontEndProxyExpressApp().then(({app, server})=>{
    console.log('proxy server up')
    _app = app
    _server = server
})
