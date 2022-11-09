import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import {  useState, useEffect } from 'react'
import { makeApolloNextClient } from './../src/ApolloClient'
import { gql } from "@apollo/client"
import { getCookie } from 'cookies-next';
import { ApolloProvider } from "@apollo/client";
import { ApolloClient, InMemoryCache, useMutation } from "@apollo/client";
import { User, UserManagerEvents } from '../src/UserManager'

/**
 * gameServerClient runs serverside and connects to Apollo API
 */
const gameServerClient = makeApolloNextClient()

// on initial render, provide users to react app
export async function getServerSideProps() {
  const response = await gameServerClient.query({
    query: gql`query getUsers {
      getUsers {
          users {
              id
              username
          }
      }
  }`
  }).catch((err)=>{
    console.log(`err: ${err}`)
  })
  
  console.log(`users: ${JSON.stringify(response?.data.getUsers.users)}`)
  return {
    props: {
      users: response ? response.data.getUsers.users : []
    }
  }
}

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

// apollo client for browser client
const client = new ApolloClient({
  uri: "http://localhost:81/api/'",
  cache: new InMemoryCache(),
});

// Index uses browser ApolloClient to access GraphQL API and render updates
export function Index( {users} ) {
  const [setUsername, { data, loading, error }] = useMutation(SET_USERNAME);
  let input : HTMLInputElement | null = null
  const [userIdFromCookie, setUserIdFromCookie] = useState('')
  useEffect(()=>setUserIdFromCookie( getCookie('user_id') ),[])

  const user = users.find((user)=>user.id==userIdFromCookie)
  console.log(`user: ${user}`)
  return (
    <div>
      Name: { data ?  data?.setUsername.user.username : user?.username } 
      <form
        onSubmit={e=>{
          e.preventDefault()
          if(input != null)
          {
            setUsername({variables: {
              id: getCookie('user_id'),
              username: input.value
            }})
          }
        }}
      >
        <input
        ref={node => {
          input = node;
        }}
        />
        <button type="submit">Set Name</button>
      </form>
    </div>
  )
}

// default export returns Index component wrapped
// with Provider providing browser ApolloClient 
export default function WrappedIndex({users}){
  return(
    <ApolloProvider client={client}>
        <Index users={users}></Index>
    </ApolloProvider>
  )
}