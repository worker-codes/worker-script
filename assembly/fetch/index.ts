import { Decoder, Writer, Encoder, Sizer } from "@wapc/as-msgpack";
import { Headers, Request, Response, ResponseInit } from "../http";
import { hostCall, Result } from "../worker/wapc";

export class FetchInit {
    method: string
    headers: Headers
    body: ArrayBuffer
    redirect: string

    encode(writer: Writer): void {
        writer.writeMapSize(3);
        writer.writeString("method");
        writer.writeString(this.method);
        writer.writeString("headers");
        writer.writeByteArray(this.headers.toBuffer());
        writer.writeString("body");
        writer.writeByteArray(this.body);
        writer.writeString("redirect");
        writer.writeString(this.redirect);
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

class FetchRequest {
    method: string;
    url: string;
    headers: Headers;
    client_rid: u32 | null = null;
    has_body: bool;
    body_length: u32 | null = null;
    data: ArrayBuffer | null = null;

    encode(writer: Writer): void {
        writer.writeMapSize(5);
        writer.writeString("method");
        writer.writeString(this.method);
        writer.writeString("url");
        writer.writeString(this.url);
        writer.writeString("headers");
        writer.writeByteArray(this.headers.toBuffer());
        writer.writeString("client_rid");
        if (this.client_rid == null) {
            writer.writeNil();
        } else {
            writer.writeUInt32(this.client_rid);
        }
        writer.writeString("has_body");
        writer.writeBool(this.has_body);
        writer.writeString("body_length");
        if (this.body_length == null) {
            writer.writeNil();
        } else {
            writer.writeUInt32(this.body_length);
        }
        if (this.data == null) {
            writer.writeNil();
        } else {
            writer.writeByteArray(this.data);
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
class FetchReturn {
    request_rid: u32;
    request_body_rid: u32 | null = null;
    // cancel_handle_rid: u32 | null = null;

    decode(reader: Decoder): void {
        var numFields = reader.readMapSize();

        while (numFields > 0) {
            numFields--;
            const field = reader.readString();
            if (field == "request_rid") {
                this.request_rid = reader.readUInt32();
            }
            if (field == "request_body_rid") {
                this.request_body_rid = reader.readUInt32();
            }

        }
    }
    fromBuffer(buffer: ArrayBuffer): void {
        const decoder = new Decoder(buffer);
        this.decode(decoder);
    }
}
class FetchResponse {
    status: u16 = 200;
    status_text: string ="OK";
    url: string ="";
    response_rid: i32 = 0;
    headers: string[][] =[];
    body: ArrayBuffer = new ArrayBuffer(0);

    encode(writer: Writer): void {
        writer.writeMapSize(6);
        writer.writeString("status");
        writer.writeUInt16(this.status);
        writer.writeString("status_text");
        writer.writeString(this.status_text);
        writer.writeString("url");
        writer.writeString(this.url);
        writer.writeString("response_rid");
        writer.writeInt32(this.response_rid);

        writer.writeString("headers");
        writer.writeArray<string[]>(this.headers, (writer: Writer, key: string[]) => {
            writer.writeArray(key, (writer: Writer, value: string) => {
                writer.writeString(value);
            });
        });

        writer.writeString("body");
        writer.writeByteArray(this.body);
    }
    decode(reader: Decoder): void {
        var numFields = reader.readMapSize();

        while (numFields > 0) {
            numFields--;
            const field = reader.readString();
            if (field == "status") {
                this.status = reader.readUInt16();
            } else if (field == "status_text") {
                this.status_text = reader.readString();
            } else if (field == "url") {
                this.url = reader.readString();
            } else if (field == "response_rid") {
                this.response_rid = reader.readInt32();
            } else if (field == "headers") {

                this.headers = reader.readArray((decoder: Decoder): string[] => {
                    return decoder.readArray((decoder2: Decoder): string => {
                        return decoder2.readString();
                    });
                });                

            } else if (field == "body") {
                this.body = reader.readByteArray();
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


export function fetch(request: Request, options: FetchInit | null = null): Result<Response> {

    let body = request.arrayBuffer();
    if (body == null) {
        body = new ArrayBuffer(0);
    }

    let request_headers = new Headers();

    if (options instanceof FetchInit) {
        request_headers = options.headers;
    } else {
        request_headers = request.headers
    }

    const fetch_request: FetchRequest = {
        method: request.method,
        // redirect: request.redirect,
        url: request.url,
        headers: request_headers,
        client_rid: 0,
        has_body: true,
        body_length: body.byteLength,
    }

    let buffer = fetch_request.toBuffer();

    // initalize fetch
    let result = hostCall("fetch", "init", "", buffer);
    if (result.isOk) {
        let result_buffer = result.get();    
        
        const fetch_response = new FetchResponse();
        fetch_response.fromBuffer(result_buffer);   
       
        let header = new Headers();
        let r_header = fetch_response.headers;
        for (var i = 0; i < r_header.length; i++) {
            let key = r_header[i][0];
            let value = r_header[i];
            header.set(key, value)
        }
    
        let init: ResponseInit = {
            status: fetch_response.status,
            headers: header,
            statusText: fetch_response.status_text,
            url: request.url,
        }
        if (requestBodyRid !== null) {

        }







        let response = new Response(fetch_response.body, init);
        return Result.ok(response)

    } else {
        let err = result.error()

        return Result.error<Response>(changetype<Error>(err));
    }


    // let resp = result.get();

    // let body_length_slice = resp.slice(0, 4);
    // let dv = new DataView(body_length_slice, 0);
    // let body_length = dv.getUint32(0);

    // let body_position = body_length + 4
    // let body_B = resp.slice(4, body_position);
    // let head = resp.slice(body_position, resp.byteLength);
    // let text = String.UTF8.decode(head);

    // const fetch_response = parse<FetchResponse>(text);


    // let header = new Headers();
    // let r_header = fetch_response.headers;
    // for (var i = 0; i < r_header.length; i++) {
    //     let key = r_header[i][0];
    //     let value = r_header[i];
    //     header.set(key, value)
    // }

    // let init: ResponseInit = {
    //     status: fetch_response.status,
    //     headers: header,
    //     statusText: fetch_response.status_text,
    //     url: request.url,
    // }

    // return new Response(body_B, init);



}


// Languages like Go and Rust haven't support exceptions and usually use Optional types or tuples / objects during return result. You could follow same approach:
// class Result<T> {
//     value: T | null = null;
//     error: string | null = null;
//  }
 
//  function getRequestResult(url: string): Result {
//      let body = ...
//      if (body == null) {
//        return { value: null, error: "can't request from url" };
//      } else {
//        return { value: body, error: null };
//      }
//  }