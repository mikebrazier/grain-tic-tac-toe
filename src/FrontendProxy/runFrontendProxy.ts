import { 
    makeFrontEndProxyExpressApp,
} from './FrontendProxy'
import { 

    createAppWithServer 
} from './../AppWithServer'


let _app, _server;

const gameServer = createAppWithServer().then(()=>console.log('game server up'))
makeFrontEndProxyExpressApp().then(({app, server})=>{
    console.log('proxy server up')
    _app = app
    _server = server
})
