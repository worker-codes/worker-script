
import { Decoder, Writer, Encoder, Sizer } from "@wapc/as-msgpack";
import { hostCall,Result } from "../worker/wapc";
import { AesCbcParams, AesCtrParams, AesGcmParams, AesKeyGenParams, EcKeyGenParams, HmacKeyGenParams, RsaHashedKeyGenParams, RsaOaepParams } from "./input_output";
import { encrypt } from "./subtle/encrypt";
import { decrypt } from "./subtle/decrypt";
import { deriveBits } from "./subtle/deriveBits";
import { generateHmacKey, generateRsaHashedKey , generateAesKey, generateEcKey} from "./subtle/generate_key";
import { CryptoKey, CryptoKeyPair, EncodeDigestArg,  EncryptAlgorithmOptions, KeyAlgorithm, KeyType, Number } from "./types";
import { sign } from "./subtle/sign";
import { deriveKey } from "./subtle/deriveKey";

export function copyBuffer(input:ArrayBuffer):ArrayBuffer {
    let output = new ArrayBuffer(input.byteLength);
    let view = Uint8Array.wrap(output);
    for (let i = 0; i < input.byteLength; i++) {
        let inp = Uint8Array.wrap(input);
        view.set([inp.at(i)], i )          
    }
    return output;
}

export type KeyUsage = Array<String>;

export class SubtleCrypto {
    encrypt<T>(algorithm: T, key: CryptoKey, data: ArrayBuffer): Result<ArrayBuffer> {
       
        let result = encrypt<T>(algorithm, key, data);
        
        return result;
    }
    decrypt<T>(algorithm: T, key: CryptoKey, data: ArrayBuffer): Result<ArrayBuffer> {
        let result = decrypt<T>(algorithm, key, data);
        
        return result;
    }
    sign<T>(algorithm: T, key: CryptoKey, data: ArrayBuffer): Result<ArrayBuffer> {
        let result = sign<T>(algorithm, key, data);
        
        return result;
    }
    digest(algorithm: string, data: ArrayBuffer): Result<ArrayBuffer> {

        // If algorithm is provided as a <string>, it must be one of: ['SHA-1', 'SHA-256', 'SHA-384','SHA-512']
        // if (algorithm != "SHA-1" && algorithm != "SHA-256" && algorithm != "SHA-384" && algorithm != "SHA-512") {
        if (!['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'].includes(algorithm)) {
            return Result.error<ArrayBuffer>(changetype<Error>("Invalid algorithm: valid algorithms are 'SHA-1', 'SHA-256', 'SHA-384','SHA-512'"));
        }

        // @ts-ignore: valid conversion
        let arg: EncodeDigestArg = {
            algorithm,
            data,
        }

        let arg_buffer = arg.toBuffer();
        let result = hostCall("crypto", "subtle", "digest", arg_buffer);

        if (result.isOk) {
            let result_buffer = result.get();


            return Result.ok(result_buffer)
        } else {
            let err = result.error()

            return Result.error<ArrayBuffer>(changetype<Error>(err));
        }
    }
    generateKeyPair<T>(algorithm: T, extractable: bool, keyUsages: KeyUsage): Result<CryptoKeyPair> {
        // name of 

        let name = nameof<T>();
        console.log("generateKeyPair: " + name);
        
        if (algorithm instanceof RsaHashedKeyGenParams) {
            console.log("generateKey: RsaHashedKeyGenParams");
            
            let result = generateRsaHashedKey(algorithm, extractable, keyUsages);
            return result;
        } 

        return Result.error<CryptoKeyPair>(changetype<Error>("er_____________________________r"));
    }
    generateKey<T, U>(algorithm: T, extractable: bool, keyUsages: KeyUsage): Result<U> {

        if (algorithm instanceof RsaHashedKeyGenParams) {
            console.log("generateKey: RsaHashedKeyGenParams");
            
            let result = generateRsaHashedKey(algorithm, extractable, keyUsages);
            if (result.isOk) {
                let key = result.get();
                return Result.ok<U>(changetype<U>(key));
            } else {
                let err = result.error()
                return Result.error<U>(changetype<Error>(err));
            }
        } else if (algorithm instanceof EcKeyGenParams) {

            let result =  generateEcKey(algorithm, extractable, keyUsages);
                if (result.isOk) {
                    let key = result.get();
                    return Result.ok<U>(changetype<U>(key));
                } else {
                    let err = result.error()
                    return Result.error<U>(changetype<Error>(err));
                }

        } else if (algorithm instanceof AesKeyGenParams) {
            const algorithmName = algorithm.name;
            if (algorithmName === "AES-CTR" || algorithmName === "AES-CBC" || algorithmName === "AES-GCM") {
                let find = keyUsages.findIndex(usage => {
                    return usage != "encrypt" && usage != "decrypt" && usage != "wrapKey" && usage != "unwrapKey"
                });
                if (find != -1) {
                    return Result.error<U>(changetype<Error>("Invalid key usages"));
                }
        
                let result =  generateAesKey(algorithm, extractable, keyUsages);
                if (result.isOk) {
                    let key = result.get();
                    return Result.ok<U>(changetype<U>(key));
                } else {
                    let err = result.error()
                    return Result.error<U>(changetype<Error>(err));
                }
        
            } else if (algorithmName === "AES-CFB") {
                let find = keyUsages.findIndex(usage => {
                    return usage != "wrapKey" && usage != "unwrapKey"
                });
                if (find != -1) {
                    return Result.error<U>(changetype<Error>("Invalid key usages"));
                }
                
                let result =  generateAesKey(algorithm, extractable, keyUsages);
                if (result.isOk) {
                    let key = result.get();
                    return Result.ok<U>(changetype<U>(key));
                } else {
                    let err = result.error()
                    return Result.error<U>(changetype<Error>(err));
                }
            } else {
                return Result.error<U>(changetype<Error>("Invalid algorithm name: "+"NotSupportedError"));
            }

        } else if (algorithm instanceof HmacKeyGenParams) {

            let result = generateHmacKey(algorithm, extractable, keyUsages);
            if (result.isOk) {
                let key = result.get();
                return Result.ok<U>(changetype<U>(key));
            } else {
                let err = result.error()
                return Result.error<U>(changetype<Error>(err));
            }
        }


        // const type = result[_type];
        // if ((type === "secret" || type === "private") && usages.length === 0) {
        // throw new DOMException("Invalid key usages", "SyntaxError");
        // }

        // if (result.privateKey[_usages].length === 0) {
        //     throw new DOMException("Invalid key usages", "SyntaxError");
        // }

        return Result.error<U>(changetype<Error>("er_____________________________r"));


    }

