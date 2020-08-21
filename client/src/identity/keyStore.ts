import {Client, Identity, PrivateKey, UserAuth} from '@textile/hub'
import qrcode from "qrcode-generator";

export class KeyStore
{
    private static readonly localStorageKey = "textile-identity";

    /**
     * Tries to load an existing identity from localStorage. If none could be found,
     * creates a new random key and stores it.
     * @return Identity - A public/private key pair with a sign() method to sign challenges
     */
    public static async getOrCreateIdentity(): Promise<Identity>
    {
        const cached = localStorage.getItem(KeyStore.localStorageKey)
        if (cached !== null)
        {
            return PrivateKey.fromString(cached)
        }

        const identity = await PrivateKey.fromRandom()
        localStorage.setItem(KeyStore.localStorageKey, identity.toString());
        return identity
    }

    public static async getOrCreateIdentityAsQRCode()
    {
        const identity = await KeyStore.getOrCreateIdentity();

        const qr = qrcode(0, 'L');
        qr.addData(identity.toString());
        qr.make();
        return qr.createDataURL();
    }

    public static loginWithChallenge(id: Identity)
    {
        return (): Promise<UserAuth> =>
        {
            return new Promise((resolve, reject) =>
            {
                /**
                 * Configured for our development server
                 *
                 * Note: this should be upgraded to wss for production environments.
                 */
                const socketUrl = `ws://localhost:2345/ws/userauth`

                /** Initialize our websocket connection */
                const socket = new WebSocket(socketUrl)

                /** Wait for our socket to open successfully */
                socket.onopen = () =>
                {
                    /** Get public key string */
                    const publicKey = id.public.toString();

                    /** Send a new token request */
                    socket.send(JSON.stringify({
                        pubkey: publicKey,
                        type: 'token',
                    }))

                    /** Listen for messages from the server */
                    socket.onmessage = async (event) =>
                    {
                        const data = JSON.parse(event.data)
                        switch (data.type)
                        {
                            /** Error never happen :) */
                            case 'error':
                            {
                                reject(data.value)
                                break
                            }
                            /** The server issued a new challenge */
                            case 'challenge':
                            {
                                /** Convert the challenge json to a Buffer */
                                const buf = Buffer.from(data.value)
                                /** User our identity to sign the challenge */
                                const signed = await id.sign(buf)
                                /** Send the signed challenge back to the server */
                                socket.send(JSON.stringify({
                                    type: 'challenge',
                                    sig: Buffer.from(signed).toJSON(),
                                }))
                                break
                            }
                            /** New token generated */
                            case 'token':
                            {
                                resolve(data.value)
                                break
                            }
                        }
                    }
                }
            })
        }
    }

    public static async setupThreads(identity: Identity)
    {
        /**
         * By passing a callback, the Threads library can refresh
         * the api signature whenever expiring.
         */
        const callback = KeyStore.loginWithChallenge(identity)
        const client = Client.withUserAuth(callback)
        await client.getToken(identity)
        return client
    }
}
