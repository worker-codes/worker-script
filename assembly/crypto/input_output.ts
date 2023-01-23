import { Decoder, Writer, Encoder, Sizer } from "@wapc/as-msgpack";
import { CryptoKey } from "./types";

export type KeyUsage = Array<String>;
// export class KeyUsage {
//     encrypt: boolean = false;
//     decrypt: boolean = false;
//     sign: boolean = false;
//     verify: boolean = false;
//     deriveKey: boolean = false;
//     deriveBits: boolean = false;
//     wrapKey: boolean = false;
//     unwrapKey: boolean = false;
// }

export class Algorithm {
    name: string;
}

export class EcdhKeyDeriveParams {
    name: string;
    public: CryptoKey;
}

export class HkdfParams {
    name: string;
    hash: string;
    salt: ArrayBuffer;
    info: ArrayBuffer;
}

export class Pbkdf2Params {
    name: string;
    hash: string;
    salt: ArrayBuffer;
    iterations: i64;
}

export class RsaPssParams {
    name: string;
    saltLength: i64;
}
export class EcdsaParams {
    name: string;
    hash: string;
}
export class RsaOaepParams{
    name: string = "RSA-OAEP";
    label: ArrayBuffer;
}

export class AesCtrParams{
    name: string = "AES-CTR";
    counter: ArrayBuffer;
    length: i64;
}

export class AesCbcParams{
    name: string = "AES-CBC";
    iv: ArrayBuffer;
}

export class AesGcmParams{
    name: string = "AES-GCM";
    iv: ArrayBuffer;
    additionalData: ArrayBuffer;
    tagLength: i64;
}

export class RsaHashedKeyGenParams {
    name: string = "RSA-PSS";
    modulusLength: i64;
    publicExponent: Uint8Array;
    hash: string;
}

export class EcKeyGenParams {
    name: string = "ECDSA";
    namedCurve: string;
}

export class HmacKeyGenParams {
    name: string = "HMAC";
    hash: string;
    length: i64 = -1;

    encode(writer: Writer): void {
        writer.writeMapSize(3);
        writer.writeString("name");
        writer.writeString(this.name);
        writer.writeString("hash");
        writer.writeString(this.hash);
        writer.writeString("length");       
        // if less than 0 write nil
        if (this.length < 0) {
            writer.writeNil();
        } else {
            writer.writeUInt64(this.length);
        }      
    }

    toBuffer(): ArrayBuffer {
        const sizer = new Sizer();
        this.encode(sizer);
        const buffer = new ArrayBuffer(sizer.length);
        const encoder = new Encoder(buffer);
        this.encode(encoder);
        return buffer;
    }
}

export class AesKeyGenParams {
    name: string = "AES-CBC";
    length: i64;
}
export class GenerateKeyOptions{
    algorithm: string;
    modulusLength: i64 = -1;
    publicExponent: ArrayBuffer | null = null;
    hash: string | null = null;
    namedCurve: string | null = null;
    length: i64 = -1;

    encode(writer: Writer): void {
        writer.writeMapSize(5);
        writer.writeString("algorithm");
        writer.writeString(this.algorithm);
        writer.writeString("modulusLength");
        if (this.modulusLength < 0) {
            writer.writeNil();
        } else {
            writer.writeUInt32(this.modulusLength);
        }
        writer.writeString("publicExponent");
        if (this.publicExponent === null) {
            writer.writeNil();
        } else {
            writer.writeByteArray(this.publicExponent as ArrayBuffer);
        }
        writer.writeString("hash");
        if (this.hash === null) {
            writer.writeNil();
        } else {
            writer.writeString(this.hash as string);
        }
        writer.writeString("namedCurve");
        if (this.namedCurve === null) {
            writer.writeNil();
        } else {
            writer.writeString(this.namedCurve as string);
        }
        writer.writeString("length");
        if (this.length < 0) {
            writer.writeNil();
        } else {
            writer.writeUInt64(this.length);
        }
    }

    toBuffer(): ArrayBuffer {
        const sizer = new Sizer();
        this.encode(sizer);
        const buffer = new ArrayBuffer(sizer.length);
        const encoder = new Encoder(buffer);
        this.encode(encoder);
        return buffer;
    }

}

// export class CryptoKey {
//     algorithm: string;
//     extractable: bool;
//     type: KeyType;
//     usages: KeyUsage[];
// }




// export class RsaHashedImportParams{
//     name: string;
//     hash: string;
// }

// export class RsaHashedKeyAlgorithm{
//     name: string;
//     modulusLength: i64;
//     publicExponent: ArrayBuffer;
//     hash: string;
// }

// export class RsaKeyPair{
//     publicKey: ArrayBuffer;
//     privateKey: ArrayBuffer;
// }
// export class HmacKeyAlgorithm{
//     name: string;
//     hash: string;
//     length: i64;
// }

// export class HmacKey{
//     algorithm: HmacKeyAlgorithm;
//     extractable: bool;
//     type: KeyType;
//     usages: KeyUsage[];
// }


// export class HmacDigestArg {
//     algorithm: string;
//     key: ArrayBuffer;
//     data: ArrayBuffer;
// }

// export class HmacDigestResult {
//     digest: ArrayBuffer;
// }

// export class HmacSignArg {
//     algorithm: string;
//     key: ArrayBuffer;
//     data: ArrayBuffer;
// }

// export class HmacSignResult {
//     signature: ArrayBuffer;
// }

// export class HmacVerifyArg {
//     algorithm: string;
//     key: ArrayBuffer;
//     data: ArrayBuffer;
//     signature: ArrayBuffer;
// }

// export class HmacVerifyResult {
//     valid: bool;
// }

// export class HmacImportKeyArg {
//     format: string;
//     keyData: ArrayBuffer;
//     algorithm: string;
//     extractable: bool;
//     keyUsages: KeyUsage[];
// }

// export class HmacImportKeyResult {
//     key: ArrayBuffer;
// }

// export class HmacExportKeyArg {
//     format: string;
//     key: ArrayBuffer;
// }

// export class HmacExportKeyResult {
//     keyData: ArrayBuffer;
// }

// export class HmacGenerateKeyArg {
//     algorithm: string;
//     extractable: bool;
//     keyUsages: KeyUsage[];
// }

// export class HmacGenerateKeyResult {
//     key: ArrayBuffer;
// }

// export class HmacDeriveKeyArg {
//     algorithm: string;
//     baseKey: ArrayBuffer;
//     derivedKeyType: string;
//     extractable: bool;
//     keyUsages: KeyUsage[];
// }

// export class HmacDeriveKeyResult {
//     key: ArrayBuffer;
// }

// export class HmacDeriveBitsArg {
//     algorithm: string;
//     baseKey: ArrayBuffer;
//     length: i64;
// }

// export class HmacDeriveBitsResult {
//     bits: ArrayBuffer;
// }

// export class HmacWrapKeyArg {
//     format: string;
//     key: ArrayBuffer;
//     wrappingKey: ArrayBuffer;
//     wrapAlgorithm: string;
// }