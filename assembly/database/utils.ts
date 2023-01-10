import { Decoder, Writer, Encoder, Sizer } from "@wapc/as-msgpack";
import { Format } from "@wapc/as-msgpack/assembly/format";
import { Value } from "./value";


export function read_marker(reader: Decoder): Value | null {
    const prefix: u8 = reader.reader.peekUint8()
    
    switch (true) {
        case (prefix === Format.NIL):
            let value = reader.isNextNil()
            return null;
        case (prefix === Format.TRUE):
            let value1 = reader.readBool()
            return Value.from(value1)
        case (prefix === Format.FALSE):
            let value2 = reader.readBool()
            return Value.from(value2)
        case (prefix === Format.BIN8):
            let value3 = reader.readByteArray()
            return Value.from(value3)
        case (prefix === Format.BIN16):
            let value4 = reader.readByteArray()
            return Value.from(value4)
        case (prefix === Format.BIN32):
            let value5 = reader.readByteArray()
            return Value.from(value5)
        case (prefix === Format.FLOAT32):
            let value6 = reader.readFloat32()
            return Value.from(value6)
        case (prefix === Format.FLOAT64):
            let value7 = reader.readFloat64()
            return Value.from(value7)
        case (prefix === Format.UINT8):
            let value8 = reader.readUInt8()
            return Value.from(value8)
        case (prefix === Format.UINT16):
            let value9 = reader.readUInt16()
            return Value.from(value9)
        case (prefix === Format.UINT32):
            let value10 = reader.readUInt32()
            return Value.from(value10)
        case (prefix === Format.UINT64):
            let value11 = reader.readUInt64()
            return Value.from(value11)
        case (prefix === Format.INT8):
            let value12 = reader.readInt8()
            return Value.from(value12)
        case (prefix === Format.INT16):
            let value13 = reader.readInt16()
            return Value.from(value13)
        case (prefix === Format.INT32):
            let value14 = reader.readInt32()
            return Value.from(value14)
        case (prefix === Format.INT64):
            let value15 = reader.readInt64()
            return Value.from(value15)
        case (prefix === Format.FIXEXT1):
            return null;
        case (prefix === Format.FIXEXT2):
            return null;
        case (prefix === Format.FIXEXT4):
            return null;
        case (prefix === Format.FIXEXT8):
            return null;
        case (prefix === Format.FIXEXT16):
            let value16 = reader.readBool()
            return Value.from(value16)
        case (prefix === Format.STR8):
            let value17 = reader.readString()
            return Value.from(value17)
        case (prefix === Format.STR16):
            let value18 = reader.readString()
            return Value.from(value18)
        case (prefix === Format.STR32):
            let value19 = reader.readString()
            return Value.from(value19)
        case (0xa0 <= prefix && prefix <= 0xbf):          
            let valueFIXSTR = reader.readString()           
            return Value.from(valueFIXSTR)
        case (prefix === Format.ARRAY16):
            return null;
        case (prefix === Format.ARRAY32):
            return null;
        case (prefix === Format.MAP16):
            return null;
        case (prefix === Format.MAP32):
            return null;
        default:
            return null;
    }

}