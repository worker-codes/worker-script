import { hostCall, Result } from "../../worker/wapc";
import { KeyUsage } from "../crypto";
import { AesKeyGenParams, EcKeyGenParams, HmacKeyGenParams, RsaHashedKeyGenParams, GenerateKeyOptions } from "../input_output";
import { CryptoKey, CryptoKeyPair, KeyAlgorithm, KeyType } from "../types";



export function generateRsaHashedKey(algorithm: RsaHashedKeyGenParams, extractable: bool, keyUsages: KeyUsage): Result<CryptoKeyPair> {
    const algorithmName = algorithm.name;
    if (algorithmName === "RSASSA-PKCS1-v1_5" || algorithmName === "RSA-PSS") {

        // 1.
        let find = keyUsages.findIndex(usage => {
            return usage != "sign" && usage != "verify"
        });
        if (find != -1) {
            return Result.error<CryptoKeyPair>(changetype<Error>("Invalid key usages"));
        }

        // 2.
        //@ts-ignore
        let params: GenerateKeyOptions = {
            algorithm: "RSA",
            modulusLength: algorithm.modulusLength,
            publicExponent: algorithm.publicExponent.buffer,
        }

        let params_buffer = params.toBuffer();
        let result = hostCall("crypto", "subtle", "generateKey", params_buffer);

        if (result.isOk) {
            let keyData = result.get();

            // 4-8.
            const key_algorithm: KeyAlgorithm = {
                name: algorithmName,
                modulusLength: algorithm.modulusLength,
                publicExponent: algorithm.publicExponent.buffer,
                hash: algorithm.hash,
            };

            // 9-13.
            keyUsages = usageIntersection(keyUsages, ["verify"]);
            let publicKey: CryptoKey = {
                algorithm: key_algorithm,
                extractable: true,
                type: KeyType.Public,
                usages: keyUsages,
                handle: {
                    type: "private",
                    data: keyData,
                },
            }


            // 14-18.
            keyUsages = usageIntersection(keyUsages, ["sign"]);
            let privateKey: CryptoKey = {
                algorithm: key_algorithm,
                extractable: extractable,
                type: KeyType.Private,
                usages: keyUsages,
                handle: {
                    type: "private",
                    data: keyData,
                },
            }

            // 19-22.
            let keyPair: CryptoKeyPair = {
                publicKey: publicKey,
                privateKey: privateKey,
            }
            return Result.ok(keyPair);
        } else {
            let err = result.error()
            return Result.error<CryptoKeyPair>(changetype<Error>(err));
        }
    } else if (algorithmName === "RSA-OAEP") {
        // 1.
        let find = keyUsages.findIndex(usage => {
            return usage != "encrypt" && usage != "decrypt" && usage != "wrapKey" && usage != "unwrapKey"
        });
        if (find != -1) {
            return Result.error<CryptoKeyPair>(changetype<Error>("Invalid key usages"));
        }

        // 2.
        //@ts-ignore
        let params: GenerateKeyOptions = {
            algorithm: "RSA",
            modulusLength: algorithm.modulusLength,
            publicExponent: algorithm.publicExponent.buffer,
        }
        let params_buffer = params.toBuffer();
        let result = hostCall("crypto", "subtle", "generateKey", params_buffer);

        if (result.isOk) {
            let keyData = result.get();

            // 4-8.
            const key_algorithm: KeyAlgorithm = {
                name: algorithmName,
                modulusLength: algorithm.modulusLength,
                publicExponent: algorithm.publicExponent.buffer,
                hash: algorithm.hash,
            };

            // 9-13.
            keyUsages = usageIntersection(keyUsages, ["encrypt", "wrapKey"]);
            let publicKey: CryptoKey = {
                algorithm: key_algorithm,
                extractable: true,
                type: KeyType.Public,
                usages: keyUsages,
                handle: {
                    type: "private",
                    data: keyData,
                },
            }


            // 14-18.
            keyUsages = usageIntersection(keyUsages, ["decrypt", "unwrapKey"]);
            let privateKey: CryptoKey = {
                algorithm: key_algorithm,
                extractable: extractable,
                type: KeyType.Private,
                usages: keyUsages,
                handle: {
                    type: "private",
                    data: keyData,
                },
            }

            // 19-22.
            let keyPair: CryptoKeyPair = {
                publicKey: publicKey,
                privateKey: privateKey,
            }
            return Result.ok(keyPair);
        } else {
            let err = result.error()
            return Result.error<CryptoKeyPair>(changetype<Error>(err));
        }


    }

    return Result.error<CryptoKeyPair>(changetype<Error>("Invalid algorithm name"));
}

const supportedNamedCurves = ["P-256", "P-384"];

