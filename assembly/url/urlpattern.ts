import { hostCall, Result } from "../worker/wapc";
import { Decoder, Writer, Encoder, Sizer } from "@wapc/as-msgpack";
import { URL } from ".";

export class MatchInput {
    protocol: string;
    username: string;
    password: string;
    hostname: string;
    port: string;
    pathname: string;
    search: string;
    hash: string;
}

export class UrlPatternComponentResult {
    input: string;
    groups: Map<string, string>;

    decode(reader: Decoder): void {
        var numFields = reader.readMapSize();

        while (numFields > 0) {
            numFields--;
            const field = reader.readString();
            if (field == "input") {
                this.input = reader.readString();

            } else if (field == "groups") {
                this.groups = reader.readMap(
                    (decoder: Decoder): string => {
                        return decoder.readString();
                    },
                    (decoder: Decoder): string => {
                        return decoder.readString();
                    }
                );
            }

        }
    }

    fromBuffer(buffer: ArrayBuffer): void {
        const decoder = new Decoder(buffer);
        this.decode(decoder);
    }
}

export class UrlPatternResult {
    protocol: UrlPatternComponentResult = {
        input: "",
        groups: new Map<string, string>(),
    };
    username: UrlPatternComponentResult = {
        input: "",
        groups: new Map<string, string>(),
    };
    password: UrlPatternComponentResult = {
        input: "",
        groups: new Map<string, string>(),
    };
    hostname: UrlPatternComponentResult = {
        input: "",
        groups: new Map<string, string>(),
    };
    port: UrlPatternComponentResult = {
        input: "",
        groups: new Map<string, string>(),
    };
    pathname: UrlPatternComponentResult = {
        input: "",
        groups: new Map<string, string>(),
    };
    search: UrlPatternComponentResult = {
        input: "",
        groups: new Map<string, string>(),
    };
    hash: UrlPatternComponentResult = {
        input: "",
        groups: new Map<string, string>(),
    };

    decode(reader: Decoder): void {
        var numFields = reader.readMapSize();

        let props = ["protocol", "username", "password", "hostname", "port", "pathname", "search", "hash"];
        while (numFields > 0) {
            numFields--;

            const field = reader.readString();
            if (props.includes(field)) {

                let _input = "";
                let _groups = new Map<string, string>();

                let numFields = reader.readMapSize();
                while (numFields > 0) {
                    numFields--;

                    const field = reader.readString();
                    if (field == "input") {
                        let input = reader.readString();
                        _input = input;

                    } else if (field == "groups") {

                        let groups = reader.readMap(
                            (decoder: Decoder): string => {
                                return decoder.readString();
                            },
                            (decoder: Decoder): string => {
                                return decoder.readString();
                            }
                        );

                        _groups = groups;

                    }
                }

                let _value: UrlPatternComponentResult = {
                    input: _input,
                    groups: _groups,
                }

                if (field == "protocol") {
                    this.protocol = _value
                } else if (field == "username") {
                    this.username = _value
                } else if (field == "password") {
                    this.password = _value
                } else if (field == "hostname") {
                    this.hostname = _value
                } else if (field == "port") {
                    this.port = _value
                } else if (field == "pathname") {
                    this.pathname = _value
                } else if (field == "search") {
                    this.search = _value
                } else if (field == "hash") {
                    this.hash = _value
                }

            }

        }
    }

    fromBuffer(buffer: ArrayBuffer): void {
        const decoder = new Decoder(buffer);
        this.decode(decoder);
    }

    private parseGroups(map: Map<string, string>): string {
        let keys = map.keys();
        let values = map.values();
        let result:string[] = []
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const value = values[i];
            result.push(`"${key}":"${value}"`)
        }
        return result.join(",/n")
    }
   /**
    * toString
    */
   public toString():string {
    
       let response = `{
    "protocol":{
        "input":"${this.protocol.input}",
        "group":{
            ${this.parseGroups(this.protocol.groups)}
        }
    },
    "username":{
        "input":"${this.username.input}",
        "group":{
            ${this.parseGroups(this.username.groups)}
        }
    },
    "password":{
        "input":"${this.password.input}",
        "group":{
            ${this.parseGroups(this.password.groups)}
        }
    },
    "hostname":{
        "input":"${this.hostname.input}",
        "group":{
            ${this.parseGroups(this.hostname.groups)}
        }
    },
    "port":{
        "input":"${this.port.input}",
        "group":{
            ${this.parseGroups(this.port.groups)}
        }
    },
    "pathname":{
        "input":"${this.pathname.input}",
        "group":{
            ${this.parseGroups(this.pathname.groups)}
        }
    },
    "search":{
        "input":"${this.search.input}",
        "group":{
            ${this.parseGroups(this.search.groups)}
        }
    },
    "hash":{
        "input":"${this.hash.input}",
        "group":{
            ${this.parseGroups(this.hash.groups)}
        }
    }
}`;

    return response;

   }
}

export function isNull<T>(value: T): boolean {
    return changetype<usize>(value) == 0;
}

export class UrlPatternInit {
    protocol: string | null = null;
    username: string | null = null;
    password: string | null = null;
    hostname: string | null = null;
    port: string | null = null;
    pathname: string | null = null;
    search: string | null = null;
    hash: string | null = null;
    baseURL: string | null = null;

