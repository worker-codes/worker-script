import { Decoder, Writer, Encoder, Sizer } from "@wapc/as-msgpack";
import { Value } from "./value";
import { read_marker } from "./utils";
import { ASON } from "@ason/assembly";

export const START_SIZE = 32;
// Growth should be aggressive as we don't free old buffer
export const GROWTH_MULT = 2;

export class WorkerError {
    message: string
    code: string
}

export class DatabaseError extends Error {
    body: WorkerError
    status: u32
    constructor(message: string, status: u32, body: WorkerError) {
        super(message)
        this.status = status
        this.name = 'DatabaseError'
        this.body = body
    }
}

export type Row = Array<Value | null>

export class ExecutedQuery {
    columns: string[] = [];
    rows: Row[] = [];
    size: u32;
    statement: string;
    last_insert_id: u64;
    rows_affected: u32;
    time: f64;


    encode(writer: Writer): void {
        writer.writeMapSize(9);
        writer.writeString("columns");
        writer.writeArraySize(this.columns.length);
        for (let i = 0; i < this.columns.length; i++) {
            writer.writeString(this.columns[i])
        }
        writer.writeString("rows");
        writer.writeNullableArray(
            this.rows,
            (writer: Writer, item: Row) => {
                writer.writeMap(
                    item,
                    (writer: Writer, key: string): void => {
                        writer.writeString(key);
                    },
                    (writer: Writer, value: ArrayBuffer) => {
                        writer.writeByteArray(value);
                    }
                );
            }
        );
        writer.writeString("size");
        writer.writeUInt32(this.size);
        writer.writeString("statement");
        writer.writeString(this.statement);
        writer.writeString("last_insert_id");
        if (this.last_insert_id === null) {
            writer.writeNil();
        } else {
            writer.writeUInt64(this.last_insert_id);
        }
        writer.writeString("rows_affected");
        if (this.rows_affected === null) {
            writer.writeNil();
        } else {
            writer.writeUInt32(this.rows_affected);
        }
        writer.writeString("time");
        writer.writeFloat64(this.time);

    }
    decode(reader: Decoder): void {
        var numFields = reader.readMapSize();

        while (numFields > 0) {
            numFields--;
            const field = reader.readString();
            if (field === "columns") {
                const size = reader.readArraySize();
                this.columns = [];
                for (let i: u32 = 0; i < size; i++) {
                    this.columns.push(reader.readString());
                }
            } else if (field === "rows") {

                let row_buffer = reader.readByteArray()

                const decoder = new Decoder(row_buffer);
                const rowSize: u32 = decoder.readArraySize();

                for (let i: u32 = 0; i < rowSize; i++) {

                    let row: Row = [];
                    const columnSize: u32 = decoder.readArraySize();
                    console.log("columnSize: " + columnSize.toString());

                    for (let c: u32 = 0; c < columnSize; c++) {

                        let value = read_marker(decoder);
                        if (value != null) {
                            row.push(value);
                        } else {
                            row.push(value);
                        }
                    }
                    this.rows.push(row);
                }

            } else if (field === "size") {
                this.size = reader.readUInt32();
            } else if (field === "statement") {
                this.statement = reader.readString();
            } else if (field === "last_insert_id") {
                this.last_insert_id = reader.readUInt64();
            } else if (field === "rows_affected") {
                if (reader.isNextNil()) {
                    this.rows_affected = 0;
                } else {
                    this.rows_affected = reader.readUInt32();
                }
            } else if (field === "time") {
                this.time = reader.readFloat64();
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

export class ExecuteOptions {
    raw: bool
    encode(writer: Writer): void {
        writer.writeMapSize(1);
        writer.writeString("raw");
        writer.writeBool(this.raw);
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

export class Args {
    private byteLength: i32 = 0;
    private _length: i32 = 0;
    private buffer: ArrayBuffer = new ArrayBuffer(0)
    private args: Value[] = []

    public constructor() { }
    public get length(): i32 {
        return this._length;
    }
    public toBuffer(): ArrayBuffer {
        let sizer: Sizer = new Sizer();
        sizer.writeArraySize(this.length);
        const buffer = new ArrayBuffer(sizer.length);

        const encoder = new Encoder(buffer);
        encoder.writeArraySize(this.length);

        let out = this.appendBuffer(buffer, this.buffer);

        return out;
    }
    public add<T>(value: T): Args {
        // let type_name = nameof<T>();
        this._length++;

        if (isNullable<T>()) {            
            this.addNull();
        } else if (value instanceof String) {
            this.addString(value as string);
        } else if (value instanceof bool) {
            this.addBool(value as bool);
        } else if (value instanceof f32) {
            this.addFloat32(value as f32);
        } else if (value instanceof f64) {
            this.addFloat64(value as f64);
        } else if (value instanceof i8) {
            this.addInt8(value as i8);
        } else if (value instanceof i16) {
            this.addInt16(value as i16);
        } else if (value instanceof i32) {
            this.addInt32(value as i32);
        } else if (value instanceof i64) {
            this.addInt64(value as i64);
        } else if (value instanceof u8) {
            this.addUInt8(value as u8);
        } else if (value instanceof u16) {
            this.addUInt16(value as u16);
        } else if (value instanceof u32) {
            this.addUInt32(value as u32);
        } else if (value instanceof u64) {
            this.addUInt64(value as u64);
        } else if (value instanceof ArrayBuffer) {
            this.addArrayBuffer(value as ArrayBuffer);
        }
        return this;
    }
    /**
     * setString
     */
    public addNull(): Args {
        console.log("addNull++++++++++++++++++++++++++++++++++++++++");
        
        let sizer: Sizer = new Sizer();
        sizer.writeNil();
        this.byteLength = this.byteLength + sizer.length;
        const buffer = new ArrayBuffer(sizer.length);

        const encoder = new Encoder(buffer);
        encoder.writeNil();
        this.buffer = this.appendBuffer(this.buffer, buffer);
        return this;
    }
    public addString(val: string): Args {
        let sizer: Sizer = new Sizer();
        sizer.writeString(val);
        this.byteLength = this.byteLength + sizer.length;
        const buffer = new ArrayBuffer(sizer.length);

        const encoder = new Encoder(buffer);
        encoder.writeString(val);
        this.buffer = this.appendBuffer(this.buffer, buffer);
        return this;
    }
    public addBool(val: bool): Args {
        let sizer: Sizer = new Sizer();
        sizer.writeBool(val);
        this.byteLength = this.byteLength + sizer.length;
        const buffer = new ArrayBuffer(sizer.length);

        const encoder = new Encoder(buffer);
        encoder.writeBool(val);
        this.buffer = this.appendBuffer(this.buffer, buffer);
        return this;
    }
    public addFloat32(val: f32): Args {
        let sizer: Sizer = new Sizer();
        sizer.writeFloat32(val);
        this.byteLength = this.byteLength + sizer.length;
        const buffer = new ArrayBuffer(sizer.length);

        const encoder = new Encoder(buffer);
        encoder.writeFloat32(val);
        this.buffer = this.appendBuffer(this.buffer, buffer);
        return this;
    }
    public addFloat64(val: f64): Args {
        let sizer: Sizer = new Sizer();
        sizer.writeFloat64(val);
        this.byteLength = this.byteLength + sizer.length;
        const buffer = new ArrayBuffer(sizer.length);

        const encoder = new Encoder(buffer);
        encoder.writeFloat64(val);
        this.buffer = this.appendBuffer(this.buffer, buffer);
        return this;
    }
    public addInt8(val: i8): Args {
        let sizer: Sizer = new Sizer();
        sizer.writeInt8(val);
        this.byteLength = this.byteLength + sizer.length;
        const buffer = new ArrayBuffer(sizer.length);

        const encoder = new Encoder(buffer);
        encoder.writeInt8(val);
        this.buffer = this.appendBuffer(this.buffer, buffer);
        return this;
    }
    public addInt16(val: i16): Args {
        let sizer: Sizer = new Sizer();
        sizer.writeInt16(val);
        this.byteLength = this.byteLength + sizer.length;
        const buffer = new ArrayBuffer(sizer.length);

        const encoder = new Encoder(buffer);
        encoder.writeInt16(val);
        this.buffer = this.appendBuffer(this.buffer, buffer);
        return this;
    }
    public addInt32(val: i32): Args {
        let sizer: Sizer = new Sizer();
        sizer.writeInt32(val);
        this.byteLength = this.byteLength + sizer.length;
        const buffer = new ArrayBuffer(sizer.length);

        const encoder = new Encoder(buffer);
        encoder.writeInt32(val);
        this.buffer = this.appendBuffer(this.buffer, buffer);
        return this;
    }
    public addInt64(val: i64): Args {
        let sizer: Sizer = new Sizer();
        sizer.writeInt64(val);
        this.byteLength = this.byteLength + sizer.length;
        const buffer = new ArrayBuffer(sizer.length);

        const encoder = new Encoder(buffer);
        encoder.writeInt64(val);
        this.buffer = this.appendBuffer(this.buffer, buffer);
        return this;
    }
    public addUInt8(val: u8): Args {
        let sizer: Sizer = new Sizer();
        sizer.writeUInt8(val);
        this.byteLength = this.byteLength + sizer.length;
        const buffer = new ArrayBuffer(sizer.length);

        const encoder = new Encoder(buffer);
        encoder.writeUInt8(val);
        this.buffer = this.appendBuffer(this.buffer, buffer);
        return this;
    }
    public addUInt16(val: u16): Args {
        let sizer: Sizer = new Sizer();
        sizer.writeUInt16(val);
        this.byteLength = this.byteLength + sizer.length;
        const buffer = new ArrayBuffer(sizer.length);

        const encoder = new Encoder(buffer);
        encoder.writeUInt16(val);
        this.buffer = this.appendBuffer(this.buffer, buffer);
        return this;
    }
    public addUInt32(val: u32): Args {
        let sizer: Sizer = new Sizer();
        sizer.writeUInt32(val);
        this.byteLength = this.byteLength + sizer.length;
        const buffer = new ArrayBuffer(sizer.length);

        const encoder = new Encoder(buffer);
        encoder.writeUInt32(val);
        this.buffer = this.appendBuffer(this.buffer, buffer);
        return this;
    }
    public addUInt64(val: u64): Args {
        let sizer: Sizer = new Sizer();
        sizer.writeUInt64(val);
        this.byteLength = this.byteLength + sizer.length;
        const buffer = new ArrayBuffer(sizer.length);

        const encoder = new Encoder(buffer);
        encoder.writeUInt64(val);
        this.buffer = this.appendBuffer(this.buffer, buffer);
        return this;
    }
    public addArrayBuffer(val: ArrayBuffer): Args {
        let sizer: Sizer = new Sizer();
        sizer.writeByteArray(val);
        this.byteLength = this.byteLength + sizer.length;
        const buffer = new ArrayBuffer(sizer.length);

        const encoder = new Encoder(buffer);
        encoder.writeByteArray(val);
        this.buffer = this.appendBuffer(this.buffer, buffer);
        return this;
    }
    private appendBuffer(buffer1: ArrayBuffer, buffer2: ArrayBuffer): ArrayBuffer {
        var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
        tmp.set(Uint8Array.wrap(buffer1), 0);
        tmp.set(Uint8Array.wrap(buffer2), buffer1.byteLength);
        return tmp.buffer;
    };
}

export class Config {
    url: string
    username: string | null
    password: string | null
    host: string | null
    port: u16

    encode(writer: Writer): void {
        writer.writeMapSize(5);
        writer.writeString("url");
        writer.writeString(this.url);
        writer.writeString("username");
        if (this.username === null) {
            writer.writeNil();
        } else {
            writer.writeString(changetype<string>(this.username));
        }
        writer.writeString("password");
        if (this.password === null) {
            writer.writeNil();
        } else {
            writer.writeString(changetype<string>(this.password));
        }
        writer.writeString("host");
        if (this.host === null) {
            writer.writeNil();
        } else {
            writer.writeString(changetype<string>(this.host));
        }
        writer.writeString("port");
        if (this.port === null) {
            writer.writeNil();
        } else {
            writer.writeUInt16(changetype<u16>(this.port));
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

export class ClientResponse {
    rid: i32

    decode(reader: Decoder): void {
        var numFields = reader.readMapSize();

        while (numFields > 0) {
            numFields--;
            const field = reader.readString();
            if (field === "rid") {
                this.rid = reader.readUInt32();
            }
        }
    }

    fromBuffer(buffer: ArrayBuffer): void {
        const decoder = new Decoder(buffer);
        this.decode(decoder);
    }
}

export class ExecuteRequest {
    rid: i32;
    query: string;
    args: Args | null = null;
    options: ExecuteOptions;

    encode(writer: Writer): void {
        writer.writeMapSize(4);
        writer.writeString("rid");
        writer.writeInt32(this.rid);
        writer.writeString("query");
        writer.writeString(this.query);
        writer.writeString("args");
        if (this.args !== null) {
            let args = changetype<Args>(this.args);
            let buffer = args.toBuffer();
            writer.writeByteArray(buffer);            
        } else {
            writer.writeNil();
        }
        writer.writeString("options");
        if (this.options === null) {
            writer.writeNil();
        } else {
            this.options.encode(writer);
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


// export type Args = string | null

export const defaultExecuteOptions: ExecuteOptions = {
    raw: false
}