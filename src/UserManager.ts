import { EventEmitter } from 'stream';
import { uid } from 'uid';
import { uniqueNamesGenerator, adjectives, colors, animals  } from 'unique-names-generator'

export interface User {
    id: string;
    username: string;
}

export enum UserManagerEvents {
    NEW_USERS = 'NEW_USERS'
}

export class UserManager extends EventEmitter {
    users : Record<string, User> = {}

    makeUserArray()
    {
        return Object.keys(this.users).map((k)=>({ id: this.users[k].id, username: this.users[k].username }))
    }

    createUser()
    {
        const user : User = {
            id: uid(),
            username: uniqueNamesGenerator({ dictionaries: [adjectives, colors, animals] })
        }
        this.users[user.id] = user
        this.emit(UserManagerEvents.NEW_USERS)
        return { 
            user: user, 
            users: this.makeUserArray()
            }
    }

    setUserUsername(id: string, username: string)
    {
        this.users[id].username = username
        this.emit(UserManagerEvents.NEW_USERS)
        return { user: this.users[id], users: this.makeUserArray() }
    }
}