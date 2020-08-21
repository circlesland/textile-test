import { KeyInfo} from '@textile/hub';
import { Buckets } from "./buckets/buckets";
import {Threads} from "./threads/threads";
import {Users} from "./users/users";

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

    const hubUsersClient = await Users.load(keyinfo)
    console.log(hubUsersClient);
}
doStuff();
