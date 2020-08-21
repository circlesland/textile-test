import {Users as HubUsers, UserAuth} from '@textile/hub'

export class Users
{
    static async example(auth: UserAuth)
    {
        const api = HubUsers.withUserAuth(auth)
        const list = api.listThreads()
        return list
    }
}
