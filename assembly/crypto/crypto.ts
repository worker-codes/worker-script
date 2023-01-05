import { hostCall, Result } from "@wapc/as-guest";
import { Decoder, Writer, Encoder, Sizer } from "@wapc/as-msgpack";

export class KeyAlgorithm {
    name: string;
}
// export class KeyType{
//     definition: string;
// }
// export class KeyUsage{
//     definition: string;
// }
export const enum KeyType {
    secret = 1,
    private = 2,
    public = 3
}

export const enum KeyUsage {
    encrypt = 1,
    decrypt = 2,
    sign = 3,
    verify = 4,
    deriveKey = 5,
    deriveBits = 6,
    wrapKey = 7,
    unwrapKey = 8
}
export class CryptoKey {
    algorithm: KeyAlgorithm;
    extractable: bool;
    type: KeyType;
    usages: KeyUsage[];
}


// See https://www.w3.org/TR/WebCryptoAPI/#dfn-normalize-an-algorithm
// 18.4.4
function normalizeAlgorithm(algorithm: string, op: string) {
    if (typeof algorithm == "string") {
        return normalizeAlgorithm({ name: algorithm }, op);
    }

    // 1.
    const registeredAlgorithms = supportedAlgorithms[op];
    // 2. 3.
    const initialAlg = webidl.converters.Algorithm(algorithm, {
        prefix: "Failed to normalize algorithm",
        context: "passed algorithm",
    });
    // 4.
    let algName:string = initialAlg.name;

    // 5.
    let desiredType = null;
    for (const key in registeredAlgorithms) {
        if (
            key.toUpperCase() === algName.toUpperCase() 
        ) {
            algName = key;
            desiredType = registeredAlgorithms[key];
        }
    }
    if (desiredType === null) {
        
      throw new DOMException(
            "Unrecognized algorithm name",
            "NotSupportedError",
        );
    }

    // Fast path everything below if the registered dictionary is "None".
    if (desiredType === null) {
        return { name: algName };
    }

    // 6.
    const normalizedAlgorithm = webidl.converters[desiredType](algorithm, {
        prefix: "Failed to normalize algorithm",
        context: "passed algorithm",
    });
    // 7.
    normalizedAlgorithm.name = algName;

    // 9.
    const dict = simpleAlgorithmDictionaries[desiredType];
    // 10.
    for (const member in dict) {
        const idlType = dict[member];
        const idlValue = normalizedAlgorithm[member];
        // 3.
        if (idlType === "BufferSource" && idlValue) {
            normalizedAlgorithm[member] = Uint8Array.wrap(
                ArrayBufferIsView(idlValue) ? idlValue.buffer : idlValue,
                    idlValue.byteOffset ?? 0,
                    idlValue.byteLength,
            );
     
            // normalizedAlgorithm[member] = TypedArrayPrototypeSlice(
            //     new Uint8Array(
            //         ArrayBufferIsView(idlValue) ? idlValue.buffer : idlValue,
            //         idlValue.byteOffset ?? 0,
            //         idlValue.byteLength,
            //     ),
            // );
        } else if (idlType === "HashAlgorithmIdentifier") {
            normalizedAlgorithm[member] = normalizeAlgorithm(idlValue, "digest");
        } else if (idlType === "AlgorithmIdentifier") {
            // TODO(lucacasonato): implement
            throw new TypeError("unimplemented");
        }
    }

    return normalizedAlgorithm;
}