export function generateEcKey(algorithm: EcKeyGenParams, extractable: bool, keyUsages: KeyUsage): Result<CryptoKeyPair> {
    const algorithmName = algorithm.name;
    if (algorithmName === "ECDSA") {
        // 1.
        let find = keyUsages.findIndex(usage => {
            return usage != "sign" && usage != "verify"
        });
        if (find != -1) {
            return Result.error<CryptoKeyPair>(changetype<Error>("Invalid key usages"));
        }

        // 2-3.
        if (!supportedNamedCurves.includes(algorithm.namedCurve)) {
            return Result.error<CryptoKeyPair>(changetype<Error>("Curve not supported: " + "NotSupportedError")));
        }

        //@ts-ignore
        let params: GenerateKeyOptions = {
            algorithm: "EC",
            namedCurve: algorithm.namedCurve,
        }
        let params_buffer = params.toBuffer();
        let result = hostCall("crypto", "subtle", "generateKey", params_buffer);

        if (result.isOk) {

            let keyData = result.get();

            // 4-6.
            const key_algorithm: KeyAlgorithm = {
                name: algorithmName,
                namedCurve: algorithm.namedCurve,
            };

            // 7-11.
            keyUsages = usageIntersection(keyUsages, ["verify"]);
            let publicKey: CryptoKey = {
                algorithm: key_algorithm,
                extractable: true,
                type: KeyType.Public,
                usages: keyUsages,
                handle: {
                    type: "private",
                    data: keyData,
                },
            }


            // 12-16.
            keyUsages = usageIntersection(keyUsages, ["sign"]);
            let privateKey: CryptoKey = {
                algorithm: key_algorithm,
                extractable: extractable,
                type: KeyType.Private,
                usages: keyUsages,
                handle: {
                    type: "private",
                    data: keyData,
                },
            }

            // 19-22.
            let keyPair: CryptoKeyPair = {
                publicKey: publicKey,
                privateKey: privateKey,
            }
            return Result.ok(keyPair);
        } else {
            let err = result.error()
            return Result.error<CryptoKeyPair>(changetype<Error>(err));
        }

    } else if (algorithmName === "ECDH") {
        // 1.
        let find = keyUsages.findIndex(usage => {
            return usage != "deriveKey" && usage != "deriveBits"
        });
        if (find != -1) {
            return Result.error<CryptoKeyPair>(changetype<Error>("Invalid key usages"));
        }

        // 2-3.
        if (!supportedNamedCurves.includes(algorithm.namedCurve)) {
            return Result.error<CryptoKeyPair>(changetype<Error>("Curve not supported: " + "NotSupportedError")));
        }

        //@ts-ignore
        let params: GenerateKeyOptions = {
            algorithm: "EC",
            namedCurve: algorithm.namedCurve,
        }
        let params_buffer = params.toBuffer();
        let result = hostCall("crypto", "subtle", "generateKey", params_buffer);

        if (result.isOk) {

            let keyData = result.get();

            // 4-6.
            const key_algorithm: KeyAlgorithm = {
                name: algorithmName,
                namedCurve: algorithm.namedCurve,
            };

            // 7-11.
            keyUsages = usageIntersection(keyUsages, []);
            let publicKey: CryptoKey = {
                algorithm: key_algorithm,
                extractable: true,
                type: KeyType.Public,
                usages: keyUsages,
                handle: {
                    type: "private",
                    data: keyData,
                },
            }


            // 12-16.
            keyUsages = usageIntersection(keyUsages, ["deriveKey", "deriveBits"]);
            let privateKey: CryptoKey = {
                algorithm: key_algorithm,
                extractable: extractable,
                type: KeyType.Private,
                usages: keyUsages,
                handle: {
                    type: "private",
                    data: keyData,
                },
            }

            // 19-22.
            let keyPair: CryptoKeyPair = {
                publicKey: publicKey,
                privateKey: privateKey,
            }
            return Result.ok(keyPair);
        } else {
            let err = result.error()
            return Result.error<CryptoKeyPair>(changetype<Error>(err));
        }
    }
}


export function generateAesKey(algorithm: AesKeyGenParams, extractable: bool, keyUsages: KeyUsage): Result<CryptoKey> {
    const algorithmName = algorithm.name;

    // 2.
    if (algorithm.length != 128 && algorithm.length != 192 && algorithm.length != 256) {
        return Result.error<CryptoKey>(changetype<Error>("Invalid key length"));
    }

    // 3.
    //@ts-ignore
    let params: GenerateKeyOptions = {
        algorithm: "AES",
        length: algorithm.length,
    }
    let params_buffer = params.toBuffer();
    let result = hostCall("crypto", "subtle", "generateKey", params_buffer);

    if (result.isOk) {
        let keyData = result.get();

        // 6-8.
        // @ts-ignore
        const key_algorithm: KeyAlgorithm = {
            name: algorithmName,
            length: algorithm.length,
        };

        // 9-11.
        let key: CryptoKey = {
            algorithm: key_algorithm,
            extractable: extractable,
            type: KeyType.Secret,
            usages: keyUsages,
            handle: {
                type: "secret",
                data: keyData,
            },
        }

        return Result.ok(key);
    } else {
        let err = result.error()
        return Result.error<CryptoKey>(changetype<Error>(err));
    }
}

