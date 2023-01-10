const enum Discriminator {
    Bool,
    I8, I16, I32, I64,
    U8, U16, U32, U64,
    F32, F64,
    UnmanagedRef,
    ManagedRef
}

//   class Parent<T> { }  
// @ts-ignore: decorator
@inline
    function DISCRIMINATOR<T>(): Discriminator {
    if (isManaged<T>()) return Discriminator.ManagedRef + idof<T>();
    if (isReference<T>()) return Discriminator.UnmanagedRef;


    // var value: Parent<T> = new Parent<T>();
    // let value: T;
    // let value: T | null = null;
    // let value !: T;

    let type_name = nameof<T>()
    if (type_name === "bool") return Discriminator.Bool;
    if (type_name === "i8") return Discriminator.I8;
    if (type_name === "i16") return Discriminator.I16;
    if (type_name === "i32") return Discriminator.I32;
    if (type_name === "i64") return Discriminator.I64;
    if (type_name === "u8") return Discriminator.U8;
    if (type_name === "u16") return Discriminator.U16;
    if (type_name === "u32") return Discriminator.U32;
    if (type_name === "u64") return Discriminator.U64;
    if (type_name === "f32") return Discriminator.F32;
    if (type_name === "f64") return Discriminator.F64;
    return unreachable();
}

// @ts-ignore: decorator
@inline
    const STORAGE = offsetof<Value>("storage");

// @ts-ignore: decorator
@final
export class Value {

    @inline static from<T>(value: T): Value {
        
        var out = changetype<Value>(__new(offsetof<Value>(), idof<Value>()));
        out.set<T>(value);
        return out;
    }

    @inline static idof<T>(): i32 {
        return DISCRIMINATOR<T>();
    }

    public discriminator: i32;
    private storage: u64;
    private nameof: string;

    
    public get type() : i32 {
        return  this.discriminator;
    }
    

    @inline toString(): string {
        let name: string = this.nameof;
        switch (true) {
            case ("i32" == name):
                return this.get<i32>().toString();
            case ("i64" == name):
                return this.get<i64>().toString();
            case ("u32" == name):
                return this.get<u32>().toString();
            case ("u64" == name):
                return this.get<u64>().toString();
            case ("f32" == name):
                return this.get<f32>().toString();
            case ("f64" == name):
                return this.get<f64>().toString();
            case ("bool" == name):
                return this.get<bool>().toString();
            case ("String" == name):
                return this.get<string>();
            default:
                return "["+this.nameof+"]";
        }         
    }

    private constructor() { unreachable(); }

    @inline get id(): i32 {
        return this.discriminator;
    }

    @inline set<T>(value: T): void {
        let type_name = nameof<T>()
        this.nameof = type_name;
        this.discriminator = DISCRIMINATOR<T>();
        store<T>(changetype<usize>(this), value, STORAGE);
    }

    @inline get<T>(): T {
        if (!this.is<T>()) throw new Error("type mismatch");
        let value = this.getUnchecked<T>();
        if (isReference<T>() && !isNullable<T>()) {
            if (!value) throw new Error("unexpected null");
        }
        return value;
    }

    @unsafe @inline getUnchecked<T>(): T {
        return load<T>(changetype<usize>(this), STORAGE);
    }

    @inline is<T>(): bool {
        return this.discriminator == DISCRIMINATOR<T>();
    }

    @unsafe private __visit(cookie: u32): void {
        if (this.discriminator >= Discriminator.ManagedRef) {
            let ptr = this.getUnchecked<usize>();
            if (ptr) __visit(ptr, cookie);
        }
    }
}









// switch (true) {
//     case (isString<T>()): {
//         let sizer: Sizer = new Sizer();
//         let val = arg.get<string>();
//         sizer.writeString(val);
//         this.byteLength = this.byteLength + sizer.length;
//         const buffer = new ArrayBuffer(sizer.length);

//         const encoder = new Encoder(buffer);
//         encoder.writeString(val);
//         this.buffer = this.appendBuffer(buffer, this.buffer);
//         break;
//     } 
//     case (isNullable<T>()): {
//         let sizer: Sizer = new Sizer();
//         sizer.writeNil();
//         this.byteLength = this.byteLength + sizer.length;
//         const buffer = new ArrayBuffer(sizer.length);

//         const encoder = new Encoder(buffer);
//         encoder.writeNil();
//         this.buffer = this.appendBuffer(buffer, this.buffer);
//         break;
//     } 
//     case (type_name == "null"): {
//         let sizer: Sizer = new Sizer();

