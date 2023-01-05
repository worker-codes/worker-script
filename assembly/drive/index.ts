import { hostCall, Result } from "../worker/wapc";
import { Decoder, Writer, Encoder, Sizer } from "@wapc/as-msgpack";

//converts a string to a Uint8Array
function stringToArrayBuffer(str: string): ArrayBuffer {
    const sizer = new Sizer();
    sizer.writeString(str);
    const buffer = new ArrayBuffer(sizer.length);
    const encoder = new Encoder(buffer);
    encoder.writeString(str);

    return buffer;
}

function arrayBufferToString(buffer: ArrayBuffer): string {
    const decoder = new Decoder(buffer);
    const _string = decoder.readString();

    return _string;
}

export class PutRequest{
    path: string;
    content: ArrayBuffer;
    encode(writer: Writer): void {
        writer.writeMapSize(2);
        writer.writeString("path");
        writer.writeString(this.path);
        writer.writeString("data");
        writer.writeByteArray(this.content);
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

export class Drive {
    name: string;
    constructor(name: string) {
        this.name = name;
    }

    put(path: string, content: ArrayBuffer): Result<string>{
        let putRequest: PutRequest = {
            path: path,
            content: content,
        }

        let buffer = putRequest.toBuffer();
     
        let result = hostCall("storage", "file", "put", buffer);
        if (result.isOk) {
            let result_buffer = result.get();    
            let path = arrayBufferToString(result_buffer)

            return Result.ok(path)
        } else {
            let err = result.error()

            return Result.error<string>(changetype<Error>(err));
        }
    }

    get(path: string): Result<ArrayBuffer> {

        let buffer = stringToArrayBuffer(path);
        let result = hostCall("storage", "file", "get", buffer);
        if (result.isOk) {
            let result_buffer = result.get();                       

            return Result.ok(result_buffer)
        } else {
            let err = result.error()

            return Result.error<ArrayBuffer>(changetype<Error>(err));
        }
    }

    delete(path: string): Result<string> {
        let buffer = stringToArrayBuffer(path);
        let result = hostCall("storage", "file", "delete", buffer);
        if (result.isOk) {
            let result_buffer = result.get();    
            let path = arrayBufferToString(result_buffer)

            return Result.ok(path)
        } else {
            let err = result.error()

            return Result.error<string>(changetype<Error>(err));
        }
    }

    list(path: string): Result<string[]> {
        let buffer = stringToArrayBuffer(path);
        let result = hostCall("storage", "file", "get", buffer);
        if (result.isOk) {
            let result_buffer = result.get();    
            
            const decoder = new Decoder(result_buffer);
            let paths = decoder.readArray((decoder: Decoder): string => {
                return decoder.readString();
            });

            return Result.ok(paths)
        } else {
            let err = result.error()

            return Result.error<string[]>(changetype<Error>(err));
        }
    }
        
    
}