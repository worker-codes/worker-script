import { hostCall, Result } from "../../worker/wapc";
import { copyBuffer } from "../crypto";
import { AesCbcParams, AesCtrParams, AesGcmParams, RsaOaepParams } from "../input_output";
import { CryptoKey, EncryptAlgorithmOptions, KeyType } from "../types";

export function encrypt<T>(algorithm: T, key: CryptoKey, data: ArrayBuffer): Result<ArrayBuffer> {
    let handle = key.handle;
    if (handle == null) {
        return Result.error<ArrayBuffer>(changetype<Error>("Invalid key"));
    }

    let keyData = handle.data;

    if (algorithm instanceof RsaOaepParams) {
        // 1. 
        if (key.type !== KeyType.Public) {
            return Result.error<ArrayBuffer>(changetype<Error>("InvalidAccessError: Key type not supported"));
        }

        // 2.
        if (algorithm.label != null) {
            algorithm.label = copyBuffer(algorithm.label);
        } else {
            algorithm.label = new ArrayBuffer(0);
        }

        // 3-5.
        let encrypt_algorithm: EncryptAlgorithmOptions = {
            algorithm: "AES-CTR",
            key: keyData,
            hash: key.algorithm.hash,
            label: algorithm.label,
            data: data,
        }

        let encrypt_algorithm_buffer = encrypt_algorithm.toBuffer();
        let result = hostCall("crypto", "subtle", "encrypt", encrypt_algorithm_buffer);
        if (result.isOk) {
            let encrypted = result.get();
            return Result.ok<ArrayBuffer>(encrypted);
        } else {
            return Result.error<ArrayBuffer>(changetype<Error>("Encryption failed"));
        }


    } else if (algorithm instanceof AesCtrParams) {
        algorithm.counter = copyBuffer(algorithm.counter);

        // 1.
        if (algorithm.counter.byteLength !== 16) {
            return Result.error<ArrayBuffer>(changetype<Error>("OperationError: Counter length must be 16 bytes"));
        }

        // 2
        if (algorithm.length == 0 || algorithm.length > 128) {
            return Result.error<ArrayBuffer>(changetype<Error>("OperationError: Counter length must not be 0 or greater than 128"));
        }

        // 3.
        let encrypt_algorithm: EncryptAlgorithmOptions = {
            key: keyData,
            algorithm: "AES-CTR",
            keyLength: key.algorithm.length,
            counter: algorithm.counter,
            ctrLength: algorithm.length,
            data: data,
        }

        let encrypt_algorithm_buffer = encrypt_algorithm.toBuffer();
        let result = hostCall("crypto", "subtle", "encrypt", encrypt_algorithm_buffer);

        // 4.
        if (result.isOk) {
            let encrypted = result.get();
            return Result.ok<ArrayBuffer>(encrypted);
        } else {
            return Result.error<ArrayBuffer>(changetype<Error>("Encryption failed"));
        }

    } else if (algorithm instanceof AesCbcParams) {
        algorithm.iv = copyBuffer(algorithm.iv);

        // 1.
        if (algorithm.iv.byteLength !== 16) {
            return Result.error<ArrayBuffer>(changetype<Error>("OperationError: IV length must be 16 bytes"));
        }

        // 2
        let encrypt_algorithm: EncryptAlgorithmOptions = {
            algorithm: "AES-CBC",
            key: keyData,
            length: key.algorithm.length,
            iv: algorithm.iv,
            data: data,
        }

        let encrypt_algorithm_buffer = encrypt_algorithm.toBuffer();
        let result = hostCall("crypto", "subtle", "encrypt", encrypt_algorithm_buffer);

        // 4.
        if (result.isOk) {
            let encrypted = result.get();
            return Result.ok<ArrayBuffer>(encrypted);
        } else {
            return Result.error<ArrayBuffer>(changetype<Error>("Encryption failed"));
        }


    } else if (algorithm instanceof AesGcmParams) {
        algorithm.iv = copyBuffer(algorithm.iv);
        // 1.
        if (data.byteLength > (2 ** 39) - 256) {
            return Result.error<ArrayBuffer>(changetype<Error>("OperationError: Plaintext too large"));
        }

        // 2.
        if (algorithm.iv.byteLength !== 12 && algorithm.iv.byteLength !== 16) {
            return Result.error<ArrayBuffer>(changetype<Error>("NotSupportedError: Initialization vector length not supported"));
        }

        // 3.
        if (algorithm.additionalData != null) {
            if (algorithm.additionalData.byteLength > (2 ** 64) - 1) {
                return Result.error<ArrayBuffer>(changetype<Error>("OperationError: Additional data too large"));
            }
        }

        // 4.
        if (algorithm.tagLength != null) {
            algorithm.tagLength = 128;
        } else {
            if (algorithm.tagLength != 32 && algorithm.tagLength != 64 && algorithm.tagLength != 96 && algorithm.tagLength != 104 && algorithm.tagLength != 112 && algorithm.tagLength != 120 && algorithm.tagLength != 128) {
                return Result.error<ArrayBuffer>(changetype<Error>("OperationError: Tag length not supported"));
            }
        }

        // 5.
        if (algorithm.additionalData) {
            algorithm.additionalData = copyBuffer(
                algorithm.additionalData,
            );
        }

        // 6-7.
        let encrypt_algorithm: EncryptAlgorithmOptions = {
            algorithm: "AES-GCM",
            key: keyData,
            length: key.algorithm.length,
            iv: algorithm.iv,
            additionalData: algorithm.additionalData || null,
            tagLength: algorithm.tagLength,
            data: data,
        }
        let encrypt_algorithm_buffer = encrypt_algorithm.toBuffer();
        let result = hostCall("crypto", "subtle", "encrypt", encrypt_algorithm_buffer);

        // 8.
        if (result.isOk) {
            let encrypted = result.get();
            return Result.ok<ArrayBuffer>(encrypted);
        } else {
            return Result.error<ArrayBuffer>(changetype<Error>("Encryption failed"));
        }

    } else {
        return Result.error<ArrayBuffer>(changetype<Error>("Invalid algorithm"));
    }
}