//         sizer.writeNil();
//         this.byteLength = this.byteLength + sizer.length;
//         const buffer = new ArrayBuffer(sizer.length);

//         const encoder = new Encoder(buffer);
//         encoder.writeNil();
//         this.buffer = this.appendBuffer(buffer, this.buffer);
//         break;
//     } 
//     case (isBoolean<T>()): {
//         let sizer: Sizer = new Sizer();
//         let val = arg.get<bool>();
//         sizer.writeBool(val);
//         this.byteLength = this.byteLength + sizer.length;
//         const buffer = new ArrayBuffer(sizer.length);

//         const encoder = new Encoder(buffer);
//         encoder.writeBool(val);
//         this.buffer = this.appendBuffer(buffer, this.buffer);
//     }
    
//     case (type_name == "i8"): {
//         let sizer: Sizer = new Sizer();
//         let val = arg.get<i8>();
//         sizer.writeInt8(val);
//         this.byteLength = this.byteLength + sizer.length;
//         const buffer = new ArrayBuffer(sizer.length);

//         const encoder = new Encoder(buffer);
//         encoder.writeInt8(val);
//         this.buffer = this.appendBuffer(buffer, this.buffer);
//         break;
//     } 
//     case (type_name == "i16"): {
//         let sizer: Sizer = new Sizer();
//         let val = arg.get<i16>();
//         sizer.writeInt16(val);
//         this.byteLength = this.byteLength + sizer.length;
//         const buffer = new ArrayBuffer(sizer.length);

//         const encoder = new Encoder(buffer);
//         encoder.writeInt16(val);
//         this.buffer = this.appendBuffer(buffer, this.buffer);;
//         break;
//     } 
//     case (type_name == "i32"): {
//         let sizer: Sizer = new Sizer();
//         let val = arg.get<i32>();
//         sizer.writeInt32(val);
//         this.byteLength = this.byteLength + sizer.length;
//         const buffer = new ArrayBuffer(sizer.length);

//         const encoder = new Encoder(buffer);
//         encoder.writeInt32(val);
//         this.buffer = this.appendBuffer(buffer, this.buffer);
//         break;
//     } 
//     case (type_name == "i64"): {
//         let sizer: Sizer = new Sizer();
//         let val = arg.get<i64>();
//         sizer.writeInt64(val);
//         this.byteLength = this.byteLength + sizer.length;
//         const buffer = new ArrayBuffer(sizer.length);

//         const encoder = new Encoder(buffer);
//         encoder.writeInt64(val);
//         this.buffer = this.appendBuffer(buffer, this.buffer);
//         break;
//     } 
//     case (type_name == "u8"): {
//         let sizer: Sizer = new Sizer();
//         let val = arg.get<u8>();
//         sizer.writeUInt8(val);
//         this.byteLength = this.byteLength + sizer.length;
//         const buffer = new ArrayBuffer(sizer.length);

//         const encoder = new Encoder(buffer);
//         encoder.writeUInt8(val);
//         this.buffer = this.appendBuffer(buffer, this.buffer);
//         break;
//     } 
//     case (type_name == "u16"): {
//         let sizer: Sizer = new Sizer();
//         let val = arg.get<u16>();
//         sizer.writeUInt16(val);
//         this.byteLength = this.byteLength + sizer.length;
//         const buffer = new ArrayBuffer(sizer.length);

//         const encoder = new Encoder(buffer);
//         encoder.writeUInt16(val);
//         this.buffer = this.appendBuffer(buffer, this.buffer);
//         break;
//     } 
//     case (type_name == "u32"): {
//         let sizer: Sizer = new Sizer();
//         let val = arg.get<u32>();
//         sizer.writeUInt32(val);
//         this.byteLength = this.byteLength + sizer.length;
//         const buffer = new ArrayBuffer(sizer.length);

//         const encoder = new Encoder(buffer);
//         encoder.writeUInt32(val);
//         this.buffer = this.appendBuffer(buffer, this.buffer);
//         break;
//     } 
//     case (type_name == "u64"): {
//         let sizer: Sizer = new Sizer();
//         let val = arg.get<u64>();
//         sizer.writeUInt64(val);
//         this.byteLength = this.byteLength + sizer.length;
//         const buffer = new ArrayBuffer(sizer.length);

//         const encoder = new Encoder(buffer);
//         encoder.writeUInt64(val);
//         this.buffer = this.appendBuffer(buffer, this.buffer);
//         break;
//     } 
//     case (type_name == "f32"): {
//         let sizer: Sizer = new Sizer();
//         let val = arg.get<f32>();
//         sizer.writeFloat32(val);
//         this.byteLength = this.byteLength + sizer.length;
//         const buffer = new ArrayBuffer(sizer.length);

