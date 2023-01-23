import { Decoder, Writer, Encoder, Sizer } from "@wapc/as-msgpack";


export 
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

export class Number<T> {
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
export class X25519AlgorithmOptions {
    algorithm: string | null = null;
    k: ArrayBuffer | null = null;
    u: ArrayBuffer | null = null;
    secret: ArrayBuffer | null = null;

    encode(writer: Writer): void {
        writer.writeMapSize(4);
        writer.writeString("algorithm");
        if (this.algorithm === null) {
            writer.writeNil();
        } else {
            writer.writeString(this.algorithm);
        }
        writer.writeString("k");
        if (this.k === null) {
            writer.writeNil();
        } else {
            writer.writeByteArray(this.k);
        }
        writer.writeString("u");
        if (this.u === null) {
            writer.writeNil();
        } else {
            writer.writeByteArray(this.u);
        }
        writer.writeString("secret");
        if (this.secret === null) {
            writer.writeNil();
        } else {
            writer.writeByteArray(this.secret);
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

export class Hash {
    name: string;
}
export class KeyAlgorithm {
    name: string | null = null;
    length: i64 = -1;
    hash: string | null = null;
    modulusLength: i64 = -1;
    publicExponent: ArrayBuffer | null = null;
    namedCurve: string | null = null;
}
export class AlgorithmOptions {
    key: ArrayBuffer | null = null;
    algorithm: string | null = null;
    hash: string | null = null;    
    label: ArrayBuffer | null = null;
    length: i64 = -1;
    iv: ArrayBuffer | null = null;
    keyLength: i64 = -1;
    counter: ArrayBuffer | null = null;
    ctrLength: i64 = -1;
    data: ArrayBuffer | null = null;
    additionalData: ArrayBuffer | null = null;
    tagLength: i64 = -1;
    saltLength: i64 = -1;
    namedCurve: string | null = null;  
    signature: ArrayBuffer | null = null;
    iterations: i64 = -1;
    publicKey: ArrayBuffer | null = null;
    info: ArrayBuffer | null = null;

    encode(writer: Writer): void {
        writer.writeMapSize(5);
        writer.writeString("key");
        if (this.key === null) {
            writer.writeNil();
        } else {
            writer.writeByteArray(this.key);
        }
        writer.writeString("algorithm");
        if (this.algorithm === null) {
            writer.writeNil();
        } else {
            writer.writeString(this.algorithm);
        }
        writer.writeString("hash");
        if (this.hash === null) {
            writer.writeNil();
        } else {
            writer.writeString(this.hash);
        }
        writer.writeString("label");
        if (this.label === null) {
            writer.writeNil();
        } else {
            writer.writeByteArray(this.label);
        }
        writer.writeString("length");
        if (this.length === -1) {
            writer.writeNil();
        } else {
            writer.writeInt64(this.length);
        }
        writer.writeString("iv");
        if (this.iv === null) {
            writer.writeNil();
        } else {
            writer.writeByteArray(this.iv);
        }
        writer.writeString("keyLength");
        if (this.keyLength === -1) {
            writer.writeNil();
        } else {
            writer.writeInt64(this.keyLength);
        }
        writer.writeString("counter");
        if (this.counter === null) {
            writer.writeNil();
        } else {
            writer.writeByteArray(this.counter);
        }
        writer.writeString("ctrLength");
        if (this.ctrLength === -1) {
            writer.writeNil();
        } else {
            writer.writeInt64(this.ctrLength);
        }
        writer.writeString("data");
        if (this.data === null) {
            writer.writeNil();
        } else { 
            writer.writeByteArray(this.data);
        }
        writer.writeString("additionalData");
        if (this.additionalData === null) {
            writer.writeNil();
        } else {
            writer.writeByteArray(this.additionalData);
        }
        writer.writeString("tagLength");
        if (this.tagLength === -1) {
            writer.writeNil();
        } else {
            writer.writeInt64(this.tagLength);
        }
        writer.writeString("saltLength");
        if (this.saltLength === -1) {
            writer.writeNil();
        } else {
            writer.writeInt64(this.saltLength);
        }
        writer.writeString("namedCurve");
        if (this.namedCurve === null) {
            writer.writeNil();
        } else {
            writer.writeString(this.namedCurve);
        }
        writer.writeString("signature");
        if (this.signature === null) {
            writer.writeNil();
        } else {
            writer.writeByteArray(this.signature);
        }
        writer.writeString("iterations");
        if (this.iterations === -1) {
            writer.writeNil();
        } else {
            writer.writeInt64(this.iterations);
        }
        writer.writeString("publicKey");
        if (this.publicKey === null) {
            writer.writeNil();
        }else {
            writer.writeByteArray(this.publicKey);
        }
        writer.writeString("info");
        if (this.info === null) {
            writer.writeNil();
        } else {
            writer.writeByteArray(this.info);
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
export class EncryptAlgorithmOptions {
    key: ArrayBuffer | null = null;
    algorithm: string | null = null;
    hash: string | null = null;    
    label: ArrayBuffer | null = null;
    length: i64 = -1;
    iv: ArrayBuffer | null = null;
    keyLength: i64 = -1;
    counter: ArrayBuffer | null = null;
    ctrLength: i64 = -1;
    data: ArrayBuffer | null = null;
    additionalData: ArrayBuffer | null = null;
    tagLength: i64 = -1;

    encode(writer: Writer): void {
        writer.writeMapSize(5);
        writer.writeString("key");
        if (this.key === null) {
            writer.writeNil();
        } else {
            writer.writeByteArray(this.key);
        }
        writer.writeString("algorithm");
        if (this.algorithm === null) {
            writer.writeNil();
        } else {
            writer.writeString(this.algorithm);
        }
        writer.writeString("hash");
        if (this.hash === null) {
            writer.writeNil();
        } else {
            writer.writeString(this.hash);
        }
        writer.writeString("label");
        if (this.label === null) {
            writer.writeNil();
        } else {
            writer.writeByteArray(this.label);
        }
        writer.writeString("length");
        if (this.length === -1) {
            writer.writeNil();
        } else {
            writer.writeInt64(this.length);
        }
        writer.writeString("iv");
        if (this.iv === null) {
            writer.writeNil();
        } else {
            writer.writeByteArray(this.iv);
        }
        writer.writeString("keyLength");
        if (this.keyLength === -1) {
            writer.writeNil();
        } else {
            writer.writeInt64(this.keyLength);
        }
        writer.writeString("counter");
        if (this.counter === null) {
            writer.writeNil();
        } else {
            writer.writeByteArray(this.counter);
        }
        writer.writeString("ctrLength");
        if (this.ctrLength === -1) {
            writer.writeNil();
        } else {
            writer.writeInt64(this.ctrLength);
        }
        writer.writeString("data");
        if (this.data === null) {
            writer.writeNil();
        } else { 
            writer.writeByteArray(this.data);
        }
        writer.writeString("additionalData");
        if (this.additionalData === null) {
            writer.writeNil();
        } else {
            writer.writeByteArray(this.additionalData);
        }
        writer.writeString("tagLength");
        if (this.tagLength === -1) {
            writer.writeNil();
        } else {
            writer.writeInt64(this.tagLength);
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

export class DecryptAlgorithmOptions {
    key: ArrayBuffer | null = null;
    algorithm: string | null = null;
    hash: string | null = null;    
    label: ArrayBuffer | null = null;
    length: i64 = -1;
    iv: ArrayBuffer | null = null;
    keyLength: i64 = -1;
    counter: ArrayBuffer | null = null;
    ctrLength: i64 = -1;
    data: ArrayBuffer | null = null;
    additionalData: ArrayBuffer | null = null;
    tagLength: i64 = -1;

    encode(writer: Writer): void {
        writer.writeMapSize(5);
        writer.writeString("key");
        if (this.key === null) {
            writer.writeNil();
        } else {
            writer.writeByteArray(this.key);
        }
        writer.writeString("algorithm");
        if (this.algorithm === null) {
            writer.writeNil();
        } else {
            writer.writeString(this.algorithm);
        }
        writer.writeString("hash");
        if (this.hash === null) {
            writer.writeNil();
        } else {
            writer.writeString(this.hash);
        }
        writer.writeString("label");
        if (this.label === null) {
            writer.writeNil();
        } else {
            writer.writeByteArray(this.label);
        }
        writer.writeString("length");
        if (this.length === -1) {
            writer.writeNil();
        } else {
            writer.writeInt64(this.length);
        }
        writer.writeString("iv");
        if (this.iv === null) {
            writer.writeNil();
        } else {
            writer.writeByteArray(this.iv);
        }
        writer.writeString("keyLength");
        if (this.keyLength === -1) {
            writer.writeNil();
        } else {
            writer.writeInt64(this.keyLength);
        }
        writer.writeString("counter");
        if (this.counter === null) {
            writer.writeNil();
        } else {
            writer.writeByteArray(this.counter);
        }
        writer.writeString("ctrLength");
        if (this.ctrLength === -1) {
            writer.writeNil();
        } else {
            writer.writeInt64(this.ctrLength);
        }
        writer.writeString("data");
        if (this.data === null) {
            writer.writeNil();
        } else { 
            writer.writeByteArray(this.data);
        }
        writer.writeString("additionalData");
        if (this.additionalData === null) {
            writer.writeNil();
        } else {
            writer.writeByteArray(this.additionalData);
        }
        writer.writeString("tagLength");
        if (this.tagLength === -1) {
            writer.writeNil();
        } else {
            writer.writeInt64(this.tagLength);
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
// export class KeyType{
//     definition: string;
// }
// export class KeyUsage{
//     definition: string;
// }
export const enum KeyType {
    Secret,
    Private,
    Public,
}
// const enum Discriminator {
//     Bool,
//     I8, I16, I32, I64,
//     U8, U16, U32, U64,
//     F32, F64,
//     UnmanagedRef,
//     ManagedRef
// }
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
export class CryptoKeHandle {
    type: string;
    data: ArrayBuffer;

}
export class CryptoKey {
    algorithm: KeyAlgorithm;
    extractable: bool;
    type: KeyType;
    // usages: KeyUsage[];
    usages: Array<String>;
    handle: CryptoKeHandle | null = null;
}

export class CryptoKeyPair {
    publicKey: CryptoKey;
    privateKey: CryptoKey;
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



