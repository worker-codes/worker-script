import { hostCall, Result } from "../worker/wapc";
import { Decoder, Writer, Encoder, Sizer } from "@wapc/as-msgpack";
export { Config, Args, DatabaseError, ClientResponse, defaultExecuteOptions, ExecutedQuery, ExecuteOptions, ExecuteRequest } from "./types";
import { Config,  Args, DatabaseError, ClientResponse, defaultExecuteOptions, ExecutedQuery, ExecuteOptions, ExecuteRequest } from "./types";



export function connect(config: Config): Result<Connection> {
    let client = new Client(config);
    return client.connection();
}

export class Client {
    private config: Config

    constructor(config: Config) {
        this.config = config
    }

    transaction<T>(fn: (tx: Transaction) => Result<T>): Result<T> {
        let conn = this.connection();
        if (conn.isOk) {
            let conn_ = conn.get();
            return conn_.transaction(fn)
        } else {
            let err = conn.error()
            return Result.error<T>(changetype<Error>(err));
        }  
    }


    query(query: string, args: Args | null = null, options: ExecuteOptions = defaultExecuteOptions): Result<ExecutedQuery> {
        let conn = this.connection();
        if (conn.isOk) {
            let conn_ = conn.get();
            return conn_.execute(query, args, options)
        } else {
            let err = conn.error()
            return Result.error<ExecutedQuery>(changetype<Error>(err));
        }      
    }

    execute(query: string, args: Args | null = null, options: ExecuteOptions = defaultExecuteOptions): Result<ExecutedQuery> {
        let conn = this.connection();
        if (conn.isOk) {
            let conn_ = conn.get();
            return conn_.execute(query, args, options)
        } else {
            let err = conn.error()
            return Result.error<ExecutedQuery>(changetype<Error>(err));
        }      
    }

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

export class Transaction {
    private connection: Connection

    constructor(connection: Connection) {
        this.connection = connection
    }

    query(query: string, args: Args | null = null, options: ExecuteOptions = defaultExecuteOptions): Result<ExecutedQuery> {
        return this.connection.query(query, args, options)
    }
    execute(query: string, args: Args | null = null, options: ExecuteOptions = defaultExecuteOptions): Result<ExecutedQuery> {
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
        // Create a new connection specifically for the transaction
        const conn = new Connection(this.config) 
        const tx = new Transaction(conn)

        let begin = tx.execute('BEGIN');
        if (begin.isOk) {
            let res = fn(tx);
            if (res.isOk) {
                let commit = tx.execute('COMMIT');
                if (commit.isOk) {
                    return res
                } else {
                    let err = commit.error()
                    return Result.error<T>(changetype<Error>(err));
                }
            } else {
                let err = res.error()
                return Result.error<T>(changetype<Error>(err));
            }
        } else {
            let err = begin.error()
            return Result.error<T>(changetype<Error>(err));
        }
    }

    refresh(): Result<null> {
        this.createSession()

        return Result.ok(null)
    }

    execute(query: string, args: Args | null = null, options: ExecuteOptions = defaultExecuteOptions): Result<ExecutedQuery> {
        //@ts-ignore
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
            //@ts-ignore
            let executed_query: ExecutedQuery = {
                rows: [],
                columns: [],
                size: -1,
                statement: "",
                last_insert_id: -1,
                rows_affected: -1,
                time: -1
            };

            executed_query.fromBuffer(result_buffer);

            return Result.ok(executed_query)
        } else {
            let err = result.error()

            return Result.error<ExecutedQuery>(changetype<Error>(err));
        }

    }

    query(query: string, args: Args | null = null, options: ExecuteOptions = defaultExecuteOptions): Result<ExecutedQuery> {

        //@ts-ignore
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
            //@ts-ignore
            let executed_query: ExecutedQuery = {
                rows: [],
                columns: [],
                size: -1,
                statement: "",
                last_insert_id: -1,
                rows_affected: -1,
                time: -1,
            };

            executed_query.fromBuffer(result_buffer);
 
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
