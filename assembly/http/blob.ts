/**
 * @module fly
 * @private
 */

import { TextEncoder } from "./text-encoding";

//  type EndingType = "native" | "transparent";
class BlobPropertyBag {
  endings: string | null = null;
  type: string | null = null;
}

/** @hidden */
// export type BlobPart = BufferSource | string | Blob

/** @hidden */
export default class Blob {
  // public readonly size: number
  public readonly type: string

  // protected bytes: Uint8Array
  protected parts: Uint8Array[] = []

  constructor(blobParts: ArrayBuffer[] | null = null, options: BlobPropertyBag | null = null) {
    if (!blobParts || blobParts.length === 0) {
      this.parts.push(new Uint8Array(0));
    } else {
      for (var i = 0; i < blobParts.length; i++) {
        let part = blobParts[i]
        this.parts.push(Uint8Array.wrap(part as ArrayBuffer))
      }
    }

    if (options && options.type) {
      this.type = options.type.toLowerCase()
    } else {
      this.type = ""
    }
  }
  
  protected get bytes() : Uint8Array {
    if (this.parts.length === 1) {
      return this.parts[0]
    } else {
      return concatenate(this.parts)
    }
  }

  public get size() : number {
    return this.bytes.byteLength
  }
  
  public add<T>(part: T): void {

    if (part instanceof Uint8Array) {
      this.parts.push(part as Uint8Array);
    } else if (part instanceof ArrayBuffer) {
      this.parts.push(Uint8Array.wrap(part as ArrayBuffer));
    } else if (part instanceof String) {
      const encoder = new TextEncoder();
      this.parts.push(encoder.encode(part as string));
    } else if (part instanceof Blob) {
      this.parts.push((part as Blob).bytes);
    } else if (
      part instanceof Int8Array ||
      part instanceof Uint8ClampedArray ||
      part instanceof Int16Array ||
      part instanceof Int32Array ||
      part instanceof Uint32Array ||
      part instanceof Float32Array ||
      part instanceof Float64Array ||
      part instanceof DataView
    ) {      
      this.parts.push(Uint8Array.wrap((part as ArrayBufferView).buffer));
    } 

  }
  public slice(start: number | null, end: number | null, contentType: string | null): Blob {
    return new Blob([this.bytes.slice(start, end)], { type: contentType, endings: null })
  }
  public arrayBuffer():ArrayBuffer {
    let array = this.bytes;
    return array.buffer.slice(array.byteOffset, array.byteLength + array.byteOffset);
  }
  public text():string {
    return String.UTF8.decode(this.arrayBuffer());
  }
  // public stream():string { }
}

/** @hidden */
function concatenate(arrays: Uint8Array[]): Uint8Array {
  let totalLength = 0

  for (var i = 0; i < arrays.length; i++) {
    totalLength += arrays[i].length
  }
  const result = new Uint8Array(totalLength)
  let offset = 0
  for (var i = 0; i < arrays.length; i++) {
    result.set(arrays[i], offset)
    offset += arrays[i].length
  }
  return result
}
