export class RsaOaepParams{
    name: string | null;
}

export class AesCbcParams{
    iv: ArrayBuffer;
}

export class AesGcmParams{
    additionalData: ArrayBuffer;
    tagLength: u32;
}

export class AesCtrParams{
    counter: ArrayBuffer;
    length: u32;
}


// export class HmacKeyGenParams{
//     name: string;
//     hash: string;
//     length: i32;
// }

// export class HmacImportParams{
//     name: string;
//     hash: string;
//     length: i32;
// }

// export class HmacExportParams{
//     name: string;
//     hash: string;
//     length: i32;
// }

// export class AesKeyGenParams{
//     name: string;
//     length: i32;
// }

// export class HmacDigestParams{
//     name: string;
//     hash: string;
//     length: i32;
// }

// export class EcdhKeyDeriveParams{
//     name: string;
//     public: ArrayBuffer;
// }
// export class HkdfParams{
//     name: string;
//     hash: string;
//     salt: ArrayBuffer;
//     info: ArrayBuffer;
//     length: i32;
// }

// export class Pbkdf2Params{
//     name: string;
//     hash: string;
//     salt: ArrayBuffer;
//     iterations: i32;
//     length: i32;
// }
// const simpleAlgorithmDictionaries = {
//     AesGcmParams: { iv: "BufferSource", additionalData: "BufferSource" },
//     RsaHashedKeyGenParams: { hash: "HashAlgorithmIdentifier" },
//     EcKeyGenParams: {},
//     HmacKeyGenParams: { hash: "HashAlgorithmIdentifier" },
//     RsaPssParams: {},
//     EcdsaParams: { hash: "HashAlgorithmIdentifier" },
//     HmacImportParams: { hash: "HashAlgorithmIdentifier" },
//     HkdfParams: {
//       hash: "HashAlgorithmIdentifier",
//       salt: "BufferSource",
//       info: "BufferSource",
//     },
//     Pbkdf2Params: { hash: "HashAlgorithmIdentifier", salt: "BufferSource" },
//     RsaOaepParams: { label: "BufferSource" },
//     RsaHashedImportParams: { hash: "HashAlgorithmIdentifier" },
//     EcKeyImportParams: {},
//   };
