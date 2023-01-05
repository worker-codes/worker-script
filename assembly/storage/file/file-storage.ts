import { hostCall, Result } from "../../worker/wapc";
import { Decoder, Writer, Encoder, Sizer } from "@wapc/as-msgpack";
import { File, Version, MetaData, DirEntry }  from "./file";

export function isNull<T>(value: T): boolean {
    return changetype<usize>(value) == 0;
}

class CreateFileRequest {
    path: string;
    content: ArrayBuffer = new ArrayBuffer(0);

    encode(writer: Writer): void {
        writer.writeMapSize(2);
        writer.writeString("request");
        writer.writeString(this.path);
        writer.writeString("response");
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


class FromToRequest {
    from: string;
    to: string;
    encode(writer: Writer): void {
        writer.writeMapSize(2);
        writer.writeString("from");
        writer.writeString(this.from);
        writer.writeString("to");
        writer.writeString(this.to);
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

export class FileStorage {

    create_file(path: string, content: ArrayBuffer): Result<File> {
        
        let request = new CreateFileRequest();
        request.path = path;
        request.content = content;

        const buffer = request.toBuffer();

        let result = hostCall("storage", "file", "create_file", buffer);
        if (result.isOk) {
            let result_buffer = result.get();
      
            const file = new File();
            file.fromBuffer(result_buffer);
      
            return Result.ok(file);
        } else {
            let err = result.error() 

            return Result.error<File>(changetype<Error>(err));
        }
    }

    read_file(path:string): Result<File> {

        let buffer = String.UTF8.encode(path);

        let result = hostCall("storage", "file", "read_file", buffer);
        if (result.isOk) {
            let result_buffer = result.get();

            const file = new File();
            file.fromBuffer(result_buffer);
      
            return Result.ok(file);
        } else {
            let err = result.error() 

            return Result.error<File>(changetype<Error>(err));
        }
    }

    read_text_file(path:string): Result<string> {

        let buffer = String.UTF8.encode(path);

        let result = hostCall("storage", "file", "read_text_file", buffer);
        if (result.isOk) {
            let result_buffer = result.get();
            let file = String.UTF8.decode(result_buffer);
      
            return Result.ok(file);
        } else {
            let err = result.error() 

            return Result.error<string>(changetype<Error>(err));
        }
    }

    remove_file(path:string): Result<null> {

        let buffer = String.UTF8.encode(path);

        let result = hostCall("storage", "file", "remove_file", buffer);
        if (result.isOk) {
      
            return Result.ok(null);
        } else {
            let err = result.error() 

            return Result.error<null>(changetype<Error>(err));
        }
    }

    rename(from: string, to: string): Result<null> {
        
        let request = new FromToRequest();
        request.from = from;
        request.to = to;
        const buffer = request.toBuffer();

        let result = hostCall("storage", "file", "rename", buffer);
        if (result.isOk) {
     
            return Result.ok(null);
        } else {
            let err = result.error() 

            return Result.error<null>(changetype<Error>(err));
        }
    }


    is_file(path:string): Result<boolean> {

        let buffer = String.UTF8.encode(path);

        let result = hostCall("storage", "file", "is_file", buffer);
        if (result.isOk) {
            let result_buffer = result.get();
      
            return Result.ok(changetype<boolean>(result_buffer));
        } else {
            let err = result.error() 

            return Result.error<boolean>(changetype<Error>(err));
        }
    }

    is_dir(path:string): Result<boolean> {

        let buffer = String.UTF8.encode(path);

        let result = hostCall("storage", "file", "is_dir", buffer);
        if (result.isOk) {
            let result_buffer = result.get();
      
            return Result.ok(changetype<boolean>(result_buffer));
        } else {
            let err = result.error() 

            return Result.error<boolean>(changetype<Error>(err));
        }
    }

    path_exists(path:string): Result<boolean> {

        let buffer = String.UTF8.encode(path);

        let result = hostCall("storage", "file", "path_exists", buffer);
        if (result.isOk) {
            let result_buffer = result.get();
      
            return Result.ok(changetype<boolean>(result_buffer));
        } else {
            let err = result.error() 

            return Result.error<boolean>(changetype<Error>(err));
        }
    }

    metadata(path:string): Result<MetaData> {

        let buffer = String.UTF8.encode(path);

        let result = hostCall("storage", "file", "metadata", buffer);
        if (result.isOk) {
            let result_buffer = result.get();

            const metadata = new MetaData();
            metadata.fromBuffer(result_buffer);
      
            return Result.ok(changetype<MetaData>(result_buffer));
        } else {
            let err = result.error() 

            return Result.error<MetaData>(changetype<Error>(err));
        }
    }

    history(path:string): Result<Array<Version>> {

        let buffer = String.UTF8.encode(path);

        let result = hostCall("storage", "file", "history", buffer);
        if (result.isOk) {
            let result_buffer = result.get();        
            
            const decoder = new Decoder(result_buffer);
            const version = decoder.readArray((decoder: Decoder): Version => {
                const dir_entry = new Version();
                dir_entry.decode(decoder);
                return dir_entry
            });

            return Result.ok(version);

        } else {
            let err = result.error() 

            return Result.error<Array<Version>>(changetype<Error>(err));
        }
    }

    create_dir(path:string): Result<null> {

        let buffer = String.UTF8.encode(path);

        let result = hostCall("storage", "file", "create_dir", buffer);
        if (result.isOk) {
      
            return Result.ok(null);
        } else {
            let err = result.error() 

            return Result.error<null>(changetype<Error>(err));
        }
    }

    create_dir_all(path:string): Result<null> {

        let buffer = String.UTF8.encode(path);

        let result = hostCall("storage", "file", "create_dir_all", buffer);
        if (result.isOk) {
      
            return Result.ok(null);
        } else {
            let err = result.error() 

            return Result.error<null>(changetype<Error>(err));
        }
    }

    read_dir(path:string): Result<Array<DirEntry>> {

        let buffer = String.UTF8.encode(path);

        let result = hostCall("storage", "file", "read_dir", buffer);
        if (result.isOk) {
            let result_buffer = result.get();         
            
            const decoder = new Decoder(result_buffer);
            const dir_entry = decoder.readArray((decoder: Decoder): DirEntry => {
                const dir_entry = new DirEntry();
                dir_entry.decode(decoder);
                return dir_entry
            });
      
            return Result.ok(dir_entry);
        } else {
            let err = result.error() 

            return Result.error<Array<DirEntry>>(changetype<Error>(err));
        }
    }

    remove_dir(path:string): Result<null> {

        let buffer = String.UTF8.encode(path);

        let result = hostCall("storage", "file", "remove_dir", buffer);
        if (result.isOk) {
      
            return Result.ok(null);
        } else {
            let err = result.error() 

            return Result.error<null>(changetype<Error>(err));
        }
    }

    remove_dir_all(path:string): Result<null> {

        let buffer = String.UTF8.encode(path);

        let result = hostCall("storage", "file", "remove_dir_all", buffer);
        if (result.isOk) {
      
            return Result.ok(null);
        } else {
            let err = result.error() 

            return Result.error<null>(changetype<Error>(err));
        }
    }
    copy_file(from:string, to:string): Result<null> {

        let request = new FromToRequest();
        request.from = from;
        request.to = to;
        const buffer = request.toBuffer();

        let result = hostCall("storage", "file", "copy_file", buffer);
        if (result.isOk) {
      
            return Result.ok(null);
        } else {
            let err = result.error() 

            return Result.error<null>(changetype<Error>(err));
        }
    }

    copy_dir_all(from:string, to:string): Result<null> {

        let request = new FromToRequest();
        request.from = from;
        request.to = to;
        const buffer = request.toBuffer();

        let result = hostCall("storage", "file", "copy_dir_all", buffer);
        if (result.isOk) {
      
            return Result.ok(null);
        } else {
            let err = result.error() 

            return Result.error<null>(changetype<Error>(err));
        }
    }

    // open(cacheName: string): Cache {
        
    //     let result = hostCall("cachestorage", "caches", "open", buffer);
    //     if (result.isOk) {
    //         let result_buffer = result.get();

    //         const output = new URLPatternTestResponse();
    //         output.fromBuffer(result_buffer);

    //         const cache = new Cache(cacheName);
    //         return cache

    //     } else {
    //         let err = result.error() 

    //         // const cache = new Cache(cacheName);
    //         // return cache
    //     }
    // }
}