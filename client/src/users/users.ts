import {Users as HubUsers, Client, createUserAuth, KeyInfo} from '@textile/hub'
import {KeyStore} from "../identity/keyStore";

export class Users
{
    static async load(keyinfo: KeyInfo)
    {
        if (!keyinfo.secret)
            throw new Error("The secret is required");

        const identity = await KeyStore.getOrCreateIdentity();
        const userAuth = await KeyStore.loginWithChallenge(identity)
        const client = await Client.withUserAuth(userAuth)
        const token = await client.getToken(identity);
        const expires = new Date(Date.now() + 60 * 1000);
        const auth = await createUserAuth(keyinfo.key, keyinfo.secret, expires, token);
        const api = HubUsers.withUserAuth(auth);

        return new Users(api);
    }

    private readonly _usersApi:HubUsers;

    constructor(usersApi:HubUsers)
    {
        this._usersApi = usersApi;
    }
}