export function generateHmacKey(algorithm: HmacKeyGenParams, extractable: bool, keyUsages: KeyUsage): Result<CryptoKey> {
    //1. If usages contains any entry which is not "sign" or "verify", then throw a SyntaxError. 
    let find = keyUsages.findIndex(usage => {
        return usage != "sign" && usage != "verify"
    });
    if (find != -1) {
        return Result.error<CryptoKey>(changetype<Error>("Invalid key usages"));
    }

    let length: i64 = -1;
    if (algorithm.length !== 0) {
        length = algorithm.length;
    } else {
        return Result.error<CryptoKey>(changetype<Error>("Invalid length: " + "OperationError"));
    }
    //@ts-ignore: valid conversion
    let params: GenerateKeyOptions = {
        algorithm: "HMAC",
        hash: algorithm.hash,
        length,
    }

    let params_buffer = params.toBuffer();
    let result = hostCall("crypto", "subtle", "generateKey", params_buffer);

    if (result.isOk) {
        let keyData = result.get();

        //@ts-ignore: valid conversion
        let key_algorithm: KeyAlgorithm = {
            name: "HMAC",
            hash: algorithm.hash,
            length: keyData.byteLength * 8,
        };

        let crypto_key: CryptoKey = {
            algorithm: key_algorithm,
            extractable: extractable,
            type: KeyType.Secret,
            usages: keyUsages,
            handle: {
                type: "secret",
                data: keyData,
            },
        }

        return Result.ok(crypto_key)
    } else {
        let err = result.error()
        return Result.error<CryptoKey>(changetype<Error>(err));
    }
}


function usageIntersection(a: KeyUsage, b: KeyUsage): KeyUsage {

    let result: KeyUsage = [];
    for (let i = 0; i < a.length; i++) {
        const element = a[i];

        if (b.includes(element)) {
            // return [element];
            result.push(element);
        }
    }

    return result;

    // return a.filter((i) => b.includes(i));
}


// export function generateKey<T>(algorithm: T, extractable: bool, keyUsages: KeyUsage) {
//     const algorithmName = algorithm.name;

//     switch (algorithmName) {
//       case "X25519": {
//         if (
//           ArrayPrototypeFind(
//             usages,
//             (u) => !ArrayPrototypeIncludes(["deriveKey", "deriveBits"], u),
//           ) !== undefined
//         ) {
//           throw new DOMException("Invalid key usages", "SyntaxError");
//         }
//         const privateKeyData = new Uint8Array(32);
//         const publicKeyData = new Uint8Array(32);
//         ops.op_generate_x25519_keypair(privateKeyData, publicKeyData);

//         const handle = {};
//         WeakMapPrototypeSet(KEY_STORE, handle, privateKeyData);

//         const publicHandle = {};
//         WeakMapPrototypeSet(KEY_STORE, publicHandle, publicKeyData);

//         const algorithm = {
//           name: algorithmName,
//         };

//         const publicKey = constructKey(
//           "public",
//           true,
//           usageIntersection(usages, []),
//           algorithm,
//           publicHandle,
//         );

//         const privateKey = constructKey(
//           "private",
//           extractable,
//           usageIntersection(usages, ["deriveKey", "deriveBits"]),
//           algorithm,
//           handle,
//         );

//         return { publicKey, privateKey };
//       }
//       case "Ed25519": {
//         if (
//           ArrayPrototypeFind(
//             usages,
//             (u) => !ArrayPrototypeIncludes(["sign", "verify"], u),
//           ) !== undefined
//         ) {
//           throw new DOMException("Invalid key usages", "SyntaxError");
//         }

//         const ED25519_SEED_LEN = 32;
//         const ED25519_PUBLIC_KEY_LEN = 32;
//         const privateKeyData = new Uint8Array(ED25519_SEED_LEN);
//         const publicKeyData = new Uint8Array(ED25519_PUBLIC_KEY_LEN);
//         if (
//           !ops.op_generate_ed25519_keypair(privateKeyData, publicKeyData)
//         ) {
//           throw new DOMException("Failed to generate key", "OperationError");
//         }

//         const handle = {};
//         WeakMapPrototypeSet(KEY_STORE, handle, privateKeyData);

//         const publicHandle = {};
//         WeakMapPrototypeSet(KEY_STORE, publicHandle, publicKeyData);

//         const algorithm = {
//           name: algorithmName,
//         };

//         const publicKey = constructKey(
//           "public",
//           true,
//           usageIntersection(usages, ["verify"]),
//           algorithm,
//           publicHandle,
//         );

//         const privateKey = constructKey(
//           "private",
//           extractable,
//           usageIntersection(usages, ["sign"]),
//           algorithm,
//           handle,
//         );

//         return { publicKey, privateKey };
//       }
//     }
//   }
