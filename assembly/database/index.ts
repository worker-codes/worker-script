import { hostCall, Result } from "../worker/wapc";
import { Decoder, Writer, Encoder, Sizer } from "@wapc/as-msgpack";
// import { URL } from "../url";
// import { JSON } from "assemblyscript-json";

const START_SIZE = 32;
// Growth should be aggressive as we don't free old buffer
const GROWTH_MULT = 2;

class WorkerError {
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

type Row = Map<string, ArrayBuffer>

export class Field {
    name: string
    type: string
    table: string
    columnLength: u32
    charset: u32
    flags: u32
    columnType: string | null

    encode(writer: Writer): void {
        writer.writeMapSize(7);
        writer.writeString("name");
        writer.writeString(this.name);
        writer.writeString("type");
        writer.writeString(this.type);
        writer.writeString("table");
        writer.writeString(this.table);
        writer.writeString("column_length");
        if (this.columnLength == null) {
            writer.writeNil();
        } else {
            writer.writeUInt32(this.columnLength);
        }
        writer.writeString("charset");
        if (this.charset == null) {
            writer.writeNil();
        } else {
            writer.writeUInt32(this.charset);
        }
        writer.writeString("flags");
        if (this.flags == null) {
            writer.writeNil();
        } else {
            writer.writeUInt32(this.flags);
        }
        writer.writeString("column_type");
        if (this.columnType == null) {
            writer.writeNil();
        } else {
            writer.writeString(this.columnType);
        }
    }
    decode(reader: Decoder): void {
        var numFields = reader.readMapSize();

        while (numFields > 0) {
            numFields--;
            const field = reader.readString();
            if (field == "name") {
                this.name = reader.readString();
            } else if (field == "type") {
                this.type = reader.readString();
            } else if (field == "table") {
                this.table = reader.readString();
            } else if (field == "column_length") {
                if (reader.isNextNil()) {
                    this.columnLength = null;
                } else {
                    this.columnLength = reader.readUInt32();
                }
            } else if (field == "charset") {
                if (reader.isNextNil()) {
                    this.charset = null;
                } else {
                    this.charset = reader.readUInt32();
                }
            } else if (field == "flags") {
                if (reader.isNextNil()) {
                    this.flags = null;
                } else {
                    this.flags = reader.readUInt32();
                }
            } else if (field == "column_type") {
                if (reader.isNextNil()) {
                    this.columnType = null;
                } else {
                    this.columnType = reader.readString();
                }
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

export class ExecutedQuery {
    columns: string[]
    rows: Row[]
    size: u32
    statement: string
    last_insert_id: string | null
    rows_affected: u32
    time: u32


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
        if (this.last_insert_id == null) {
            writer.writeNil();
        } else {
            writer.writeString(this.last_insert_id);
        }
        writer.writeString("rows_affected");
        if (this.rows_affected == null) {
            writer.writeNil();
        } else {
            writer.writeUInt32(this.rows_affected);
        }
        writer.writeString("time");
        writer.writeUInt32(this.time);

    }
    decode(reader: Decoder): void {
        var numFields = reader.readMapSize();

        while (numFields > 0) {
            numFields--;
            const field = reader.readString();
            if (field == "columns") {
                const size = reader.readArraySize();
                this.columns = [];
                for (let i = 0; i < size; i++) {
                    this.columns.push(reader.readString());
                }
            } else if (field == "rows") {
                const size = reader.readArraySize();
                this.rows = [];
                for (let i = 0; i < size; i++) {
                    const rowSize = reader.readArraySize();
                    const row = [];
                    for (let j = 0; j < rowSize; j++) {
                        row.push(reader.readString());
                    }
                    this.rows.push(row);
                }
            } else if (field == "size") {
                this.size = reader.readUInt32();
            } else if (field == "statement") {
                this.statement = reader.readString();
            } else if (field == "last_insert_id") {
                if (reader.isNextNil()) {
                    this.last_insert_id = null;
                } else {
                    this.last_insert_id = reader.readString();
                }
            } else if (field == "rows_affected") {
                if (reader.isNextNil()) {
                    this.rows_affected = null;
                } else {
                    this.rows_affected = reader.readUInt32();
                }
            } else if (field == "time") {
                this.time = reader.readUInt32();
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

class ExecuteOptions {
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

export class Arg {
    private offsets: Array<i32> = new Array<i32>();
    private buffer: Uint8Array = new Uint8Array(START_SIZE)
    private writeIndex: i32 = 4  // Make place for total size 
    private encoder: Encoder = new Encoder(this.buffer);
    // static encoder: any;

    private constructor() { unreachable(); }

    @inline bind<T>(value: T): Arg {
        // var out = changetype<Variant>(__new(offsetof<Variant>(), idof<Variant>()));
        this.set<T>(value);

        return this;
    }

    @inline set<T>(value: T): void {

        let newvalue = changetype<T>(value);

        if (isString<T>()) {
            this.encoder.writeString(changetype<string>(newvalue));
        }

        if (isNullable<T>()) {
            this.encoder.writeNil();
        }

        let type_: T;
        if (type_ instanceof bool) this.encoder.writeBool(changetype<bool>(newvalue));
        if (type_ instanceof i8) this.encoder.writeInt8(changetype<i8>(newvalue));
        if (type_ instanceof i16) this.encoder.writeInt16(changetype<i16>(newvalue));
        if (type_ instanceof i32) this.encoder.writeInt32(changetype<i32>(newvalue));
        if (type_ instanceof i64) this.encoder.writeInt64(changetype<i64>(newvalue));
        if (type_ instanceof u8) this.encoder.writeUInt8(changetype<u8>(newvalue));
        if (type_ instanceof u16) this.encoder.writeUInt16(changetype<u16>(newvalue));
        if (type_ instanceof u32) this.encoder.writeUInt32(changetype<u32>(newvalue));
        if (type_ instanceof u64) this.encoder.writeUInt64(changetype<u64>(newvalue));
        if (type_ instanceof f32) this.encoder.writeFloat32(changetype<f32>(newvalue));
        if (type_ instanceof f64) this.encoder.writeFloat64(changetype<f64>(newvalue));


    }

    private writeByte(b: u32): void {
        this.growIfNeeded(1);
        this.buffer[this.writeIndex++] = b;
    }

    private growIfNeeded(numBytes: i32): void {
        if (this.buffer.length >= this.writeIndex + numBytes) {
            return;
        }

        let oldBuffer = this.buffer;
        this.buffer = new Uint8Array(this.buffer.length * GROWTH_MULT);
        for (let i = 0; i < oldBuffer.length; i++) {
            this.buffer[i] = oldBuffer[i];
        }
    }

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
        if (this.username == null) {
            writer.writeNil();
        } else {
            writer.writeString(changetype<string>(this.username));
        }        
        writer.writeString("password");
        if (this.password == null) {
            writer.writeNil();
        } else {
            writer.writeString(changetype<string>(this.password));
        }
        writer.writeString("host");
        if (this.host == null) {
            writer.writeNil();
        } else {
            writer.writeString(changetype<string>(this.host));
        }
        writer.writeString("port");
        if (this.port == null) {
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

class ClientResponse {
    rid: i32

    decode(reader: Decoder): void {
        var numFields = reader.readMapSize();

        while (numFields > 0) {
            numFields--;
            const field = reader.readString();
            if (field == "rid") {
                this.rid = reader.readUInt32();
            }
        }
    }

    fromBuffer(buffer: ArrayBuffer): void {
        const decoder = new Decoder(buffer);
        this.decode(decoder);
    }
}

class ExecuteRequest {
    rid: i32;
    query: string;
    args: ExecuteArgs = null;
    options: ExecuteOptions;

    encode(writer: Writer): void {
        writer.writeMapSize(4);
        writer.writeString("rid");
        writer.writeInt32(this.rid);
        writer.writeString("query");
        writer.writeString(this.query);
        writer.writeString("args");
        if (this.args == null) {
            writer.writeNil();
        }
        writer.writeString("options");
        if (this.options == null) {
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


type ExecuteArgs = string | null

const defaultExecuteOptions: ExecuteOptions = {
    raw: false
}

export function connect(config: Config): Result<Connection>  {
    let client = new Client(config);
    return client.connection();
}

export class Client {
    private config: Config
    private client_rid: u32 = 0

    constructor(config: Config) {
        this.config = config
    }


    // execute(query: string, args: ExecuteArgs = null, options: ExecuteOptions = defaultExecuteOptions): Result<ExecutedQuery> {
    //   return this.connection().execute(query, args, options)
    // }

    connection(): Result<Connection> {

        // let request = new Config();
        let buffer = this.config.toBuffer();

        let result = hostCall("database", "connection", "open", buffer);
        if (result.isOk) {
            let result_buffer = result.get();
            let response = new ClientResponse();
            response.fromBuffer(result_buffer);

            let connection = new Connection(this.config, response.rid);
            return Result.ok(connection)
        } else {
            let err = result.error()

            return Result.error<Connection>(changetype<Error>(err));
        }
    }
}

export type Transaction = Tx

class Tx {
    private connection: Connection

    constructor(connection: Connection) {
        this.connection = connection
    }

    execute(query: string, args: ExecuteArgs = null, options: ExecuteOptions = defaultExecuteOptions): Result<ExecutedQuery> {
        return this.connection.execute(query, args, options)
    }
}


export class Connection {
    private config: Config
    private rid: u32 = 0

    constructor(config: Config, rid: u32 = 0) {
        this.config = config;
        this.rid = rid;
    }

    transaction<T>(fn: (tx: Transaction) => Result<T>): Result<T> {
        const conn = new Connection(this.config) // Create a new connection specifically for the transaction
        const tx = new Tx(conn)

        try {
            tx.execute('BEGIN')
            const res = fn(tx)
            tx.execute('COMMIT')

            return res
        } catch (err) {
            tx.execute('ROLLBACK')
            throw err
        }
    }

    refresh(): Result<null> {
        this.createSession()

        return Result.ok(null)
    }

    execute(query: string, args: ExecuteArgs = null, options: ExecuteOptions = defaultExecuteOptions): Result<ExecutedQuery> {

        let request: ExecuteRequest = {
            rid: this.rid,
            query: query,
            args: args,
            options: options,
        };

        let buffer = request.toBuffer();

        let result = hostCall("database", "command", "execute", buffer);
        if (result.isOk) {
            let result_buffer = result.get();
            let executed_query: ExecutedQuery = {
                rows: [new Map()],
                columns: [],
                size: 0,
                statement: "",
                last_insert_id: "",
                rows_affected: 0,
                time: 0,
            };
            

            return Result.ok(executed_query)
        } else {
            let err = result.error()

            return Result.error<ExecutedQuery>(changetype<Error>(err));
        }

    }

    query(query: string, args: ExecuteArgs = null, options: ExecuteOptions = defaultExecuteOptions): Result<ExecutedQuery> {

        let request: ExecuteRequest = {
            rid: this.rid,
            query: query,
            args: args,
            options: options,
        };

        let buffer = request.toBuffer();

        let result = hostCall("database", "command", "query", buffer);
        if (result.isOk) {
            let result_buffer = result.get();
            let executed_query: ExecutedQuery = {
                rows: [new Map()],
                columns: [],
                size: 0,
                statement: "",
                last_insert_id: "",
                rows_affected: 0,
                time: 0,
            };
            

            return Result.ok(executed_query)
        } else {
            let err = result.error()

            return Result.error<ExecutedQuery>(changetype<Error>(err));
        }

    }

    private createSession(): Result<u32> {

        return Result.ok(0)
    }
}


// function postQuery<T>(config: Config, url: string | URL, body = {}): Result<T> {



//   if (response.ok) {
//     return response.json()
//   } else {
//     let error = null
//     try {
//       const e = (response.json()).error
//       error = new DatabaseError(e.message, response.status, e)
//     } catch {
//       error = new DatabaseError(response.statusText, response.status, {
//         code: 'internal',
//         message: response.statusText
//       })
//     }
//     throw error
//   }
// }