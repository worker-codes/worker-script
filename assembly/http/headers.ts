import { Decoder, Writer, Encoder, Sizer } from "@wapc/as-msgpack";

export class Headers {
  public headerMap: Map<string, string[]> = new Map<string, string[]>()

  constructor(header: Headers | null = null) {

    if (header instanceof Headers) {
      this.headerMap = header.headerMap;
    }
  }

  /**
   * Adds a header. Does not overwrite existing headers with same name
   * @param {String} name
   * @param {String} value
   */
  public append(name: string, value: string[]): void {
    name = name.toLowerCase()
    if (this.headerMap.has(name)) {
      for (var i = 0; i < value.length; i++) {
        this.headerMap.get(name).push(value[i])
      }
    } else {
      this.set(name, value)
    }
  }

  /**
   * Deletes header(s) by name
   * @param {String} name
   */
  public delete(name: string): void {
    name = name.toLowerCase()
    this.headerMap.delete(name)
  }

  /**
   * Gets first header by name
   * @param {String} name
   * @returns {String?}
   */
  public get(name: string): string | null {
    name = name.toLowerCase()
    const values = this.headerMap.get(name)
    if (!values || values.length === 0) {
      return null
    }

    return this.headerMap.get(name).join(", ")
  }

  public getAll(name: string): string[] {
    return this.headerMap.get(name.toLowerCase()) || []
  }

  /**
   * Checks for existence of header by name
   * @param {String} name
   * @returns {boolean}
   */
  public has(name: string): boolean {
    if (this.headerMap.has(name) && this.headerMap.get(name).length > 0) {
      return true
    }
    return false
  }

  /**
   * Sets a header by name. Overwrites existing headers with same name
   * @param {String} name
   * @param {String} value
   */
  public set(name: string, value: string[]): void {
    name = name.toLowerCase()
    this.headerMap.set(name, value) 
  }

  /**
   * @returns {Object<string,string[]>}
   */
  // public toJSON(): { [key: string]: string[] } {
  //   const payload = {}
  //   for (const [name, value] of [...this.headerMap]) {
  //     if (name === "host") {
  //       payload[name] = value[0]
  //     } else {
  //       payload[name] = value
  //     }
  //   }
  //   return payload
  // }

  public forEach(callbackfn: (value: string, key: string, parent: Headers | null ) => void, thisArg: Headers): void {
    this.entries().forEach((value, index, array) => {
      let key = array[index][0];

      callbackfn(value.join(", "), key, this)
    })
  }

  public keys(): string[] {
    let keys = this.headerMap.keys();

    return keys;
  }

  public values(): string[] {
    let values = this.headerMap.values();

    let output: string[] = []
    for (var i = 0; i < values.length; i++) {
      output.push(values.join(", "));
    }

    return output;
  }

  public entries(): string[][] {

    let output: string[][] = []
    let keys = this.headerMap.keys();
    for (var i = 0; i < keys.length; i++) {

      let values = this.headerMap.get(keys[i]);

      output.push([keys[i], values.join(", ")])
    }

    return output;
  }

  encode(writer: Writer): void {

    writer.writeMapSize(2);
    writer.writeString("header");
    writer.writeMap(
      this.headerMap,
      (writer: Writer, key: string): void => {
        writer.writeString(key);
      },
      (writer: Writer, value: Array<string>) => {
        writer.writeArray(value, (writer: Writer, item: string) => {
          writer.writeString(item);
        });
      }
    );
      
  }
  decode(reader: Decoder): void {
      var numFields = reader.readMapSize();

      while (numFields > 0) {
          numFields--;
          const field = reader.readString();
          if (field == "map") {
            this.headerMap = reader.readMap(
              (decoder: Decoder): string => {
                return decoder.readString();
              },
              (decoder: Decoder): Array<string> => {
                return decoder.readArray((decoder: Decoder): string => {
                  return decoder.readString();
                });
              }
            );
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

