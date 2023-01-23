import { Decoder, Encoder, Sizer, Writer } from "@wapc/as-msgpack";
import { hostCall } from "../../worker/wapc";
// import { ResetQueue } from "./abstract-ops/queue-with-sizes";
// import { ExtractHighWaterMark, ExtractSizeAlgorithm } from "./abstract-ops/queuing-strategy";

class ReadReturn {
    chunk: ArrayBuffer = new ArrayBuffer(0);
    size: u32 = 0;
    rid: u32 = 0;

    decode(reader: Decoder): void {
        var numFields = reader.readMapSize();

        while (numFields > 0) {
            numFields--;
            const field = reader.readString();
            if (field == "chunk") {
                this.chunk = reader.readByteArray();
            } else if (field == "size") {
                this.size = reader.readUInt32();
            } else if (field == "rid") {
                this.rid = reader.readUInt32();
            }

        }
    }
    fromBuffer(buffer: ArrayBuffer): void {
        const decoder = new Decoder(buffer);
        this.decode(decoder);
    }
}

class ReadRequest {
    rid: u32;
    size: u32;

    encode(encoder: Writer): void {
        encoder.writeMapSize(2);
        encoder.writeString("rid");
        encoder.writeUInt32(this.rid);
        encoder.writeString("size");
        encoder.writeUInt32(this.size);
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

export class ReadResponse {
    done: boolean;

    value: ArrayBuffer;
}


export interface ReadableStreamInterface {
    // closed(): boolean;
    releaseLock(): void;
    readAll(): ArrayBuffer;
    read(): ReadResponse;
}


export interface ReadableStreamReader{
    // closed(): boolean;
    releaseLock(): void;
    readAll(): ArrayBuffer;
    read(): ReadResponse;
}

export class ReadableStream {

    // private _controller: string;
    // private _detached: string;
    // private _disturbed: string;
    private _state: string;
    private reader: ReadableStreamBodyReader | null = null;
    // private storedError: Error;

    private rid: u32;
    
    _locked: boolean;
    constructor(bodyHandle: u32) {
        this.rid = bodyHandle;
        this._state = "readable";
    }

    getReader(): ReadableStreamBodyReader | null {
        if (this._locked) {
            return null;
        }

        this.reader = new ReadableStreamBodyReader(this, this.rid);

        this._locked = true;

        return this.reader;
    }

    get locked(): boolean {
        return this._locked;
    }
}


export class ReadableStreamBodyReader implements ReadableStreamReader {
    private _readableStream: ReadableStream;
    private rid: u32;
    private _isDone: boolean;
    private _closed: boolean;

    constructor(readableStream: ReadableStream, bodyHandle: u32) {
        this._readableStream = readableStream;
        this.rid = bodyHandle;
        this._closed = false;
        this._isDone = false;
    }


    get closed(): boolean {
        return this._closed;
    }

    releaseLock(): void {
        this._readableStream._locked = false;
        this._closed = true;
    }

    readAll(): ArrayBuffer {
        let remainingBodyByteArray = new Array<u8>();

        // Keep reading until we reach the end of the body.
        while (!this._isDone) {
            let readResponse = this.read();
            if (!readResponse.done) {
                let chunk = Uint8Array.wrap(readResponse.value);
                for (let i = 0; i < chunk.length; i++) {
                    remainingBodyByteArray.push(chunk[i]);
                }
            }
        }

        // Convert our byte array into a typed array
        let remainingBodyTypedArray = new Uint8Array(remainingBodyByteArray.length);
        for (let i = 0; i < remainingBodyByteArray.length; i++) {
            remainingBodyTypedArray[i] = remainingBodyByteArray[i];
        }

        return remainingBodyTypedArray.buffer;
    }

    read(): ReadResponse {
        if (this._isDone || this._closed) {
            this.releaseLock();
            return {
                done: true,
                value: new ArrayBuffer(0),
            };
        }

        // Create a chunk to be filled
        let chunkSize = 1024;

        // @ts-ignore
        let read_request: ReadRequest = {
            rid: this.rid,
            size: chunkSize
        }

        let read_request_buffer = read_request.toBuffer();

        let result_read_body = hostCall("fetch", "read_body", "", read_request_buffer);
        if (result_read_body.isOk) {
            let result_buffer = result_read_body.get();
            let read_return = new ReadReturn();
            read_return.fromBuffer(result_buffer);

            let nwrittenOut = read_return.size;
            this.rid = read_return.rid;

            if (nwrittenOut == 0) {
                this._isDone = true;
                this.releaseLock();
                return {
                    done: true,
                    value: new ArrayBuffer(0),
                };
            }

            return {
                done: false,
                value: read_return.chunk,
            };
        } else {
            let err = result_read_body.error()

            throw new Error("Could not read the body in the ReadableStream");
        }


    }
}

// export class ReadableStream2 {
//     private _controller: ReadableStreamController;
//     // private _detached: string;
//     private _disturbed: bool = false;
//     private _state: string = 'readable';
//     private _reader: ReadableStreamBodyReader | null = null;
//     private _storedError: Error | null = null;

//     constructor(underlying_source: UnderlyingSource, strategy: QueuingStrategy | null = null) {
//         const sizeAlgorithm = ExtractSizeAlgorithm(strategy);
//         const highWaterMark = ExtractHighWaterMark(strategy, 1);

//         // underlying_source.start = underlying_source.start || (() => { });
//         // underlying_source.pull = underlying_source.pull || (() => { });
//         // underlying_source.cancel = underlying_source.cancel || (() => { });

//         const controller = new ReadableStreamDefaultController();
//         // this._controller = controller;

       

//         // Need to set the slots so that the assert doesn't fire. In the spec the slots already exist implicitly.
//         // controller._queue = null;
//         // controller._queueTotalSize = null;
//         ResetQueue(controller);
      
//         // controller._started = false;
//         // controller._closeRequested = false;
//         // controller._pullAgain = false;
//         // controller._pulling = false;
      
//         controller._strategySizeAlgorithm = sizeAlgorithm;
//         controller._strategyHWM = highWaterMark;
      
//         controller._pullAlgorithm = underlying_source.start;
//         controller._cancelAlgorithm = underlying_source.cancel;
      
//         this._controller = controller;
//         controller._stream = this;

//         underlying_source.start(controller);


//         controller._started = true;

//         // assert(controller._pulling === false);
//         // assert(controller._pullAgain === false);
  
//         // ReadableStreamDefaultControllerCallPullIfNeeded(controller);



//     }
// }

// // export interface QueuingStrategy {
// //     highWaterMark: u32 ;
// //     size: (chunk: u32) => u32 ;
// // }
// // export interface UnderlyingSource {
// //     start: (controller: ReadableStreamController) => void | null;
// //     pull: (controller:ReadableStreamController) =>  void | null;
// //     cancel: (reason:string) =>  void;
// //     type: string | null;
// //     autoAllocateChunkSize: u32;
// // }

// export class QueuingStrategy {
//     highWaterMark: u32 ;
//     size: (chunk: u32) => u32 = () => 1;
// }
// export class UnderlyingSource {
//     start: (controller: ReadableStreamController) => void = () => {};
//     pull: (controller:ReadableStreamController) =>  void = () => {};
//     cancel: (reason:string) =>  void = () => {};
//     type: string | null;
//     autoAllocateChunkSize: u32 = -1;
// }



// let queuingStrategy:QueuingStrategy = {
//     highWaterMark: 1,
//     size: (chunk: u32) => {
//         return chunk;
//     }
// }
// let underlyingSource: UnderlyingSource = {
//     start: (controller: ReadableStreamController) => {
//         // controller.
//         console.log("start");
//     },
//     // pull: (controller: ReadableStreamController) => {
//     //     console.log("pull");
//     // },
//     cancel: (reason: string) => {
//         console.log("cancel");
//     }
// }

// let read_stream = new ReadableStream2(underlyingSource);

// export interface ReadableStreamController{
//     _queueTotalSize:u32
//     // closed(): boolean;
//     close(): void;
//     enqueue(chunk:ArrayBuffer):void;
//     error(e: Error): void;
//     _cancelSteps(reason: ArrayBuffer): void;
//     _pullSteps(readRequest: ArrayBuffer): void;
//     _releaseSteps(): void;
// }

// export class ReadableStreamDefaultController implements ReadableStreamController {
//     _stream: ReadableStream2 | null = null;
//     _queue:Array<ArrayBuffer> | null = null;
//     _queueTotalSize:u32 = -1;
//     _started: boolean = false;
//     _closeRequested: boolean = false;
//     _pullAgain: boolean = false;
//     _pulling: boolean = false;
//     _strategySizeAlgorithm: (chunk: u32) => u32 = () => 1;
//     _strategyHWM: u32 = 1;
//     _pullAlgorithm: (controller:ReadableStreamController) =>  void = () => {};;
//     _cancelAlgorithm: (controller: string) => void = () => { };

//     constructor() {
//     }
    
//     get desiredSize():u32 {
//         return 0;
//     }

//     close():void {

//     }

//     enqueue(chunk:ArrayBuffer):void {

//     }

//     error(e:Error):void {

//     }

//     _cancelSteps(reason:ArrayBuffer):void {

//     }

//     _pullSteps(readRequest:ArrayBuffer):void {
 
//     }

//     _releaseSteps():void { }



// }