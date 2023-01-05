import { Headers } from "./headers";
import { Body } from "./body";
import { Status } from "./status";
import { Decoder, Writer, Encoder, Sizer } from "@wapc/as-msgpack";

export class ResponseInit {
   status: u32 = 200;
   headers: Headers | null = null;
   statusText: string | null = null;
   url: string | null = null;
}

export class Response extends Body {

   // protected _status: u32;
   protected _status: Status;
   protected _headers: Headers;
   protected _statusText: string | null;
   // protected _redirected: boolean = false;
   protected _url: string | null;

   // private _cache: string;
   // private _credentials: string;
   // private _destination: string;
   // private _integrity: string;
   // private _mode: string;
   // private _priority: string;
   // private _redirect: string;
   // private _referrer: string;
   // private _referrerPolicy: string;

   constructor(body: ArrayBuffer | null = null, init: ResponseInit = new ResponseInit()) {
      super(body);

      this._status = new Status(init.status);
      this._statusText = init.statusText;

      if (init.headers == null) {
         this._headers = new Headers();
      } else {
         this._headers = changetype<Headers>(init.headers);
      }

      this._url = init.url;
   }

   get url(): string {
      if (this._url == null) {
         return "";
      }

      return this._url;
   }

   get status(): u32 {
      return this._status.code;
   }
   get statusText(): string {
      if (this._statusText == null) {
         return this._status.toString();
      }
      return changetype<string>(this._statusText);
   }

   get ok(): boolean {
      return this._status.code >= 200 && this._status.code < 300;
   }

   get headers(): Headers {
      return this._headers;
   }

   public clone(): Response {
      if (this.bodyUsed) {
         throw new Error("body has already been used");
      }
      let body2 = this.bodySource;

      const cloned = new Response(body2, {
         status: this.status,
         headers: this.headers,
         statusText: this.statusText,
         url: this.url,
      })
      return cloned;
   }

   encode(writer: Writer): void {
      writer.writeMapSize(6);
      writer.writeString("status");
      writer.writeInt16(this._status.code);
      writer.writeString("url");
      if (this._url) {
         writer.writeNil();
      } else {
         writer.writeString(changetype<string>(this._url));
      }
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
         if (field == "status") {
            let status = reader.readInt16();

            this._status = new Status(status);
            this._statusText = this._status.toString();

         } else if (field == "url") {
            if (reader.isNextNil()) {
               this._url = null;
            } else {
               this._url = reader.readString();
            }
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
