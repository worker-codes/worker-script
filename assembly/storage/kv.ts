import { hostCall, Result } from "../worker/wapc";
import { Decoder, Writer, Encoder, Sizer } from "@wapc/as-msgpack";

export function isNull<T>(value: T): boolean {
    return changetype<usize>(value) == 0;
}


class KeyValueStoragePutRequest {
    key: string;
    value: ArrayBuffer = new ArrayBuffer(0);
    options: KeyValueStoragePutOption = new KeyValueStoragePutOption();

    encode(writer: Writer): void {
        writer.writeMapSize(3);
        writer.writeString("key");
        writer.writeString(this.key);
        writer.writeString("value");
        writer.writeByteArray(this.value);

        writer.writeString("options");
        this.options.encode(writer);
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

class KeyValueStorageGetRequest {
    key: string;
    options: KeyValueStorageGetOption = new KeyValueStorageGetOption();

    encode(writer: Writer): void {
        writer.writeMapSize(2);
        writer.writeString("key");
        writer.writeString(this.key);
        writer.writeString("options");
        this.options.encode(writer);
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

class KeyValueStorageListRequest {
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

export class KeyValueStoragePutOption {
    expiration: u32 | null = null;
    expirationTtl: u32 | null = null;
    metadata: string | null = null;

    encode(writer: Writer): void {
        writer.writeMapSize(3);
        writer.writeString("expiration");
        if (this.expiration == null) {
            writer.writeNil();
        } else {
            writer.writeUInt32(this.expiration);
        }

        if (this.expirationTtl == null) {
            writer.writeNil();
        } else {
            writer.writeUInt32(this.expirationTtl);
        }

        if (this.metadata == null) {
            writer.writeNil();
        } else {
            writer.writeString(this.metadata);
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

export class KeyValueStorageGetOption {
    type: string;
    cacheTtl: u32;

    encode(writer: Writer): void {
        writer.writeMapSize(2);
        writer.writeString("type");
        if (this.type == null) {
            writer.writeNil();
        } else {
            writer.writeString(this.type);
        }

        if (this.cacheTtl == null) {
            writer.writeNil();
        } else {
            writer.writeUInt32(this.cacheTtl);
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

export class KeyValueStorageListOption {
    prefix: string;
    limit: u32;
    cursor: string;
}

class Key {
    name: string;
    expiration: u32;
    metadata: ArrayBuffer;

    encode(writer: Writer): void {
        writer.writeMapSize(3);
        writer.writeString("name");
        writer.writeString(this.name);
        writer.writeString("expiration");
        writer.writeUInt32(this.expiration);
        writer.writeString("metadata");
        writer.writeByteArray(this.metadata);
    }
    decode(reader: Decoder): void {
        var numFields = reader.readMapSize();

        while (numFields > 0) {
            numFields--;
            const field = reader.readString();
            if (field == "name") {
                this.name = reader.readString();
            } else if (field == "expiration") {
                this.expiration = reader.readUInt32();
            } else if (field == "metadata") {
                this.metadata = reader.readByteArray();
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
class KeyValueStorageList {
    keys: Array<Key>;
    list_complete: bool;
    cursor: string;

    encode(writer: Writer): void {
        writer.writeMapSize(4);
        writer.writeString("prefix");
        writer.writeArray(this.keys, (writer: Writer, item: Key) => {
            item.encode(writer);
        });
        writer.writeString("limit");
        writer.writeBool(this.list_complete);
        writer.writeString("cursor");
        writer.writeString(this.cursor);
    }
    decode(reader: Decoder): void {
        var numFields = reader.readMapSize();

        while (numFields > 0) {
            numFields--;
            const field = reader.readString();
            if (field == "keys") {
                this.keys = reader.readArray(
                    (decoder: Decoder): Key => {
                        const output = new Key();
                        output.decode(decoder);
                        return output;
                    }
                );
            } else if (field == "list_complete") {
                this.list_complete = reader.readBool();
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
class Value {
    value: ArrayBuffer;

    encode(writer: Writer): void {
        writer.writeMapSize(1);
        writer.writeString("value");
        writer.writeByteArray(this.value);
    }
    decode(reader: Decoder): void {
        var numFields = reader.readMapSize();

        while (numFields > 0) {
            numFields--;
            const field = reader.readString();
            if (field == "value") {
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

class ValueWithMetaData {
    value: ArrayBuffer;
    metadata: ArrayBuffer;

    encode(writer: Writer): void {
        writer.writeMapSize(2);
        writer.writeString("value");
        writer.writeByteArray(this.value);
        writer.writeString("metadata");
        writer.writeByteArray(this.metadata);

    }
    decode(reader: Decoder): void {
        var numFields = reader.readMapSize();

        while (numFields > 0) {
            numFields--;
            const field = reader.readString();
            if (field == "value") {
                this.value = reader.readByteArray();
            } else if (field == "metadata") {
                this.metadata = reader.readByteArray();
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

export class KeyValueStorage {

    put(key: string, value: ArrayBuffer, options: KeyValueStoragePutOption | null = null): Result<null> {
        
        let request = new KeyValueStoragePutRequest();
        request.key = key;
        request.value = value;

        if (options != null) {
            request.options = options;
        } else {
            request.options = new KeyValueStoragePutOption();
        }
        const buffer = request.toBuffer();

        let result = hostCall("storage", "kv", "put", buffer);
        if (result.isOk) {
            let result_buffer = result.get();
      
            return Result.ok(null)
        } else {
            let err = result.error() 

            return Result.error<null>(changetype<Error>(err));
        }
    }

    get(key:string, options:KeyValueStorageGetOption | null = null): Result<Value> {

        let request = new KeyValueStorageGetRequest();
        request.key = key;
        
        if (options != null) {
            request.options = options;
        } else {
            request.options = new KeyValueStorageGetOption();
        }
        const buffer = request.toBuffer();

        let result = hostCall("storage", "kv", "get", buffer);
        if (result.isOk) {
            let result_buffer = result.get();

            const output = new ValueWithMetaData();
            output.fromBuffer(result_buffer);

            return Result.ok(output);
        } else {
            let err = result.error() 

            return Result.error<Value>(changetype<Error>(err));
        }
    }

    getWithMetadata(key:string, options:KeyValueStorageGetOption): Result<ValueWithMetaData> {

        let request = new KeyValueStorageGetRequest();
        request.key = key;
        
        if (options != null) {
            request.options = options;
        } else {
            request.options = new KeyValueStorageGetOption();
        }
        const buffer = request.toBuffer();

        let result = hostCall("storage", "kv", "get", buffer);
        if (result.isOk) {
            let result_buffer = result.get();

            const output = new ValueWithMetaData();
            output.fromBuffer(result_buffer);
      
            return Result.ok(output);
        } else {
            let err = result.error() 

            return Result.error<ValueWithMetaData>(changetype<Error>(err));
        }
    }

    delete(path:string): Result<null> {

        let buffer = String.UTF8.encode(path);

        let result = hostCall("storage", "kv", "delete", buffer);
        if (result.isOk) {
            let result_buffer = result.get();
      
            return Result.ok(null);
        } else {
            let err = result.error() 

            return Result.error<null>(changetype<Error>(err));
        }
    }


    list(option:KeyValueStorageListOption): Result<KeyValueStorageList> {

        let request = new KeyValueStorageListRequest();
        request.prefix = option.prefix;
        request.limit = option.limit;
        request.cursor = option.cursor;

        let buffer = request.toBuffer();

        let result = hostCall("storage", "kv", "list", buffer);
        if (result.isOk) {
            let result_buffer = result.get();

            const output = new KeyValueStorageList();
            output.fromBuffer(result_buffer);
      
            return Result.ok(output);
        } else {
            let err = result.error() 

            return Result.error<KeyValueStorageList>(changetype<Error>(err));
        }
    }

}

