import { TextDecoder, TextEncoder } from "./text-encoding";
import { Headers } from "./headers";
import { JSON } from "assemblyscript-json/assembly";
import { Body } from "./body";
import { Decoder, Writer, Encoder, Sizer } from "@wapc/as-msgpack";

export class RequestInit {
    method: string | null = null
    headers: Headers | null = null
    body: ArrayBuffer | null = null
    // redirect: string | null = null
}

export class Request extends Body {

    protected _headers: Headers = new Headers();
    protected _method: string = "GET";
    // protected _redirect: string;
    protected _url: string;

    // private cache: string;
    // private credentials: string;
    // private destination: string;
    // private integrity: string;
    // private mode: string;
    // private priority: string;
    // private redirect: string;
    // private referrer: string;
    // private referrerPolicy: string;
    // stream: string;
    // remoteAddr: string;
    // remoteAddr: string;

    constructor(url: string, init: RequestInit) {

        if (init.body == null) {
            super(null);
        } else {
            super(init.body);
        }

        this._url = url;

        if (init.method == null) {
            this._method = "GET";
        } else {
            this._method = changetype<string>(init.method);
        }

        if (init.headers == null) {
            this._headers = new Headers();
        } else {
            this._headers = changetype<Headers>(init.headers);
        }

    }

    get method(): string {
        return this._method;
    }

    get url(): string {
        return this._url;
    }

    get headers(): Headers {
        return this._headers;
    }
    public clone(): Request {
        if (this.bodyUsed) {
            throw new Error("body has already been used");
        }
        let body2 = this.bodySource;

        const cloned = new Request(this._url, {
            body: body2,
            method: this._method,
            headers: this._headers,
            // redirect: this._redirect,
        })
        return cloned;
    }

    encode(writer: Writer): void {
        writer.writeMapSize(6);
        writer.writeString("method");
        writer.writeString(this._method);
        writer.writeString("url");
        writer.writeString(this._url);
        writer.writeString("headers");
        writer.writeByteArray(this._headers.toBuffer());
        writer.writeString("body");
        if (this.bodySource) {
            writer.writeNil();
        } else {
            writer.writeByteArray(changetype<ArrayBuffer>(this.bodySource));
        }
        
    }
    decode(reader: Decoder): void {
        var numFields = reader.readMapSize();

        while (numFields > 0) {
            numFields--;
            const field = reader.readString();
            if (field == "method") {
                this._method = reader.readString();
            } else if (field == "url") {
                this._url = reader.readString();
            } else if (field == "headers") {
                let buffer = reader.readByteArray();
                let headers = new Headers()
                headers.fromBuffer(buffer)
                this._headers = headers;
            } else if (field == "body") {
                if (reader.isNextNil()) {
                    this.bodySource = null;
                } else {
                    this.bodySource = reader.readByteArray();
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