function encrypt(normalizedAlgorithm, key:CryptoKey, data:ArrayBuffer) {


    switch (normalizedAlgorithm.name) {
        case "RSA-OAEP": {
            // 1.
            if (key.type !== KeyType.public) {
                return Result.error<ArrayBuffer>(new Error("InvalidAccessError: Key type not supported"));
            }

            // 2.
            if (normalizedAlgorithm.label) {
                normalizedAlgorithm.label = copyBuffer(normalizedAlgorithm.label);
            } else {
                normalizedAlgorithm.label = new Uint8Array(0);
            }

            // 3-5.
            const hashAlgorithm = key.algorithm.name;
            const cipherText = core.opAsync("op_crypto_encrypt", {
                key: keyData,
                algorithm: "RSA-OAEP",
                hash: hashAlgorithm,
                label: normalizedAlgorithm.label,
            }, data);

            // 6.
            return cipherText.buffer;
        }
        case "AES-CBC": {
            normalizedAlgorithm.iv = copyBuffer(normalizedAlgorithm.iv);

            // 1.
            if (normalizedAlgorithm.iv.byteLength !== 16) {
                return Result.error<ArrayBuffer>(new Error("OperationError: Initialization vector must be 16 bytes"));
            }

            // 2.
            const cipherText = core.opAsync("op_crypto_encrypt", {
                key: keyData,
                algorithm: "AES-CBC",
                length: key[_algorithm].length,
                iv: normalizedAlgorithm.iv,
            }, data);

            // 4.
            return cipherText.buffer;
        }
        case "AES-CTR": {
            normalizedAlgorithm.counter = copyBuffer(normalizedAlgorithm.counter);

            // 1.
            if (normalizedAlgorithm.counter.byteLength !== 16) {
                return Result.error<ArrayBuffer>(new Error("OperationError: Counter vector must be 16 bytes"));
            }

            // 2.
            if (
                normalizedAlgorithm.length == 0 || normalizedAlgorithm.length > 128
            ) {
                return Result.error<ArrayBuffer>(new Error("OperationError: Counter length must not be 0 or greater than 128"));
            }

            // 3.
            const cipherText = core.opAsync("op_crypto_encrypt", {
                key: keyData,
                algorithm: "AES-CTR",
                keyLength: key[_algorithm].length,
                counter: normalizedAlgorithm.counter,
                ctrLength: normalizedAlgorithm.length,
            }, data);

            // 4.
            return cipherText.buffer;
        }
        case "AES-GCM": {
            normalizedAlgorithm.iv = copyBuffer(normalizedAlgorithm.iv);

            // 1.
            if (data.byteLength > (2 ** 39) - 256) {
                return Result.error<ArrayBuffer>(new Error("OperationError: Plaintext too large"));
            }

            // 2.
            // We only support 96-bit and 128-bit nonce.
            if (
                ArrayPrototypeIncludes(
                    [12, 16],
                    normalizedAlgorithm.iv.byteLength,
                ) === undefined
            ) {
                return Result.error<ArrayBuffer>(new Error("NotSupportedError: Initialization vector length not supported"));
            }

            // 3.
            if (normalizedAlgorithm.additionalData !== undefined) {
                if (normalizedAlgorithm.additionalData.byteLength > (2 ** 64) - 1) {
                    return Result.error<ArrayBuffer>(new Error("OperationError: Additional data too large"));
                }
            }

            // 4.
            if (normalizedAlgorithm.tagLength == undefined) {
                normalizedAlgorithm.tagLength = 128;
            } else if (
                !ArrayPrototypeIncludes(
                    [32, 64, 96, 104, 112, 120, 128],
                    normalizedAlgorithm.tagLength,
                )
            ) {
                return Result.error<ArrayBuffer>(new Error("OperationError: Invalid tag length"));
            }
            // 5.
            if (normalizedAlgorithm.additionalData) {
                normalizedAlgorithm.additionalData = copyBuffer(
                    normalizedAlgorithm.additionalData,
                );
            }
            // 6-7.
            const cipherText = core.opAsync("op_crypto_encrypt", {
                key: keyData,
                algorithm: "AES-GCM",
                length: key[_algorithm].length,
                iv: normalizedAlgorithm.iv,
                additionalData: normalizedAlgorithm.additionalData || null,
                tagLength: normalizedAlgorithm.tagLength,
            }, data);

            // 8.
            return cipherText.buffer;
        }
        default:
            return Result.error<ArrayBuffer>(new Error("NotSupportedError: Not implemented"));
    }
}

function copyBuffer(input) {
    return TypedArrayPrototypeSlice(
        ArrayBufferIsView(input)
            ? new Uint8Array(input.buffer, input.byteOffset, input.byteLength)
            : new Uint8Array(input),
    );
}