//         const encoder = new Encoder(buffer);
//         encoder.writeFloat32(val);
//         this.buffer = this.appendBuffer(buffer, this.buffer);
//         break;
//     } 
//     case (type_name == "f64"): {
//         let sizer: Sizer = new Sizer();
//         let val = arg.get<f64>();
//         sizer.writeFloat64(val);
//         this.byteLength = this.byteLength + sizer.length;
//         const buffer = new ArrayBuffer(sizer.length);

//         const encoder = new Encoder(buffer);
//         encoder.writeFloat64(val);
//         this.buffer = this.appendBuffer(buffer, this.buffer);
//         break;
//     } 
//     case (type_name == "String"): {
//         let sizer: Sizer = new Sizer();
//         let val = arg.get<string>();
//         sizer.writeString(val);
//         this.byteLength = this.byteLength + sizer.length;
//         const buffer = new ArrayBuffer(sizer.length);

//         const encoder = new Encoder(buffer);
//         encoder.writeString(val);
//         this.buffer = this.appendBuffer(buffer, this.buffer);;
//         break;
//     } 
//     case (type_name == "ArrayBuffer"): {
//         let sizer: Sizer = new Sizer();
//         let val = arg.get<ArrayBuffer>();
//         sizer.writeByteArray(val);
//         this.byteLength = this.byteLength + sizer.length;
//         const buffer = new ArrayBuffer(sizer.length);

//         const encoder = new Encoder(buffer);
//         encoder.writeByteArray(val);
//         this.buffer = this.appendBuffer(buffer, this.buffer);
//         break;
//     }
// }











// switch (true) {
//     case (isString<T>()): {
//         let sizer: Sizer = new Sizer();
//         sizer.writeString(changetype<string>(newvalue));
//         this.byteLength = this.byteLength + sizer.length;
//         const buffer = new ArrayBuffer(sizer.length);

//         const encoder = new Encoder(buffer);
//         encoder.writeString(changetype<string>(newvalue));
//         this.buffer = this.appendBuffer(buffer, this.buffer);
//         break;
//     } 
//     case (isNullable<T>()): {
//         let sizer: Sizer = new Sizer();
//         sizer.writeNil();
//         this.byteLength = this.byteLength + sizer.length;
//         const buffer = new ArrayBuffer(sizer.length);

//         const encoder = new Encoder(buffer);
//         encoder.writeNil();
//         this.buffer = this.appendBuffer(buffer, this.buffer);
//         break;
//     } 
//     case (type_name == "null"): {
//         let sizer: Sizer = new Sizer();
//         sizer.writeNil();
//         this.byteLength = this.byteLength + sizer.length;
//         const buffer = new ArrayBuffer(sizer.length);

//         const encoder = new Encoder(buffer);
//         encoder.writeNil();
//         this.buffer = this.appendBuffer(buffer, this.buffer);
//         break;
//     } 
//     case (isBoolean<T>()): {
//         let sizer: Sizer = new Sizer();
//         sizer.writeBool(changetype<bool>(newvalue));
//         this.byteLength = this.byteLength + sizer.length;
//         const buffer = new ArrayBuffer(sizer.length);

//         const encoder = new Encoder(buffer);
//         encoder.writeBool(changetype<bool>(newvalue));
//         this.buffer = this.appendBuffer(buffer, this.buffer);
//     }
    
//     case (type_name == "i8"): {
//         let sizer: Sizer = new Sizer();
//         sizer.writeInt8(changetype<i8>(newvalue));
//         this.byteLength = this.byteLength + sizer.length;
//         const buffer = new ArrayBuffer(sizer.length);

//         const encoder = new Encoder(buffer);
//         encoder.writeInt8(changetype<i8>(newvalue));
//         this.buffer = this.appendBuffer(buffer, this.buffer);
//         break;
//     } 
//     case (type_name == "i16"): {
//         let sizer: Sizer = new Sizer();
//         sizer.writeInt16(changetype<i16>(newvalue));
//         this.byteLength = this.byteLength + sizer.length;
//         const buffer = new ArrayBuffer(sizer.length);

//         const encoder = new Encoder(buffer);
//         encoder.writeInt16(changetype<i16>(newvalue));
//         this.buffer = this.appendBuffer(buffer, this.buffer);;
//         break;
//     } 
//     case (type_name == "i32"): {
//         let sizer: Sizer = new Sizer();
//         sizer.writeInt32(changetype<i32>(newvalue));
//         this.byteLength = this.byteLength + sizer.length;
//         const buffer = new ArrayBuffer(sizer.length);

