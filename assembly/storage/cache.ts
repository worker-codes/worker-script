import { hostCall, Result } from "../worker/wapc";
import { Decoder, Writer, Encoder, Sizer } from "@wapc/as-msgpack";
import { URL } from "../url";
import { Request, Response } from "../http";


class CacheRequest {
    cacheName: string;
    request: ArrayBuffer = new ArrayBuffer(0);
    response: ArrayBuffer = new ArrayBuffer(0);
    options: CacheOption = new CacheOption();

    encode(writer: Writer): void {
        writer.writeMapSize(3);
        writer.writeString("request");
        writer.writeByteArray(this.request);
        writer.writeString("response");
        writer.writeByteArray(this.response);
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


export class CacheOption {
    ignoreSearch: bool = false;
    ignoreMethod: bool = false;
    ignoreVary: bool = false;
    cacheName: string = "";

    encode(writer: Writer): void {
        writer.writeMapSize(4);
        writer.writeString("ignoreSearch");
        writer.writeBool(this.ignoreSearch);
        writer.writeString("ignoreMethod");
        writer.writeBool(this.ignoreMethod);
        writer.writeString("ignoreVary");
        writer.writeBool(this.ignoreVary);
        writer.writeString("cacheName");
        writer.writeString(this.cacheName);
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

export class CacheStorage {

    open(cacheName: string): Result<Cache>  {

        let buffer = String.UTF8.encode(cacheName);
        let result = hostCall("storage", "cachestorage", "open", buffer);

        if (result.isOk) {
            const output = new Cache(cacheName);

            return Result.ok(output);
        } else {
            let err = result.error()
            return Result.error<Cache>(changetype<Error>(err));
        }

    }

    has(cacheName: string): Result<bool> {

        let buffer = String.UTF8.encode(cacheName);
        let result = hostCall("storage", "cachestorage", "has", buffer);

        if (result.isOk) {

            return Result.ok(true);
        } else {
            let err = result.error()
            return Result.error<bool>(changetype<Error>(err));
        }
    }

    keys(): Result<Array<string>> {

        let buffer = new ArrayBuffer(0);
        let result = hostCall("storage", "cachestorage", "keys", buffer);

        if (result.isOk) {
            let result_buffer = result.get();

            const decoder = new Decoder(result_buffer);
            const keys = decoder.readArray((decoder: Decoder): string => {
                 return decoder.readString();
            });

            return Result.ok(keys);
        } else {
            let err = result.error()
            return Result.error<Array<string>>(changetype<Error>(err));
        }
    }

    match(request: Request, options: CacheOption): Result<Response | null> {
        
        let cacheRequest = new CacheRequest();
        cacheRequest.request = request.toBuffer();
        cacheRequest.options = options;

        let buffer = cacheRequest.toBuffer();

        let result = hostCall("storage", "cachestorage", "open", buffer);

        if (result.isOk) {
            let result_buffer = result.get();

            if (result_buffer.byteLength > 0) {
                const output = new Response();
                output.fromBuffer(result_buffer);

                return Result.ok(output);
            } else {
                return Result.ok(null);                
            }

        } else {
            let err = result.error()
            return Result.error<Response>(changetype<Error>(err));
        }
    }

    delete(cacheName: string): Result<bool> {

        let buffer = String.UTF8.encode(cacheName);
        let result = hostCall("storage", "cachestorage", "delete", buffer);
        if (result.isOk) {

            return Result.ok(true);
        } else {
            let err = result.error()
            return Result.error<bool>(changetype<Error>(err));
        }
    }

}

export class Cache {
    private _cacheName: string;

    constructor(cacheName: string) {

        this._cacheName = cacheName;
    }

    put(request: Request, response: Response): Result<null> {

        let _request = request.toBuffer();
        let _response = response.toBuffer();

        let input = new CacheRequest();
        input.request = _request;
        input.response = _response;

        let buffer = input.toBuffer();

        let result = hostCall("storage", "cache", "put", buffer);
        if (result.isOk) {

            return Result.ok(null);
        } else {
            let err = result.error()
            return Result.error<null>(changetype<Error>(err));
        }
    }

    match(request: Request, option: CacheOption): Result<Response | null> {

        if (!['GET', 'HEAD'].includes(request.method) && option.ignoreMethod) {
            return Result.error<Response>(new Error("request.method"));
        }

        let buffer = request.toBuffer();

        let result = hostCall("storage", "cache", "match", buffer);
        if (result.isOk) {
            let result_buffer = result.get();

            if (result_buffer.byteLength > 0) {
                const output = new Response();
                output.fromBuffer(result_buffer);

                return Result.ok(output);
            } else {
                return Result.ok(null);                
            }

        } else {
            let err = result.error()
            return Result.error<Response>(changetype<Error>(err))
        }
    }

    delete(request: Request, option: CacheOption): Result<bool> {

        if (!['GET', 'HEAD'].includes(request.method) && option.ignoreMethod) {
            return Result.ok(false);
        }

        let buffer = request.toBuffer();
        let result = hostCall("storage", "cache", "delete", buffer);
        if (result.isOk) {

            return Result.ok(true);
        } else {
            let err = result.error()
            return Result.error<bool>(changetype<Error>(err));
        }
    }

}