export class SubtleCrypto {
    encrypt(algorithm: string, key: CryptoKey, data: ArrayBuffer): ArrayBuffer {

        const normalizedAlgorithm = normalizeAlgorithm(algorithm, "encrypt");

        // 8.
        if (normalizedAlgorithm.name !== key[_algorithm].name) {
            throw new Error(
                "Encryption algorithm doesn't match key algorithm."
            );
        }

        // 9.
        if (!ArrayPrototypeIncludes(key[_usages], "encrypt")) {
            throw new Error(
                "Key does not support the 'encrypt' operation."
            );
        }

        return encrypt(normalizedAlgorithm, key, data);

    }
    decrypt(algorithm: string, key: CryptoKey, data: ArrayBuffer): ArrayBuffer {

    }
    sign(algorithm: string, key: CryptoKey, data: ArrayBuffer): ArrayBuffer {

    }
    verify(algorithm: string, key: CryptoKey, data: ArrayBuffer): ArrayBuffer {

    }
    digest(algorithm: string, data: ArrayBuffer): ArrayBuffer {
        let arg: EncodeDigestArg = {
            algorithm,
            data,
        }

        let arg_encoded = arg.toBuffer();

        let result = hostCall("crypto", "digest", "", arg_encoded);
        let resp: ArrayBuffer = result.get();

        return resp;
    }
    generateKey(algorithm: string, extractable: bool, keyUsages: KeyUsage[]): ArrayBuffer {

    }
    deriveKey(algorithm: string, baseKey: CryptoKey, derivedKeyAlgorithm: string, extractable: bool, keyUsages: KeyUsage[]): ArrayBuffer {

    }
    deriveBits(algorithm: string, baseKey: CryptoKey, length: u32): ArrayBuffer {

    }
    importKey(format: string, keyData: ArrayBuffer, algorithm: string, extractable: bool, keyUsages: KeyUsage[]): ArrayBuffer {

    }
    exportKey(format: string, key: CryptoKey): ArrayBuffer {

    }
    wrapKey(format: string, key: CryptoKey, wrappingKey: CryptoKey, unwrapAlgorithm: string): ArrayBuffer {

    }
    unwrapKey(format: string, key: CryptoKey, unwrappingKey: CryptoKey, unwrapAlgorithm: string, unwrappedKeyAlgorithm: string, extractable: bool, keyUsages: KeyUsage[]): ArrayBuffer {

    }

}
export class Crypto {
    subtle: SubtleCrypto = {};

    getRandomValues<TArray extends TypedArray<T>, T extends number>(typedArray: TArray): void {
        if (!(typedArray instanceof Uint8Array)) {
            throw new Error("Only Uint8Array are supported at present")
        }

        // if (
        //   !(
        //     typedArray instanceof Int8Array ||
        //     typedArray instanceof Uint8Array ||
        //     typedArray instanceof Uint8ClampedArray ||
        //     typedArray instanceof Int16Array ||
        //     typedArray instanceof Uint16Array ||
        //     typedArray instanceof Int32Array ||
        //     typedArray instanceof Uint32Array
        //     // typedArray instanceof BigInt64Array ||
        //     // typedArray instanceof BigUint64Array
        //   )
        // ) {
        //   throw new Error(
        //     "The provided ArrayBufferView is not an integer array type TypeMismatchError",
        //   );
        // }

        if (typedArray.length > 65536) {
            new Error(`The ArrayBufferView's byte length (${typedArray.length}) exceeds the number of bytes of entropy available via this API (65536)`);

        }

        // const arr = new ArrayBuffer(4)
        // const view = new DataView(arr)
        // view.setInt32(0, typedArray.length);

        const len = new Number<u32>(typedArray.length);
        const lenBuffer = len.toBuffer();

        let result = hostCall("crypto", "getRandomValues", "", lenBuffer);
        let resultArr: ArrayBuffer = result.get();
        const newArr = Uint8Array.wrap(resultArr, 0, typedArray.length);

        const ui8 = Uint8Array.wrap(
            typedArray.buffer,
            typedArray.byteOffset,
            typedArray.byteLength,
        );

        typedArray.set(newArr);
        return
    }

    randomUUID(): string {

        let result = hostCall("crypto", "randomUUID", "", new ArrayBuffer(0));
        let resp: ArrayBuffer = result.get();
        let uuid: string = String.UTF8.decode(resp);
        return uuid;

    }

}

