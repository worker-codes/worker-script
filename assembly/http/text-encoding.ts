
export class TextEncoder {
  constructor() {

  }
  public encode(input: string): Uint8Array {
    let endcoded = String.UTF8.encode(input);

    var uint8View = Uint8Array.wrap(endcoded)
    return uint8View;
  }
}

export class TextDecoder {
  public utfLabel: string
  constructor(utfLabel: string) {
    this.utfLabel = utfLabel
  }
  public decode<T>(input:T): string {
    if (input instanceof Uint8Array) {
      return String.UTF8.decode(input.buffer);
    } else if (input instanceof ArrayBuffer) {      
      return String.UTF8.decode(input);      
    }    
    
    throw new Error("dasdasdfas");    
  }
}
