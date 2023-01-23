import { hostCall, Result } from "../../worker/wapc";
import { copyBuffer, KeyUsage } from "../crypto";
import { AesCbcParams, AesCtrParams, AesGcmParams, AesKeyGenParams, Algorithm, EcdsaParams, HkdfParams, HmacKeyGenParams, Pbkdf2Params, RsaOaepParams, RsaPssParams } from "../input_output";
import { AlgorithmOptions, CryptoKey, DecryptAlgorithmOptions, KeyType } from "../types";
import { deriveBits } from "./deriveBits";
import { importKey } from "./importKey";


export function deriveKey<T, K>(algorithm: T, baseKey: CryptoKey, derivedKeyAlgorithm: K, extractable: bool, keyUsages: KeyUsage[]): Result<CryptoKey> {


    // 11.
    if (algorithm.name !== baseKey.algorithm.name) {
        return Result.error<CryptoKey>(changetype<Error>("Algorithm name mismatch"));
    }

    // 12.
    if (baseKey.usages.indexOf("deriveKey") == -1) {
        return Result.error<CryptoKey>(changetype<Error>("InvalidAccessError: baseKey usages does not contain `deriveKey`"));
    }

    // 13.
    const length = getKeyLength<K>(derivedKeyAlgorithm);
    if (length.isOk) {

        let _length = length.get();
        // 14.
        const secret = deriveBits(
            algorithm,
            baseKey,
            _length,
        );

        if (secret.isOk) {

            let _secret = secret.get();
            // 15.
            const result = importKey(
                "raw",
                _secret,
                derivedKeyAlgorithm,
                extractable,
                keyUsages,
            );
            if (result.isOk) {

                let _result = result.get();
                // 16.
                if (
                    [KeyType.Private, KeyType.Secret].indexOf(_result.type) &&
                    keyUsages.length == 0
                ) {
                    return Result.error<CryptoKey>(changetype<Error>("Invalid key usages"));
                }
                // 17.
                return result;
                
            } else {    
                return Result.error<CryptoKey>(changetype<Error>("Failed to import key"));
            }
        } else {    
            return Result.error<CryptoKey>(changetype<Error>("Failed to derive bits"));
        }
    } else {    
        return Result.error<CryptoKey>(changetype<Error>("Failed to get key length"));
    }

}



function getKeyLength<T>(algorithm: T): Result<i64> {

    if (algorithm instanceof AesKeyGenParams) {
         // 1.
        if ([128, 192, 256].indexOf(algorithm.length) == -1) {
            return Result.error<i64>(changetype<Error>("OperationError: length must be 128, 192, or 256"));
        }

        // 2.
        return Result.ok<i64>(algorithm.length);
    } else if (algorithm instanceof HmacKeyGenParams) {
        // 1.
        let length;
        if (algorithm.length === undefined) {
            if (algorithm.hash === "SHA-1") {
                length = 512;
            } else if (algorithm.hash === "SHA-256") {
                length = 512;
            } else if (algorithm.hash === "SHA-384") {
                length = 1024;
            } else if (algorithm.hash === "SHA-512") {
                length = 1024;
            } else {
                return Result.error<i64>(changetype<Error>("NotSupportedError: Unrecognized hash algorithm"));
            }
        } else if (algorithm.length !== 0) {
            length = algorithm.length;
        } else {
            return Result.error<i64>(changetype<Error>("Invalid length."));
        }

        // 2.
        return Result.ok<i64>(length);
    } else if (algorithm instanceof Pbkdf2Params) {
        // 1.
        return Result.ok<i64>(-1);
    } else if (algorithm instanceof HkdfParams) {
        // 1.
        return Result.ok<i64>(-1);
    } else {
        return Result.error<i64>(changetype<Error>("Invalid algorithm"));
    }
}