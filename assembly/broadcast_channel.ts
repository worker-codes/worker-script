import { hostCall, Result } from "./worker/wapc";
import { Decoder, Writer, Encoder, Sizer } from "@wapc/as-msgpack";

//EventSourceBroadcastChannel
class BroadcastChannelRequest {
    channel_name: string;
    message: ArrayBuffer = new ArrayBuffer(0);

    encode(writer: Writer): void {
        writer.writeMapSize(2);
        writer.writeString("channel_name");
        writer.writeString(this.channel_name);
        writer.writeString("message");
        writer.writeByteArray(this.message);
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
// MessageChannel EventChannel EventSourceBroadcast
export class BroadcastChannel {
    private name: string;

    constructor(channel_name: string) {

        this.name = channel_name;
    }

    postMessage(message: ArrayBuffer): void {

        let request = new BroadcastChannelRequest();
        request.channel_name = this.name;
        request.message = message;

        let buffer = request.toBuffer();

        let result = hostCall("message", "broadcast_channel", "post", buffer);

        if (result.isOk) {
            let result_buffer = result.get();

        } else {
            let err = result.error()
        }
    }

}