//         const encoder = new Encoder(buffer);
//         encoder.writeInt32(changetype<i32>(newvalue));
//         this.buffer = this.appendBuffer(buffer, this.buffer);
//         break;
//     } 
//     case (type_name == "i64"): {
//         let sizer: Sizer = new Sizer();
//         sizer.writeInt64(changetype<i64>(newvalue));
//         this.byteLength = this.byteLength + sizer.length;
//         const buffer = new ArrayBuffer(sizer.length);

//         const encoder = new Encoder(buffer);
//         encoder.writeInt64(changetype<i64>(newvalue));
//         this.buffer = this.appendBuffer(buffer, this.buffer);
//         break;
//     } 
//     case (type_name == "u8"): {
//         let sizer: Sizer = new Sizer();
//         sizer.writeUInt8(changetype<u8>(newvalue));
//         this.byteLength = this.byteLength + sizer.length;
//         const buffer = new ArrayBuffer(sizer.length);

//         const encoder = new Encoder(buffer);
//         encoder.writeUInt8(changetype<u8>(newvalue));
//         this.buffer = this.appendBuffer(buffer, this.buffer);
//         break;
//     } 
//     case (type_name == "u16"): {
//         let sizer: Sizer = new Sizer();
//         sizer.writeUInt16(changetype<u16>(newvalue));
//         this.byteLength = this.byteLength + sizer.length;
//         const buffer = new ArrayBuffer(sizer.length);

//         const encoder = new Encoder(buffer);
//         encoder.writeUInt16(changetype<u16>(newvalue));
//         this.buffer = this.appendBuffer(buffer, this.buffer);
//         break;
//     } 
//     case (type_name == "u32"): {
//         let sizer: Sizer = new Sizer();
//         sizer.writeUInt32(changetype<u32>(newvalue));
//         this.byteLength = this.byteLength + sizer.length;
//         const buffer = new ArrayBuffer(sizer.length);

//         const encoder = new Encoder(buffer);
//         encoder.writeUInt32(changetype<u32>(newvalue));
//         this.buffer = this.appendBuffer(buffer, this.buffer);
//         break;
//     } 
//     case (type_name == "u64"): {
//         let sizer: Sizer = new Sizer();
//         sizer.writeUInt64(changetype<u64>(newvalue));
//         this.byteLength = this.byteLength + sizer.length;
//         const buffer = new ArrayBuffer(sizer.length);

//         const encoder = new Encoder(buffer);
//         encoder.writeUInt64(changetype<u64>(newvalue));
//         this.buffer = this.appendBuffer(buffer, this.buffer);
//         break;
//     } 
//     case (type_name == "f32"): {
//         let sizer: Sizer = new Sizer();
//         sizer.writeFloat32(changetype<f32>(newvalue));
//         this.byteLength = this.byteLength + sizer.length;
//         const buffer = new ArrayBuffer(sizer.length);

//         const encoder = new Encoder(buffer);
//         encoder.writeFloat32(changetype<f32>(newvalue));
//         this.buffer = this.appendBuffer(buffer, this.buffer);
//         break;
//     } 
//     case (type_name == "f64"): {
//         let sizer: Sizer = new Sizer();
//         sizer.writeFloat64(changetype<f64>(newvalue));
//         this.byteLength = this.byteLength + sizer.length;
//         const buffer = new ArrayBuffer(sizer.length);

//         const encoder = new Encoder(buffer);
//         encoder.writeFloat64(changetype<f64>(newvalue));
//         this.buffer = this.appendBuffer(buffer, this.buffer);
//         break;
//     } 
//     case (type_name == "String"): {
//         let sizer: Sizer = new Sizer();
//         sizer.writeString(changetype<string>(newvalue));
//         this.byteLength = this.byteLength + sizer.length;
//         const buffer = new ArrayBuffer(sizer.length);

//         const encoder = new Encoder(buffer);
//         encoder.writeString(changetype<string>(newvalue));
//         this.buffer = this.appendBuffer(buffer, this.buffer);;
//         break;
//     } 
//     case (type_name == "ArrayBuffer"): {
//         let sizer: Sizer = new Sizer();
//         sizer.writeByteArray(changetype<ArrayBuffer>(newvalue));
//         this.byteLength = this.byteLength + sizer.length;
//         const buffer = new ArrayBuffer(sizer.length);

//         const encoder = new Encoder(buffer);
//         encoder.writeByteArray(changetype<ArrayBuffer>(newvalue));
//         this.buffer = this.appendBuffer(buffer, this.buffer);
//         break;
//     }
// }