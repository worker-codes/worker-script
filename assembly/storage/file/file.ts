import { hostCall, Result } from "../../worker/wapc";
import { Decoder, Writer, Encoder, Sizer } from "@wapc/as-msgpack";

export function isNull<T>(value: T): boolean {
    return changetype<usize>(value) == 0;
}


export class Version {
    num: u32;
    content_len: u32;
    created_at: string;

    encode(writer: Writer): void {
        writer.writeMapSize(3);
        writer.writeString("num");
        writer.writeUInt32(this.num);
        writer.writeString("content_len");
        writer.writeUInt32(this.content_len);
        writer.writeString("created_at");
        writer.writeString(this.created_at);
    }

    decode(reader: Decoder): void {
        var numFields = reader.readMapSize();

        while (numFields > 0) {
            numFields--;
            const field = reader.readString();
            if (field == "num") {
                this.num = reader.readInt32();
            } else if (field == "content_len") {
                this.content_len = reader.readInt32();
            } else if (field == "created_at") {
                this.created_at = reader.readString();
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
export class MetaData{
    file_type: string;
    is_dir: bool;
    is_file: bool;
    content_len: u32;
    curr_version: u32;
    created_at: string;
    modified_at: string;

    encode(writer: Writer): void {
        writer.writeMapSize(5);
        writer.writeString("file_type");
        writer.writeString(this.file_type);
        writer.writeString("is_dir");
        writer.writeBool(this.is_dir);
        writer.writeString("is_file");
        writer.writeBool(this.is_file);
        writer.writeString("content_len");
        writer.writeUInt32(this.content_len);
        writer.writeString("curr_version");
        writer.writeInt32(this.curr_version);
        writer.writeString("created_at");
        writer.writeString(this.created_at);
        writer.writeString("modified_at");
        writer.writeString(this.modified_at);

    }

    decode(reader: Decoder): void {
        var numFields = reader.readMapSize();

        while (numFields > 0) {
            numFields--;
            const field = reader.readString();
            if (field == "file_type") {
                this.file_type = reader.readString();
            } else if (field == "is_dir") {
                this.is_dir = reader.readBool();
            } else if (field == "is_file") {
                this.is_file = reader.readBool();
            } else if (field == "content_len") {
                this.content_len = reader.readInt32();
            } else if (field == "curr_version") {
                this.curr_version = reader.readInt32();
            } else if (field == "created_at") {
                this.created_at = reader.readString();
            } else if (field == "modified_at") {
                this.modified_at = reader.readString();
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
export class DirEntry{
    path: string;
    file_name: string;
    metadata: MetaData;

    encode(writer: Writer): void {
        writer.writeMapSize(3);
        writer.writeString("path");
        writer.writeString(this.path);
        writer.writeString("file_name");
        writer.writeString(this.file_name);
        writer.writeString("metadata");
        this.metadata.encode(writer);
    }

    decode(reader: Decoder): void {
        var numFields = reader.readMapSize();

        while (numFields > 0) {
            numFields--;
            const field = reader.readString();
            if (field == "path") {
                this.path = reader.readString();
            } else if (field == "name") {
                this.file_name = reader.readString();
            } else if (field == "metadata") {
                this.metadata = new MetaData();
                this.metadata.decode(reader);
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

export class File {
    private path_inner: string;
    private name_inner: string;
    // private size: u32;
    private type_inner: string;
    private lastModified_inner: string;
    private content_inner: ArrayBuffer = new ArrayBuffer(0);

    // public curr_version: u32;   
    // public metadata: MetaData;
    // public history: Array<Version>;
    
    // constructor( path: string, name: string, type: string, lastModified: string, content: ArrayBuffer) {
    //     this.path_inner = path;
    //     this.name_inner = name;
    //     this.type_inner = type;
    //     this.lastModified_inner = lastModified;
    //     this.content_inner = content;
    // }

    
    get path(): string {
        return this.path_inner;
    }

    get name(): string {
        return this.name_inner;
    }

    get type(): string {
        return this.type_inner;
    }

    get lastModified(): string {
        return this.lastModified_inner;
    }

    text(): string {
        let text = String.UTF8.decode(this.content_inner);
        return text;
    }

    arrayBuffer(): ArrayBuffer {

        return this.content_inner;
    }

    encode(writer: Writer): void {
        writer.writeMapSize(5);
        writer.writeString("path");
        writer.writeString(this.path_inner);
        writer.writeString("name");
        writer.writeString(this.name_inner);
        writer.writeString("type");
        writer.writeString(this.type_inner);
        writer.writeString("lastModified");
        writer.writeString(this.lastModified_inner);
        writer.writeString("content");
        writer.writeByteArray(this.content_inner);

    }

    decode(reader: Decoder): void {
        var numFields = reader.readMapSize();

        while (numFields > 0) {
            numFields--;
            const field = reader.readString();
            if (field == "path") {
                this.path_inner = reader.readString();
            } else if (field == "name") {
                this.name_inner = reader.readString();
            } else if (field == "type") {
                this.type_inner = reader.readString();
            } else if (field == "last_modified") {
                this.lastModified_inner = reader.readString();
            } else if (field == "content") {
                this.content_inner = reader.readByteArray();
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