    deriveKey<T,K>(algorithm: T, baseKey: CryptoKey, derivedKeyAlgorithm: K, extractable: bool, keyUsages: KeyUsage[]): Result<CryptoKey> {
        const result = deriveKey<T,K>(algorithm, baseKey, derivedKeyAlgorithm, extractable, keyUsages);

        result
    }
    deriveBits<T>(algorithm: T, baseKey: CryptoKey, length: u32): Result<ArrayBuffer> {

        // 4-6.
        const result = deriveBits(algorithm, baseKey, length);
        // 7.
        if (algorithm.name !== baseKey.algorithm.name) {
            return Result.error<ArrayBuffer>(changetype<Error>("InvalidAccessError: Invalid algorithm name"));
        }
        // 8.
        if (baseKey.usages.indexOf("deriveBits") == -1) {
            return Result.error<ArrayBuffer>(changetype<Error>("InvalidAccessError: baseKey usages does not contain `deriveBits`"));
        }
        // 9-10.
        return result;

    }
    // importKey(format: string, keyData: ArrayBuffer, algorithm: string, extractable: bool, keyUsages: KeyUsage[]): Result<ArrayBuffer> {

    // }
    // exportKey(format: string, key: CryptoKey): Result<ArrayBuffer> {

    // }
    // wrapKey(format: string, key: CryptoKey, wrappingKey: CryptoKey, unwrapAlgorithm: string): Result<ArrayBuffer> {

    // }
    // unwrapKey(format: string, key: CryptoKey, unwrappingKey: CryptoKey, unwrapAlgorithm: string, unwrappedKeyAlgorithm: string, extractable: bool, keyUsages: KeyUsage[]): Result<ArrayBuffer> {

    // }

}
export class Crypto {
    subtle: SubtleCrypto = new SubtleCrypto();

    getRandomValues<TArray extends TypedArray<T>, T extends number>(typedArray: TArray): void {
        if (!(typedArray instanceof Uint8Array)) {
            throw new Error("Only Uint8Array are supported at present")
        }

        if (
            !(

                typedArray instanceof Uint8ClampedArray ||
                typedArray instanceof Int16Array ||
                typedArray instanceof Uint16Array ||
                typedArray instanceof Int32Array ||
                typedArray instanceof Uint32Array ||
                typedArray instanceof Int8Array ||
                typedArray instanceof Uint8Array
                // typedArray instanceof BigInt64Array ||
                // typedArray instanceof BigUint64Array
            )
        ) {
            throw new Error(
                "The provided ArrayBufferView is not an integer array type TypeMismatchError",
            );
        }

        if (typedArray.length > 65536) {
            new Error(`The ArrayBufferView's byte length (${typedArray.length}) exceeds the number of bytes of entropy available via this API (65536)`);

        }

        // const arr = new ArrayBuffer(4)
        // const view = new DataView(arr)
        // view.setInt32(0, typedArray.length);

        const len = new Number<u32>(typedArray.length);
        const lenBuffer = len.toBuffer();

        let result = hostCall("crypto", "get_random_values", "", lenBuffer);
        if (result.isOk) {

            let resultArr: ArrayBuffer = result.get();

            const newArr = Uint8Array.wrap(resultArr, 0, typedArray.length);

            const ui8 = Uint8Array.wrap(
                typedArray.buffer,
                typedArray.byteOffset,
                typedArray.byteLength,
            );

            typedArray.set(newArr);
            return

        } else {
            let err = result.error()
            throw new Error(changetype<string>(err));
        }

    }

    randomUUID(): string {
        console.log("randomUUID>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");


        let result = hostCall("crypto", "random_uuid", "", new ArrayBuffer(0));
        let resp: ArrayBuffer = result.get();
        let uuid: string = String.UTF8.decode(resp);
        return uuid;

    }

}


// declare var bridge: any

// /** @hidden */
// export const crypto: Crypto = {
//     // subtle: {
//     //   digest(algo: string, data: ArrayBuffer, encoding?: string): Result<ArrayBuffer> {
//     //     // return bridge.dispatch("digestHash", algo, data, encoding)
//     //     let result = hostCall("crypto", "digest", "", new ArrayBuffer(0));
//     //     let resp: ArrayBuffer = result.get();
//     //     return resp;
//     //   },

//     // },

//     // randomUUID(): string {

//     //   let result = hostCall("crypto", "randomUUID", "", new ArrayBuffer(0));
//     //   let resp:ArrayBuffer = result.get();
//     //   let uuid: string = String.UTF8.decode(resp);
//     //   return uuid;

//     // }

// }