    encode(writer: Writer): void {
        writer.writeMapSize(9);

        writer.writeString("protocol");
        if (!isNull(this.protocol)) {
            writer.writeString(changetype<string>(this.protocol));
        } else {
            writer.writeNil();
        }

        writer.writeString("username");
        // writer.writeNil();
        if (!isNull(this.username)) {
            writer.writeString(changetype<string>(this.username));
        } else {
            writer.writeNil();
        }

        writer.writeString("password");
        if (!isNull(this.password)) {
            writer.writeString(changetype<string>(this.password));
        } else {
            writer.writeNil();
        }

        writer.writeString("hostname");
        if (this.hostname != null) {
            writer.writeString(changetype<string>(this.hostname));
        } else {
            writer.writeNil();
        }

        writer.writeString("port");
        if (!isNull(this.port)) {
            writer.writeString(changetype<string>(this.port));
        } else {
            writer.writeNil();
        }

        writer.writeString("pathname");
        if (this.pathname != null) {
            writer.writeString(changetype<string>(this.pathname));
        } else {
            writer.writeNil();
        }

        writer.writeString("search");
        if (!isNull(this.search)) {
            writer.writeString(changetype<string>(this.search));
        } else {
            writer.writeNil();
        }

        writer.writeString("hash");
        if (!isNull(this.hash)) {
            writer.writeString(changetype<string>(this.hash));
        } else {
            writer.writeNil();
        }

        writer.writeString("base_url");
        if (!isNull(this.baseURL)) {
            writer.writeString(changetype<string>(this.baseURL));
        } else {
            writer.writeNil();
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

// typedef (USVString or URLPatternInit) URLPatternInput;

export class URLPattern {
    private _pattern: UrlPatternInit;

    /**
    * @param {URLPatternInput} input
    * @param {string} [baseURL]
    */
    constructor(input: UrlPatternInit, baseURL: string | null = null) {


        input.baseURL = baseURL;
        this._pattern = input;
    }

    get protocol(): string | null {

        return this._pattern.protocol;
    }

    get username(): string | null {

        return this._pattern.username;
    }

    get password(): string | null {

        return this._pattern.password;
    }

    get hostname(): string | null {

        return this._pattern.hostname;
    }

    get port(): string | null {

        return this._pattern.port;
    }

    get pathname(): string | null {

        return this._pattern.pathname;
    }

    get search(): string | null {

        return this._pattern.search;
    }

    get hash(): string | null {

        return this._pattern.hash;
    }


    /**
     * @param {URLPatternInput} input
     * @param {string} [baseURL]
     * @returns {boolean}
     */
    test(input: UrlPatternInit): boolean {

        if (!isNull(input.baseURL)) {
            new URL(<string>input.baseURL);
        }

        let pattern = this._pattern.toBuffer();
        let test = input.toBuffer();

        const sizer = new Sizer();
        sizer.writeMapSize(2);
        sizer.writeString("pattern");
        sizer.writeByteArray(pattern);
        sizer.writeString("test");
        sizer.writeByteArray(test);

        const buffer = new ArrayBuffer(sizer.length);
        const encoder = new Encoder(buffer);
        encoder.writeMapSize(2);
        encoder.writeString("pattern");
        encoder.writeByteArray(pattern);
        encoder.writeString("test");
        encoder.writeByteArray(test);


        let result = hostCall("url", "URLPattern", "test", buffer);
        if (result.isOk) {
            let result_buffer = result.get();

            const output = new URLPatternTestResponse();
            output.fromBuffer(result_buffer);

            return output.value;
        } else {
            let err = result.error()
            return false
        }

    }

    /**
     * @param {URLPatternInput} input
     * @param {string} [baseURL]
     * @returns {URLPatternResult | null}
     */
    exec(input: UrlPatternInit): UrlPatternResult | null {

        if (!isNull(input.baseURL)) {
            new URL(<string>input.baseURL);
        }

        let pattern = this._pattern.toBuffer();
        let test = input.toBuffer();

        const sizer = new Sizer();
        sizer.writeMapSize(2);
        sizer.writeString("pattern");
        sizer.writeByteArray(pattern);
        sizer.writeString("test");
        sizer.writeByteArray(test);

        const buffer = new ArrayBuffer(sizer.length);
        const encoder = new Encoder(buffer);
        encoder.writeMapSize(2);
        encoder.writeString("pattern");
        encoder.writeByteArray(pattern);
        encoder.writeString("test");
        encoder.writeByteArray(test);

        let result = hostCall("url", "URLPattern", "exec", buffer);
        let result_buffer = result.get();

        const output = new UrlPatternResult();
        output.fromBuffer(result_buffer);


        return output;
    }
}


class URLPatternTestResponse {
    value: boolean = false;

    encode(writer: Writer): void {
        writer.writeMapSize(2);
        writer.writeString("value");
        writer.writeBool(this.value);
    }
    decode(reader: Decoder): void {
        var numFields = reader.readMapSize();

        while (numFields > 0) {
            numFields--;
            const field = reader.readString();
            if (field == "value") {
                this.value = reader.readBool();
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