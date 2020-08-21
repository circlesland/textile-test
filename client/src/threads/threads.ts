import {Client} from '@textile/hub'
import {createUserAuth, KeyInfo} from '@textile/hub';
import {KeyStore} from "../identity/keyStore";

export class Threads
{
    private static readonly defaultDbName = "default";
    public static readonly dbThreadLocalStorageKey = "textile-db-thread-id";

    static async openOrCreate(key: KeyInfo)
    {
        if (!key.secret)
        {
            throw new Error("The secret is required");
        }

        const auth = await createUserAuth(key.key, key.secret);
        const identity = await KeyStore.getOrCreateIdentity();
        const client = Client.withUserAuth(auth)

        await client.getToken(identity)

        let threadId = localStorage.getItem(Threads.dbThreadLocalStorageKey);
        if (!threadId)
        {
            // Create a new DB
            const threadId = await client.newDB(undefined, Threads.defaultDbName);
            localStorage.setItem(Threads.dbThreadLocalStorageKey, threadId.toString());
        }

        return new Threads(client);
    }

    private _client:Client;

    constructor(client:Client)
    {
        this._client = client;
    }
}
