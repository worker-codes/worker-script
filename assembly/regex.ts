import { hostCall, Result } from "./worker/wapc";
import { Decoder, Writer, Encoder, Sizer } from "@wapc/as-msgpack";

export class Match {
    constructor(
        public matches: string[],
        public index: i32,
        public input: string,
        public indices: Array<Array<u32>>
    ) { }

    static fromMatch(match: string, index: i32, input: string, indices: Array<Array<u32>>): Match {
        return new Match([match], index, input, indices);
    }
}

export class Flags {
    global: bool = false;
    ignoreCase: bool = false;
    dotAll: bool = false;
    multiline: bool = false;

    indices: bool = false;
    unicode: bool = false;
    sticky: bool = false;

    constructor(flagString: string | null) {
        if (flagString) {
            this.global = flagString.includes("g");
            this.ignoreCase = flagString.includes("i");
            this.dotAll = flagString.includes("s");
            this.multiline = flagString.includes("m");

            this.indices = flagString.includes("d");
            this.unicode = flagString.includes("u");
            this.sticky = flagString.includes("y");

        }
    }
}

class RegExpRequest {
    pattern: string;
    flag: string = "";
    input: string = "";
    last_index: i32 = 0;

    encode(writer: Writer): void {
        writer.writeMapSize(4);
        writer.writeString("pattern");
        writer.writeString(this.pattern);
        writer.writeString("flag");
        writer.writeString(this.flag);
        writer.writeString("input");
        writer.writeString(this.input);
        writer.writeString("last_index");
        writer.writeInt32(this.last_index);
    }
    decode(reader: Decoder): void {
        var numFields = reader.readMapSize();

        while (numFields > 0) {
            numFields--;
            const field = reader.readString();
            if (field == "pattern") {
                this.pattern = reader.readString();
            } else if (field == "flag") {
                this.flag = reader.readString();
            } else if (field == "input") {
                this.input = reader.readString();
            } else if (field == "last_index") {
                this.last_index = reader.readInt32();
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

class RegExpResponse {
    matches: Array<string> = []
    index: i32 =0
    last_index: i32 =0
    input: string =""
    indices: Array<Array<u32>> = []
    groups: Map<string, string> = new Map<string, string>();

    decode(reader: Decoder): void {
        // this.matches = reader.readArray((decoder: Decoder): string => {
        //     return decoder.readString();
        // });

        var numFields = reader.readMapSize();

        while (numFields > 0) {
            numFields--;
            const field = reader.readString();
            if (field == "matches") {
                this.matches = reader.readArray((decoder: Decoder): string => {
                    return decoder.readString();
                });
            } else if (field == "index") {
                this.index = reader.readInt32();
            } else if (field == "last_index") {
                this.last_index = reader.readInt32();
            } else if (field == "input") {
                this.input = reader.readString();
            } else if (field == "indices") {
                this.indices = reader.readArray((decoder: Decoder): Array<u32> => {
                    return decoder.readArray((decoder: Decoder): u32 => {
                        return decoder.readUInt32();
                    });
                });
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

export class RegExp {

    private pattern: string;
    private _flags: Flags;
    private _lastIndex: i32;

    constructor(pattern: string, public flagsString: string = "") {

        this.pattern = pattern;
        this._flags = new Flags(flagsString);

    }

    exec(str: string): Match | null {

        let last_index = 0;

        if (this._flags.sticky) {
            last_index = this._lastIndex
        }

        if (this._flags.global) {
            last_index = this._lastIndex
        }

        let content: RegExpRequest = {
            pattern: this.pattern,
            flag: this.flagsString,
            input: str,
            last_index: last_index
        }
        console.log(this.pattern);
        console.log(this.flagsString);


        let buffer = content.toBuffer();

        let result = hostCall("utils", "RegExp", "exec", buffer);
        if (result.isOk) {
            let result_buffer = result.get();

            const output = new RegExpResponse();
            output.fromBuffer(result_buffer);

            // let matches = output.matches[0];
            // console.log("||||||||||||||");
            // console.log(matches);
            this._lastIndex = output.last_index;
            const match = new Match(
                output.matches,
                output.index,
                output.input,
                output.indices
            );
            // Frankly, Miss Piggy
            // let matches

            return match
        } else {
            let err = result.error()

            return null;
        }
    }

    test(str: string): bool {
        return this.exec(str) != null;
    }

    toString(): string {
        return this.pattern;
    }

    get flags(): string {
        return this.flagsString;
    }

    get global(): bool {
        return this._flags.global;
    }

    get hasIndices(): bool {
        return this._flags.indices;
    }

    get ignoreCase(): bool {
        return this._flags.ignoreCase;
    }

    get dotAll(): bool {
        return this._flags.dotAll;
    }

    get multiline(): bool {
        return this._flags.multiline;
    }

    get source(): string {
        return this.pattern;
    }

    get sticky(): bool {
        return this._flags.sticky;
    }

    get unicode(): bool {
        return this._flags.unicode;
    }

    get lastIndex(): i32 {
        return this._lastIndex;
    }

    set lastIndex(index:i32) {
        this._lastIndex = index;
    }


}