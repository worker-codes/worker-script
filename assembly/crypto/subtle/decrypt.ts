import { hostCall, Result } from "../../worker/wapc";
import { copyBuffer } from "../crypto";
import { AesCbcParams, AesCtrParams, AesGcmParams, RsaOaepParams } from "../input_output";
import { CryptoKey, DecryptAlgorithmOptions, KeyType } from "../types";

export function decrypt<T>(algorithm: T, key: CryptoKey, _data: ArrayBuffer): Result<ArrayBuffer> {

    // 2.
    let data = copyBuffer(_data);

    // 8.
    if (algorithm.name !== key.algorithm.name) {
        return Result.error<ArrayBuffer>(changetype<Error>("OperationError: Decryption algorithm doesn't match key algorithm."));
    }

    // 9.
    if (key.usages.indexOf("decrypt") !== -1) {
        return Result.error<ArrayBuffer>(changetype<Error>("InvalidAccessError: Key does not support the 'decrypt' operation."));
    }

    const handle = key.handle;
    const keyData = handle.data;

    if (algorithm instanceof RsaOaepParams) {

        // 1.
        if (key.type !== KeyType.Private) {
            return Result.error<ArrayBuffer>(changetype<Error>("InvalidAccessError: Key type not supported"));
        }

        // 2.
        if (algorithm.label) {
            algorithm.label = copyBuffer(algorithm.label);
        } else {
            algorithm.label = new ArrayBuffer(0);
        }

        // 3-5.
        let decrypt_algorithm: DecryptAlgorithmOptions = {
            algorithm: "RSA-OAEP",
            key: keyData,
            hash: key.algorithm.hash,
            label: algorithm.label,
            data: data,
        }
        let decrypt_algorithm_buffer = decrypt_algorithm.toBuffer();
        let plainText = hostCall("crypto", "subtle", "decrypt", decrypt_algorithm_buffer);

        // 6.
        if (plainText.isOk) {
            let decrypted = plainText.get();
            return Result.ok<ArrayBuffer>(decrypted);
        } else {
            return Result.error<ArrayBuffer>(changetype<Error>("Decryption failed"));
        }
    } else if (algorithm instanceof AesCbcParams) {
        algorithm.iv = copyBuffer(algorithm.iv);

        // 1.
        if (algorithm.iv.byteLength !== 16) {
            return Result.error<ArrayBuffer>(changetype<Error>("OperationError: Counter must be 16 bytes"));
        }

        // 2
        let decrypt_algorithm: DecryptAlgorithmOptions = {
            algorithm: "AES-CBC",
            key: keyData,
            length: key.algorithm.length,
            iv: algorithm.iv,
            data: data,
        }

        let decrypt_algorithm_buffer = decrypt_algorithm.toBuffer();
        let result = hostCall("crypto", "subtle", "decrypt", decrypt_algorithm_buffer);

        // 6.
        if (result.isOk) {
            let decrypted = result.get();
            return Result.ok<ArrayBuffer>(decrypted);
        } else {
            return Result.error<ArrayBuffer>(changetype<Error>("Decryption failed"));
        }
    } else if (algorithm instanceof AesCtrParams) {

        algorithm.counter = copyBuffer(algorithm.counter);

        // 1.
        if (algorithm.counter.byteLength !== 16) {
            return Result.error<ArrayBuffer>(changetype<Error>("OperationError: Counter vector must be 16 bytes"));
        }

        // 2.
        if (algorithm.length === 0 || algorithm.length > 128) {
            return Result.error<ArrayBuffer>(changetype<Error>("OperationError: Counter length must not be 0 or greater than 128"));
        }

        // 3.
        let decrypt_algorithm: DecryptAlgorithmOptions = {
            algorithm: "AES-CTR",
            key: keyData,
            keyLength: key.algorithm.length,
            counter: algorithm.counter,
            ctrLength: algorithm.length,
            data: data,
        }

        let decrypt_algorithm_buffer = decrypt_algorithm.toBuffer();
        let result = hostCall("crypto", "subtle", "decrypt", decrypt_algorithm_buffer);

        // 4.
        if (result.isOk) {
            let decrypted = result.get();
            return Result.ok<ArrayBuffer>(decrypted);
        } else {
            return Result.error<ArrayBuffer>(changetype<Error>("Decryption failed"));
        }
    } else if (algorithm instanceof AesGcmParams) {

        algorithm.iv = copyBuffer(algorithm.iv);

        // 1.
        if (algorithm.tagLength != null) {
            algorithm.tagLength = 128;
        } else {
            if (algorithm.tagLength != 32 && algorithm.tagLength != 64 && algorithm.tagLength != 96 && algorithm.tagLength != 104 && algorithm.tagLength != 112 && algorithm.tagLength != 120 && algorithm.tagLength != 128) {
                return Result.error<ArrayBuffer>(changetype<Error>("OperationError: Tag length not supported"));
            }
        }

        // 2.
        if (data.byteLength < algorithm.tagLength / 8) {
            return Result.error<ArrayBuffer>(changetype<Error>("OperationError: Tag length overflows ciphertext"));
        }

        // 3. We only support 96-bit and 128-bit nonce.
        if ([12, 16].indexOf(algorithm.iv.byteLength) === -1) {
            return Result.error<ArrayBuffer>(changetype<Error>("NotSupportedError: Initialization vector length not supported"));
        }

        // 4.
        if (algorithm.additionalData) {
            if (algorithm.additionalData.byteLength > (2 ** 64) - 1) {
                return Result.error<ArrayBuffer>(changetype<Error>("OperationError: Additional data too large"));
            }
            algorithm.additionalData = copyBuffer(algorithm.additionalData);
        } 



        // 5-8.
        let decrypt_algorithm: DecryptAlgorithmOptions = {
            algorithm: "AES-GCM",
            key: keyData,
            length: key.algorithm.length,
            iv: algorithm.iv,
            additionalData: algorithm.additionalData || null,
            tagLength: algorithm.tagLength,
            data: data,
        }

        let decrypt_algorithm_buffer = decrypt_algorithm.toBuffer();
        let result = hostCall("crypto", "subtle", "decrypt", decrypt_algorithm_buffer);

        // 5.
        if (result.isOk) {
            let decrypted = result.get();
            return Result.ok<ArrayBuffer>(decrypted);
        } else {
            return Result.error<ArrayBuffer>(changetype<Error>("Decryption failed"));
        }
    } else {
        return Result.error<ArrayBuffer>(changetype<Error>("Not implemented: " + "NotSupportedError"));
    }

}