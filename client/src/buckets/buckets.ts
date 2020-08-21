import {Buckets as TextileBuckets, KeyInfo, RootObject} from '@textile/hub'
import {KeyStore} from "../identity/keyStore";
import {ListPathObject} from "@textile/buckets/dist/api";

export class Buckets
{
    private static readonly defaultBucketName = "earth.omo.default";
    private static readonly defaultBucketRootKeyLocalStorageKey = "textile-default-bucket-root-key";
    private static readonly dataThreadIdLocalStorageKey = "textile-bucket-thread-id";
    private static readonly isPrivate = false;

    /**
     * Returns an authenticated TextileBuckets object pre-initialized with a default bucket and thread.
     * @param key
     */
    public static async openOrCreate(key: KeyInfo) : Promise<Buckets>
    {
        const identity = await KeyStore.getOrCreateIdentity();
        const bucketsApi = await TextileBuckets.withKeyInfo(key);
        await bucketsApi.getToken(identity);

        let threadId = localStorage.getItem(Buckets.dataThreadIdLocalStorageKey);
        let rootKey = localStorage.getItem(Buckets.defaultBucketRootKeyLocalStorageKey);

        if (!threadId)
        {
            const bucket = await bucketsApi.getOrInit(Buckets.defaultBucketName, undefined, Buckets.isPrivate);
            if (!bucket.threadID || !bucket.root)
            {
                throw new Error("Cannot create the default Bucket '" + Buckets.defaultBucketName + "'.")
            }

            threadId = bucket.threadID
            localStorage.setItem(Buckets.dataThreadIdLocalStorageKey, threadId);

            rootKey = bucket.root.key;
            localStorage.setItem(Buckets.defaultBucketRootKeyLocalStorageKey, rootKey);
        }

        bucketsApi.withThread(threadId);

        if (!rootKey) {
            throw new Error("Couldn't read the root key of the default bucket in thread " + threadId);
        }

        return new Buckets(bucketsApi, threadId, rootKey);
    }

    private readonly _bucketsApi:TextileBuckets;
    private readonly _rootKey:string;
    private readonly _threadId:string;

    constructor(bucketsApi:TextileBuckets, threadId:string, rootKey:string)
    {
        this._bucketsApi = bucketsApi;
        this._threadId = threadId;
        this._rootKey = rootKey;
    }

    async listContents() : Promise<ListPathObject> {
        return await this._bucketsApi.listPath(this._rootKey, "/");
    }

    async pushText(path:string, contents:string) {
        const buffer = Buffer.from(contents);
        return this.pushBinary(path, buffer);
    }

    async pushBinary(path:string, contents:Buffer) {
        return await this._bucketsApi.pushPath(this._rootKey, path, contents);
    }
}
