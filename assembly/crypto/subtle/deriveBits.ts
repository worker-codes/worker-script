import { hostCall, Result } from "../../worker/wapc";
import { copyBuffer } from "../crypto";
import { Algorithm, EcdhKeyDeriveParams, HkdfParams, Pbkdf2Params } from "../input_output";
import { AlgorithmOptions, CryptoKey, DecryptAlgorithmOptions, KeyType, X25519AlgorithmOptions } from "../types";


export function deriveBits<T>(algorithm: T, baseKey: CryptoKey, length: i64): Result<ArrayBuffer> {

    if (algorithm instanceof Pbkdf2Params) {
        // 1.
        if (length == null || length == 0 || length % 8 !== 0) {
            return Result.error<ArrayBuffer>(changetype<Error>("OperationError: " + "Invalid length"));
        }

        if (algorithm.iterations == 0) {
            return Result.error<ArrayBuffer>(changetype<Error>("OperationError: " + "iterations must not be zero"));
        }

        const handle = baseKey.handle;
        const keyData = handle.data;

        algorithm.salt = copyBuffer(algorithm.salt);

        // 3-5.
        let encrypt_algorithm: AlgorithmOptions = {
            algorithm: "PBKDF2",
            key: keyData,
            hash: algorithm.hash,
            iterations: algorithm.iterations,
            data: algorithm.salt,
        }

        let encrypt_algorithm_buffer = encrypt_algorithm.toBuffer();
        let result = hostCall("crypto", "subtle", "derive_bits", encrypt_algorithm_buffer);
        if (result.isOk) {
            let encrypted = result.get();
            return Result.ok<ArrayBuffer>(encrypted);
        } else {
            return Result.error<ArrayBuffer>(changetype<Error>("Encryption failed"));
        }

    } else if (algorithm instanceof EcdhKeyDeriveParams) {
        // 1.
        if (baseKey.type !== KeyType.Private) {
            return Result.error<ArrayBuffer>(changetype<Error>("InvalidAccessError: Invalid key type"));
        }
        // 2.
        const publicKey = algorithm.public;
        // 3.
        if (publicKey.type !== KeyType.Public) {
            return Result.error<ArrayBuffer>(changetype<Error>("InvalidAccessError: Invalid key type"));
        }
        // 4.
        if (baseKey.algorithm.name !== publicKey.algorithm.name) {
            return Result.error<ArrayBuffer>(changetype<Error>("InvalidAccessError: Algorithm mismatch"));
        }

        // 5.
        if (
            publicKey.algorithm.namedCurve !== baseKey.algorithm.namedCurve
        ) {
            return Result.error<ArrayBuffer>(changetype<Error>("InvalidAccessError:namedCurve mismatch"));
        }

        // 6.
        if (publicKey.algorithm.namedCurve !== null || ["P-256", "P-384"].indexOf(publicKey.algorithm.namedCurve) !== -1) {

            const baseKeyhandle = baseKey.handle;
            const baseKeyData = baseKeyhandle.data;
            const publicKeyhandle = publicKey.handle;
            const publicKeyData = publicKeyhandle.data;


            let encrypt_algorithm: AlgorithmOptions = {
                algorithm: "ECDH",
                key: baseKeyData,
                publicKey: publicKeyData,
                namedCurve: publicKey.algorithm.namedCurve,
                length: length,
            }

            let encrypt_algorithm_buffer = encrypt_algorithm.toBuffer();
            let result = hostCall("crypto", "subtle", "derive_bits", encrypt_algorithm_buffer);
            if (result.isOk) {
                let buf = result.get();

                // 8.
                if (length === null) {
                    return Result.ok<ArrayBuffer>(buf);
                } else if (buf.byteLength * 8 < length) {
                    return Result.error<ArrayBuffer>(changetype<Error>("OperationError: " + "Invalid length"));
                } else {
                    let b = buf.slice(0, MathCeil(length / 8));
                    return Result.ok<ArrayBuffer>(b);
                }

            } else {
                return Result.error<ArrayBuffer>(changetype<Error>("Encryption failed"));
            }
        } else {
            return Result.error<ArrayBuffer>(changetype<Error>("NotSupportedError: Not implemented"));
        }


    } else if (algorithm instanceof HkdfParams) {
        // 1.
        if (length === null || length === 0 || length % 8 !== 0) {
            return Result.error<ArrayBuffer>(changetype<Error>("OperationError: " + "Invalid length"));
        }

        const handle = baseKey.handle;
        const keyDerivationKey = handle.data;

        algorithm.salt = copyBuffer(algorithm.salt);
        algorithm.info = copyBuffer(algorithm.info);

        let encrypt_algorithm: AlgorithmOptions = {
            algorithm: "HKDF",
            key: keyDerivationKey,
            hash: algorithm.hash,
            info: algorithm.info,
            length: length,
            data: algorithm.salt,
        }

        let encrypt_algorithm_buffer = encrypt_algorithm.toBuffer();
        let result = hostCall("crypto", "subtle", "derive_bits", encrypt_algorithm_buffer);
        if (result.isOk) {
            let encrypted = result.get();
            return Result.ok<ArrayBuffer>(encrypted);
        } else {
            return Result.error<ArrayBuffer>(changetype<Error>("Encryption failed"));
        }

    } else if (algorithm instanceof Algorithm && algorithm.name === "X25519") {
        // 1.
        if (baseKey.type !== KeyType.Private) {
            return Result.error<ArrayBuffer>(changetype<Error>("InvalidAccessError: Invalid key type"));
        }
        // 2.
        const publicKey = algorithm.public;
        // 3.
        if (publicKey.type !== KeyType.Public) {
            return Result.error<ArrayBuffer>(changetype<Error>("InvalidAccessError: Invalid key type"));
        }
        // 4.
        if (publicKey.algorithm.name !== baseKey.algorithm.name) {
            return Result.error<ArrayBuffer>(changetype<Error>("InvalidAccessError: Algorithm mismatch"));
        }

        // 5.
        const kHandle = baseKey.handle;
        const k = kHandle.data;

        const uHandle = publicKey.handle;
        const u = uHandle.data;

        const secret = new Uint8Array(32);

        let encrypt_algorithm: X25519AlgorithmOptions = {
            algorithm: "X25519",
            k: k,
            u: u,
            secret: secret,
        }

        let encrypt_algorithm_buffer = encrypt_algorithm.toBuffer();
        let result = hostCall("crypto", "subtle", "derive_bits_x25519", encrypt_algorithm_buffer);
        if (result.isOk) {
            let secret = result.get();
            
            // // 6.
            // if (isIdentity) {
            //     return Result.error<ArrayBuffer>(changetype<Error>("OperationError: Invalid key"));
            // }

            // 7.
            if (length === null) {
                return Result.ok<ArrayBuffer>(secret);
            } else if (secret.byteLength * 8 < length) {
                return Result.error<ArrayBuffer>(changetype<Error>("OperationError: " + "Invalid length"));
            } else {
                let b = secret.slice(0, MathCeil(length / 8));
                return Result.ok<ArrayBuffer>(b);
            }

        } else {
            return Result.error<ArrayBuffer>(changetype<Error>("Encryption failed"));
        }

    } else {
        return Result.error<ArrayBuffer>(changetype<Error>("Unsupported algorithm"));
    }
}