import { Decoder, Encoder, Sizer, Writer } from "@wapc/as-msgpack";
import { hostCall } from "../../worker/wapc";

class WriteRequest {
    rid: u32 = 0;
    size: u32 = 0;
    chunk: ArrayBuffer = new ArrayBuffer(0);    
    

    encode(encoder: Writer): void {
        encoder.writeMapSize(3);
        encoder.writeString("rid");
        encoder.writeUInt32(this.rid);
        encoder.writeString("size");
        encoder.writeUInt32(this.size);
        encoder.writeString("chunk");
        encoder.writeByteArray(this.chunk);
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

class CloseRequest {
    rid: u32 = 0;
    encode(encoder: Writer): void {
        encoder.writeMapSize(1);
        encoder.writeString("rid");
        encoder.writeUInt32(this.rid);

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

class WriteReturn {
    rid: u32;
    size: u32;

    decode(reader: Decoder): void {
        var numFields = reader.readMapSize();

        while (numFields > 0) {
            numFields--;
            const field = reader.readString();

            if(field == "rid") {
                this.rid = reader.readUInt32();
            } else if (field == "size") {
                this.size = reader.readUInt32();
            }

        }
    }
    fromBuffer(buffer: ArrayBuffer): void {
        const decoder = new Decoder(buffer);
        this.decode(decoder);
    }


}

export class WriteableStream {
    private _rid: u32;

    _locked: boolean;

    constructor(rid: u32) {
        this._rid = rid;
        this._locked = false;
    }

    rid(): u32 {
        return this._rid;
    }

    getWriter(): WritableStreamDefaultWriter | null {
        if (this._locked) {
            return null;
        }

        const writer = new WritableStreamDefaultWriter(this, this._rid);

        this._locked = true;

        return writer;
    }

    get locked(): boolean {
        return this._locked;
    }
}


export class WritableStreamDefaultWriter {
    private _writeableStream: WriteableStream;
    private _rid: u32;
    private _closed: boolean;

    constructor(writeableStream: WriteableStream, rid: u32) {
        this._writeableStream = writeableStream;
        this._rid = rid;
        this._closed = false;
    }

    rid(): u32 {
        return this._rid;
    }


    get closed(): boolean {
        return this._closed;
    }


    releaseLock(): void {
        this._writeableStream._locked = false;
        this._closed = true;
    }


    write(responseBodyBuffer: ArrayBuffer): void {
        if (this._closed) {
            return;
        }

        // @ts-ignore
        let read_request: WriteRequest = {
            rid: this._rid,
            chunk: responseBodyBuffer
        }

        let read_request_buffer = read_request.toBuffer();

        let result_read_body = hostCall("fetch", "read_body", "", read_request_buffer);
        if (result_read_body.isOk) {
            let result_buffer = result_read_body.get();
            let read_return = new WriteReturn();
            read_return.fromBuffer(result_buffer);

            let size = read_return.size;
            this._rid = read_return.rid;

        } else {
            let err = result_read_body.error()

            throw new Error("Could not write to the body on the host, from the writable stream.");
        }

    }


    close(): void {
        if (this._closed) {
            return;
        }

        // @ts-ignore
        let close_request: WriteRequest = {
            rid: this._rid,
        }

        let close_request_buffer = close_request.toBuffer();
        let result_read_body = hostCall("fetch", "close_body", "", close_request_buffer);
        if (result_read_body.isOk) {
            let result_buffer = result_read_body.get();

        } else {
            let err = result_read_body.error()

            throw new Error("Could not close to the body on the host, from the writable stream.");
        }

  
        this.releaseLock();
    }
}
