import { hostCall, Result } from "./worker/wapc";
import { Decoder, Writer, Encoder, Sizer } from "@wapc/as-msgpack";

export function isNull<T>(value: T): boolean {
    return changetype<usize>(value) == 0;
}


class StoragePutRequest {
    key: string;
    value: ArrayBuffer = new ArrayBuffer(0);

    encode(writer: Writer): void {
        writer.writeMapSize(4);
        writer.writeString("key");
        writer.writeString(this.key);
        writer.writeString("value");
        writer.writeByteArray(this.value);
    }
    decode(reader: Decoder): void {
        var numFields = reader.readMapSize();

        while (numFields > 0) {
            numFields--;
            const field = reader.readString();
            if (field == "key") {
                this.key = reader.readString();
            } else if (field == "value") {
                this.value = reader.readByteArray();
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

class StorageGetRequest {
    key: string;
    value: ArrayBuffer = new ArrayBuffer(0);

    encode(writer: Writer): void {
        writer.writeMapSize(4);
        writer.writeString("key");
        writer.writeString(this.key);
        writer.writeString("value");
        writer.writeByteArray(this.value);
    }
    decode(reader: Decoder): void {
        var numFields = reader.readMapSize();

        while (numFields > 0) {
            numFields--;
            const field = reader.readString();
            if (field == "key") {
                this.key = reader.readString();
            } else if (field == "value") {
                this.value = reader.readByteArray();
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

class StorageListRequest {
    prefix: string;
    limit: u32;
    cursor: string;

    encode(writer: Writer): void {
        writer.writeMapSize(4);
        writer.writeString("prefix");
        writer.writeString(this.prefix);
        writer.writeString("limit");
        writer.writeUInt32(this.limit);
        writer.writeString("cursor");
        writer.writeString(this.cursor);
    }
    decode(reader: Decoder): void {
        var numFields = reader.readMapSize();

        while (numFields > 0) {
            numFields--;
            const field = reader.readString();
            if (field == "prefix") {
                this.prefix = reader.readString();
            } else if (field == "limit") {
                this.limit = reader.readUInt32();
            } else if (field == "cursor") {
                this.cursor = reader.readString();
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


class StoragePutOption{
    expiration: u32;
    expirationTtl: u32;
    metadata: ArrayBuffer;
}

class StorageGetOption{
    type: string;
    cacheTtl: u32;
}


class StorageListOption{
    prefix: string;
    limit: u32;
    cursor: string;
}


class StorageKey{
    name: string;
    expiration: u32;
    metadata: ArrayBuffer;
}
class StorageList{
    keys: Array<StorageKey>;
    list_complete: boolean;
    cursor: string;
}

export class Storage {

    constructor(private persistent:string = "true") {
        
    }

    get length(): Result<i32> {
        let content = new ArrayBuffer(0);
        let result = hostCall("webstorage", this.persistent, "length", content);
        if (result.isOk) {
            let result_buffer = result.get();
      
            return Result.ok(changetype<i32>(result_buffer))
        } else {
            let err = result.error() 

            return Result.error<i32>(changetype<Error>(err));
        }
    }

    key(index: i32): Result<string | null> {
        
        let result = hostCall("webstorage", this.persistent, "key", index);
        if (result.isOk) {
            let result_buffer = result.get();
      
            return Result.ok(null)
        } else {
            let err = result.error() 

            return Result.error<null>(changetype<Error>(err));
        }
    }

    setItem(keyName:string, keyValue:string): Result<null> {

        let result = hostCall("webstorage", this.persistent, "set", content);
        if (result.isOk) {
            let result_buffer = result.get();
      
            return Result.ok(null)
        } else {
            let err = result.error() 

            return Result.error<null>(changetype<Error>(err));
        }
    }

    getItem(keyName:string): Result<string | null> {

        let buffer = String.UTF8.encode(keyName);

        let result = hostCall("webstorage", this.persistent, "get", buffer);
        if (result.isOk) {
            let result_buffer = result.get();

            let value = String.UTF8.decode(result_buffer);

            return Result.ok(value);
        } else {
            let err = result.error() 

            return Result.error<string>(changetype<Error>(err));
        }
    }

    removeItem(keyName:string): Result<null> {

        let buffer = String.UTF8.encode(keyName);

        let result = hostCall("webstorage", this.persistent, "remove", buffer);
        if (result.isOk) {
            let result_buffer = result.get();
           
            return Result.ok(null);
        } else {
            let err = result.error() 

            return Result.error<null>(changetype<Error>(err));
        }
    }

    clear(): Result<null> {
        let content = new ArrayBuffer(0);
        let result = hostCall("webstorage", this.persistent, "clear", content);
        if (result.isOk) {
            let result_buffer = result.get();
           
            return Result.ok(null);
        } else {
            let err = result.error() 

            return Result.error<null>(changetype<Error>(err));
        }
    }
}

