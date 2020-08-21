import {PrivateKey, Identity} from "@textile/hub";
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

    async getOrCreateIdentityAsQRCode()
    {
        const identity = await KeyStore.getOrCreateIdentity();

        const qr = qrcode(0, 'L');
        qr.addData(identity.toString());
        qr.make();
        return qr.createDataURL();
    }
}
