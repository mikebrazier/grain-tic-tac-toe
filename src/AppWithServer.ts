import { TicTacToeApp } from './TicTacToeApp'
import { createAppApolloServer } from './GraphQlHttpWsServer'
import { ApolloServer, BaseContext } from '@apollo/server'


/**
 * DEFS
 */

export const createAppWithServer = async () => {
    const app = new TicTacToeApp()
    const {server, url} = await createAppApolloServer(app)
    return new AppWithServer(app, server, url)
}

export class AppWithServer {
     app : TicTacToeApp
     server : ApolloServer<BaseContext>;
     url : string;
    constructor(app: TicTacToeApp, server : ApolloServer<BaseContext>, url: string )
    {
        this.app = app
        this.server = server
        this.url = url
    }
}

// APP CLASS
// App.app = new TicTacToeGameApp()
// App.server = new GqlServer(tta)
// App.start
    // 
    // gqlServer.start()

/**
 * DEFS
 */

// appState = loadState