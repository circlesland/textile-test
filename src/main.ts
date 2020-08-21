import { KeyInfo, Client } from '@textile/hub';
import { Buckets } from "./buckets/buckets";
import {Threads} from "./threads/threads";
import {createUserAuth } from '@textile/hub';
import {Users} from "./users/users";
import {KeyStore} from "./identity/keyStore";

const keyinfo: KeyInfo = {
    key: 'bna3znzdlwedldezod5vtn7wd3a',
    secret: 'bkcl6scbiyvceiwztljxuxfanfke22spxpzuhc5y'
}

async function doStuff()
{
    const buckets = await Buckets.openOrCreate(keyinfo);

    const contents = await buckets.listContents();
    console.log(contents);

    const entry = await buckets.pushText("/index.html", "Hello World 2345!");
    console.log(entry);

    const threads = await Threads.openOrCreate(keyinfo);
    console.log(threads);

    if (!keyinfo.secret)
        throw new Error("The secret is required");

    const client = await Client.withKeyInfo(keyinfo)
    const identity = await KeyStore.getOrCreateIdentity();
    const token = await client.getToken(identity);
    const expires = new Date(Date.now() + 60 * 1000);
    const auth = await createUserAuth(keyinfo.key, keyinfo.secret, expires, token);
    const threadsOfUser = await Users.example(auth)
    
    console.log(threadsOfUser);
}
doStuff();
