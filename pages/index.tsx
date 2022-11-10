import {  useRef, useState, useEffect } from 'react'
import { gql } from "@apollo/client"
import { getCookie } from 'cookies-next';
import { ApolloProvider } from "@apollo/client";
import { ApolloClient, InMemoryCache, useMutation, useQuery } from "@apollo/client";
import { User } from '../src/UserManager'
import { TicTacToeGameData } from './../src/GameManager'
import ClientOnly from './../components/ClientOnly'
/**
 * gameServerClient runs serverside and connects to Apollo API
 */
// const gameServerClient = makeApolloNextClient()

const GET_USERS =  gql`query getUsers {
  getUsers {
      users {
          id
          username
      }
  }
}`

const GET_GAMES = gql`query getGames {
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

// define mutation which allows user to change username
const SET_USERNAME = gql`mutation setUsername($id: String, $username: String){
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
}`

const CREATE_GAME = gql`mutation createGame($gridSize: Int, $playerOneId: String) {
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
}`

const ADD_USER_TO_GAME = gql`mutation addUserToGame($gameId: String, $userId: String) {
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
}`

const START_GAME = gql`mutation startGame($gameId: String) {
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
}`

const usePrevious = (value) => {
  const ref = useRef();
  useEffect(() => ref.current = value);
  return ref.current;
};

const getUserById = (userId: string, users: User[])=>users.find((u)=>u.id==userId)

const userCanJoin = (userId: string, playerIds: string[]) =>(
  ! playerIds.includes(userId)
  &&
  playerIds.length < 2
)
const canStartGame = (game : TicTacToeGameData, userId: string ) => game.playerIds[0] == userId && game.playerIds.length == 2 && game.gameData.state != 2

const canGoToGame = (game : TicTacToeGameData, userId: string) => game.playerIds.includes(userId) && game.gameData.state == 2

export function GamesOrderedList ({games, userId, users, onAddUserToGame, onStartGame } : {games: TicTacToeGameData[], userId: string, users: User[], onAddUserToGame : (gameId : string, userId: string )=>void, onStartGame : (gameId: string) => void}){
  return(
    <table>
      <tr>
        <th>Game Id</th>
        <th>Players</th>
        <th>Join</th>
        <th>Start</th>
        <th>Go To</th>
      </tr>
      {
        /**
        sort((a,b)=>{
          if(a.playerIds.length > b.playerIds.length)
          {
            return 1
          }
          
          return -1
        })
         */
        [...games].map(
          (game)=>(
            <tr key={game.id}>
              {/* Game Id */}
              <td>{game.id}</td>
              {/* Players */}
              <td>
                {
                  game.playerIds.length == 2
                  ?
                  getUserById(game.playerIds[0], users)?.username+' vs. '+getUserById(game.playerIds[1], users)?.username
                  :
                  getUserById(game.playerIds[0], users)?.username
                }
              </td>
              {/* Join */}
              <td>
                {
                  userCanJoin(userId, game.playerIds)
                  ? 
                  <button
                    onClick={
                      ()=>onAddUserToGame(game.id, userId)
                    }
                  >JOIN</button>
                  :
                  <button disabled>JOIN</button>
                }
              </td>
              {/* Start */}
              <td>
                <button 
                disabled={!canStartGame(game, userId)}
                onClick={
                  ()=>onStartGame(game.id)
                }
                >START</button>
              </td>
              {/* Go To */}
              <td>
                {
                  canGoToGame(game, userId)
                  ?
                  <a href={`/game/${game.id}`}>
                    <button disabled={false}>GO TO</button>
                  </a>
                  :
                  <button disabled={true}>GO TO</button>
                }
              </td>
            </tr>
          )
        )
      }
    </table>
  )
}

export function Index() {

  // API CALLS
  const { data: getUsersAPIData } = useQuery(GET_USERS)
  const { data: getGamesAPIData } = useQuery(GET_GAMES)
  const [setUsernameAPI, { data: setUsernameAPIData  }] = useMutation(SET_USERNAME);
  const [createGame, { data: createGameData }] = useMutation(CREATE_GAME);
  const [addUserToGameAPI, {data: addUserToGameAPIData } ] = useMutation(ADD_USER_TO_GAME)
  const [startGameAPI, {data: startGameAPIData}] = useMutation(START_GAME)

  /**
   * DYNAMIC DATA
   */
  // userId
  const [userIdFromCookie, setUserIdFromCookie] = useState(getCookie('user_id'))
  
  // users
  const [users, setUsers] = useState<User[]>([])

  useEffect(
    ()=>{
      console.log(`
      usernameFromInput: ${usernameFromInput}, 
      userIdFromCookie: ${userIdFromCookie},
      users: ${JSON.stringify(users)}`
      )
      if(
        setUsernameAPIData?.setUsername?.users
      )
      {
        setUsers(
          setUsernameAPIData?.setUsername?.users
          )
      }
      else if(
        getUsersAPIData?.getUsers.users
      )
      {
        setUsers(
          getUsersAPIData?.getUsers.users
          )
      }
    },
    [
      getUsersAPIData,
      setUsernameAPIData
    ]
  )

  // user
  const [userFromId, _setUserFromId] = useState<User | null>(null)
  const setUserFromId = ()=> _setUserFromId( users.find( (u)=>u.id==userIdFromCookie ))
  useEffect(
    ()=>setUserFromId()
    ,
    [
      userIdFromCookie,
      users
    ]
  )

  // games
  const [games, setGames] = useState([])
  useEffect(()=>{
    // const prevCreateGameData = usePrevious()

    console.log(`args: ${JSON.stringify(arguments)}`)
    if(createGameData?.createGame?.games)
    {
      setGames(createGameData?.createGame?.games)
    }
    else if (
      getGamesAPIData?.getGames?.games
    )
    {
      setGames(getGamesAPIData?.getGames?.games)
    }
    else if (
      startGameAPIData?.startGame?.games
    )
    {
      setGames(
        startGameAPIData?.startGame?.games
        )
    }
    else if (
      addUserToGameAPIData?.addUserToGameAPIData?.games
    )
    {
      setGames(
        addUserToGameAPIData?.addUserToGame?.games
      )
    }
  },[
      createGameData,
      getGamesAPIData,
      addUserToGameAPIData,
      startGameAPIData
    ])
  
  // username
  const [ usernameFromInput, setUsernameFromInput ]  = useState('')

  // gridSize
  const[gridSize, setGridSize] = useState(3)

  return (
    <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0
    }}>
      <div>
        Username: { userFromId?.username } 
      </div>
      <hr style={{width: '100%'}}/>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%'}}>
        <GamesOrderedList 
          games={games} 
          userId={userIdFromCookie} 
          users={users}
          onAddUserToGame={
            (gameId, userId)=>addUserToGameAPI(
              {
                  variables: {
                    gameId: gameId,
                    userId: userId
                  }
                }
              )
          }
          onStartGame={
            (gameId)=>startGameAPI({variables: {
              gameId: gameId
            }})
          }
        />
        <hr style={{width: '100%'}}/>
        <div>
            <form
                onSubmit={e=>{
                  e.preventDefault()
                  createGame({variables:{
                    gridSize: gridSize,
                    playerOneId: getCookie('user_id')
                  }})
                }}
                >
                <button type="submit">Create Game</button>
            </form>
        </div>
      </div>
          {/* <form
            onSubmit={e=>{
              e.preventDefault()
              if(usernameFromInput)
              {
                setUsernameAPI({variables: {
                  id: userIdFromCookie,
                  username: usernameFromInput
                }})
              }
            }}
          >
            <input
            onChange={(event)=>{
              setUsernameFromInput(event.target.value)
            }}
            // ref={}
            />
            <button type="submit">Set Username</button>
          </form> */}
    </div>
  )
}

// default export returns Index component wrapped
// with Provider providing browser ApolloClient 
export default function WrappedIndex(){
  // apollo client for browser client
  const client = new ApolloClient({
    uri: "http://localhost:81/api/'",
    cache: new InMemoryCache(),
  });
  
return(
    <ApolloProvider client={client}>
      <ClientOnly>
      <Index></Index>
      </ClientOnly>
    </ApolloProvider>
  )
}