class EncodeDigestArg {
    algorithm: string;
    data: ArrayBuffer

    encode(writer: Writer): void {
        writer.writeMapSize(2);
        writer.writeString("algorithm");
        writer.writeString(this.algorithm);
        writer.writeString("data");
        writer.writeByteArray(this.data);
    }
    decode(reader: Decoder): void {
        var numFields = reader.readMapSize();

        while (numFields > 0) {
            numFields--;
            const field = reader.readString();
            if (field == "algorithm") {
                this.algorithm = reader.readString();
                console.log(this.algorithm);

            } else if (field == "data") {
                this.data = reader.readByteArray();
            }

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

    fromBuffer(buffer: ArrayBuffer): void {
        const decoder = new Decoder(buffer);
        this.decode(decoder);
    }

}


// let crypt: crypto = {};

// export crypt;

// type CryptoData = BufferSource | string;
type CryptoData = string;

declare var bridge: any

/** @hidden */
export const crypto: Crypto = {
    // subtle: {
    //   digest(algo: string, data: ArrayBuffer, encoding?: string): ArrayBuffer {
    //     // return bridge.dispatch("digestHash", algo, data, encoding)
    //     let result = hostCall("crypto", "digest", "", new ArrayBuffer(0));
    //     let resp: ArrayBuffer = result.get();
    //     return resp;
    //   },

    // },

    // randomUUID(): string {

    //   let result = hostCall("crypto", "randomUUID", "", new ArrayBuffer(0));
    //   let resp:ArrayBuffer = result.get();
    //   let uuid: string = String.UTF8.decode(resp);
    //   return uuid;

    // }

}

// const uIntToBytes = (num:number, size:number, method:string):ArrayBuffer => {
//   const arr = new ArrayBuffer(size)
//   const view = new DataView(arr)
//   view.setInt16(0, num);
//   // let f: string = method + (size * 8);
//   // view[f](0, num)
//   return arr
// }

// const toBytes = (data:number, type:string) =>
//   type == "u8"  ? uIntToBytes(data, 1, "setUint") :
//   type == "u16" ? uIntToBytes(data, 2, "setUint") :
//   type == "u32" ? uIntToBytes(data, 4, "setUint") 
//   // type == "u64" ? uIntToBytes(BigInt(data), 8, "setBigUint")
//                 : `Not Sure about type - ${type}`



class Number<T> {
    constructor(public value: T) { }

    fromBuffer(buffer: ArrayBuffer): void {
        const decoder = new Decoder(buffer);
        this.decode(decoder);
        const err = decoder.error()
        if (err) {
            throw err;
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

    decode(reader: Decoder): void {
        var numFields = reader.readMapSize();

        while (numFields > 0) {
            numFields--;
            const field = reader.readString();

            if (field == "value") {
                if (this.value instanceof u8) {
                    this.value = <T>reader.readUInt8();
                } else if (this.value instanceof u16) {
                    this.value = <T>reader.readUInt16();
                } else if (this.value instanceof i32) {
                    this.value = <T>reader.readInt32();
                } else if (this.value instanceof u32) {
                    this.value = <T>reader.readUInt32();
                } else if (this.value instanceof f32) {
                    this.value = <T>reader.readFloat32();
                } else if (this.value instanceof f64) {
                    this.value = <T>reader.readFloat64();
                } else {
                    throw new Error("not implemented");
                }
            } else {
                reader.skip();
            }
        }
    }

    encode(writer: Writer): void {
        writer.writeMapSize(1);
        writer.writeString("value");
        if (this.value instanceof u8) {
            writer.writeUInt8(<u8>this.value);
        } else if (this.value instanceof u16) {
            writer.writeUInt16(<u16>this.value);
        } else if (this.value instanceof i32) {
            writer.writeInt32(<i32>this.value);
        } else if (this.value instanceof u32) {
            writer.writeUInt32(<u32>this.value);
        } else if (this.value instanceof f32) {
            writer.writeFloat32(<f32>this.value);
        } else if (this.value instanceof f64) {
            writer.writeFloat64(<f64>this.value);
        } else {
            throw new Error("not implemented");
        }
    }
}