import { hostCall, Result } from "../../worker/wapc";
import { copyBuffer } from "../crypto";
import { AesCbcParams, AesCtrParams, AesGcmParams, Algorithm, EcdsaParams, RsaOaepParams, RsaPssParams } from "../input_output";
import { AlgorithmOptions, CryptoKey, DecryptAlgorithmOptions, KeyType } from "../types";

export function sign<T>(algorithm: T, key: CryptoKey, _data: ArrayBuffer): Result<ArrayBuffer> {

    // 2.
    let data = copyBuffer(_data);

    // 8.
    if (algorithm.name !== key.algorithm.name) {
        return Result.error<ArrayBuffer>(changetype<Error>("InvalidAccessError: Signing algorithm doesn't match key algorithm"));
    }

    // 9.
    if (key.usages.indexOf("sign") !== -1) {
        return Result.error<ArrayBuffer>(changetype<Error>("InvalidAccessError: Key does not support the 'sign' operation."));
    }

    const handle = key.handle;
    const keyData = handle.data;

    if (algorithm instanceof Algorithm && algorithm.name === "RSASSA-PKCS1-v1_5") {

        // 1.
        if (key.type !== KeyType.Private) {
            return Result.error<ArrayBuffer>(changetype<Error>("InvalidAccessError: Key type not supported"));
        }

        // 2.
        let sign_algorithm: DecryptAlgorithmOptions = {
            algorithm: "RSASSA-PKCS1-v1_5",
            key: keyData,
            hash: key.algorithm.hash,
            data: data,
        }
        let sign_algorithm_buffer = sign_algorithm.toBuffer();
        let plainText = hostCall("crypto", "subtle", "sign", sign_algorithm_buffer);

        // 3.
        if (plainText.isOk) {
            let decrypted = plainText.get();
            return Result.ok<ArrayBuffer>(decrypted);
        } else {
            return Result.error<ArrayBuffer>(changetype<Error>("Decryption failed"));
        }
    } else if (algorithm instanceof RsaPssParams) {
        // 1.
        if (key.type !== KeyType.Private) {
            return Result.error<ArrayBuffer>(changetype<Error>("InvalidAccessError: Key type not supported"));
        }

        // 2.
        let sign_algorithm: AlgorithmOptions = {
            algorithm: "RSA-PSS",
            key: keyData,
            hash: key.algorithm.hash,
            saltLength: algorithm.saltLength,
            data: data,
        }
        let sign_algorithm_buffer = sign_algorithm.toBuffer();
        let plainText = hostCall("crypto", "subtle", "sign", sign_algorithm_buffer);

        // 3.
        if (plainText.isOk) {
            let decrypted = plainText.get();
            return Result.ok<ArrayBuffer>(decrypted);
        } else {
            return Result.error<ArrayBuffer>(changetype<Error>("Decryption failed"));
        }
    } else if (algorithm instanceof EcdsaParams) {

        // 1.
        if (key.type !== KeyType.Private) {
            return Result.error<ArrayBuffer>(changetype<Error>("InvalidAccessError: Key type not supported"));
        }

        // 2.
        if(key.algorithm.namedCurve === null || supportedNamedCurves.indexOf(key.algorithm.namedCurve) === -1) {
            return Result.error<ArrayBuffer>(changetype<Error>("NotSupportedError: Curve not supported"));
        }


        let sign_algorithm: AlgorithmOptions = {
            algorithm: "ECDSA",
            key: keyData,
            hash: algorithm.hash,
            namedCurve:key.algorithm.namedCurve,
            data: data,
        }
        let sign_algorithm_buffer = sign_algorithm.toBuffer();
        let plainText = hostCall("crypto", "subtle", "sign", sign_algorithm_buffer);

        // 3.
        if (plainText.isOk) {
            let decrypted = plainText.get();
            return Result.ok<ArrayBuffer>(decrypted);
        } else {
            return Result.error<ArrayBuffer>(changetype<Error>("Decryption failed"));
        }
    } else if (algorithm instanceof Algorithm && algorithm.name === "HMAC") {

        // 1.
        let sign_algorithm: AlgorithmOptions = {
            algorithm: "HMAC",
            key: keyData,
            hash: key.algorithm.hash,
            data: data,
        }
        let sign_algorithm_buffer = sign_algorithm.toBuffer();
        let plainText = hostCall("crypto", "subtle", "sign", sign_algorithm_buffer);

        // 3.
        if (plainText.isOk) {
            let decrypted = plainText.get();
            return Result.ok<ArrayBuffer>(decrypted);
        } else {
            return Result.error<ArrayBuffer>(changetype<Error>("Decryption failed"));
        }
    } else if (algorithm instanceof Algorithm && algorithm.name === "Ed25519") {

        // 1.
        if (key.type !== KeyType.Private) {
            return Result.error<ArrayBuffer>(changetype<Error>("InvalidAccessError: Key type not supported"));
        }

        // 2.
        const SIGNATURE_LEN = 32 * 2; // ELEM_LEN + SCALAR_LEN
        const signature = new Uint8Array(SIGNATURE_LEN);

        let sign_algorithm: AlgorithmOptions = {
            algorithm: "ED25519",
            key: keyData,
            signature:signature,
            data: data,
        }
        let sign_algorithm_buffer = sign_algorithm.toBuffer();
        let result = hostCall("crypto", "subtle", "sign_ed25519", sign_algorithm_buffer);

        // 3.
        if (result.isOk) {
            let decrypted = result.get();
            return Result.ok<ArrayBuffer>(decrypted);
        } else {
            return Result.error<ArrayBuffer>(changetype<Error>("OperationError: Failed to sign"));
        }
    } else {
        return Result.error<ArrayBuffer>(changetype<Error>("Not implemented: " + "NotSupportedError"));
    }

}