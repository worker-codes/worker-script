import {
  CODE_AMPERSAND,
  CODE_EQUALS,
  CODE_SPACE,
} from './const';
// import { IURLSearchParams } from './types';

export default class SearchParams {
  // public params: [string, string][];
  public params: Array<Array<string>> = []
  public isEncoded:bool = false;

  // constructor(init: string | null = null) {
  constructor(init: string | null = null) {
    this.params = [];
    if (init != null) {
      if (typeof init === 'string') {
        extractParams(
          init,
          init.at(0) === '?' ? 1 : 0,
          init.length,
          this,
          [CODE_AMPERSAND],
          CODE_EQUALS,
          [],
          true,
        );
      }
    }

    // else if (Array.isArray(init)) {
    //   init.forEach((kv) => {
    //     this.append(kv[0], kv[1]);
    //   });
    // // } else if (typeof init === 'object') {
    // //   Object.keys(init).forEach((key) => {
    // //     this.append(key, init[key]);
    // //   });
    // }
  }

  public entries(): Array<Array<string>>  {
    return this.params.map((param) => {
      let key = param[0];
      let value = param[1];
      return [
        optionalDecode(key),
        optionalDecode(value),
      ]
    });

    // for (let i = 0; i < this.params.length; i += 1) {
    //   yield [
    //     optionalDecode(this.params[i][0]),
    //     optionalDecode(this.params[i][1]),
    //   ];
    // }
  }

  public append(name: string, value: string): void {
    this.params.push([encodeParameter(name), encodeParameter(value)]);
  }

  public delete(name: string): void {
    //filter out the key/value pairs that match the name
    let value: string[][] =[]
    for (let i = 0; i < this.params.length; i++) {
      const param = this.params[i];
      let key = param[0];
      if (optionalDecode(key) != name) {
        // console.log("delete: " + i.toString());
        value.push(param);
        
        // this.params.splice(i, 1);
      }
    }
    this.params = value;

/*     this.params = this.params.filter(
      (param): bool => {
        let key = param[0]; 
        return optionalDecode(key) !== name
      },
    ); */
  }

  public forEach(
    callback: (value: string, name: string, searchParams: this) => void,
  ): void {
    this.params.forEach((param) => {
      let key = param[0];
      let value = param[1];
      callback(optionalDecode(value), optionalDecode(key), this);
    });
  }

  public get(name: string): string | null {
    // const entryIndex = this.params.findIndex((param): bool => {
    //   let key = param[0];
    //   return optionalDecode(key) === name
    // });
    let entryIndex = -1;
    for (let i = 0; i < this.params.length; i++) {
      const param = this.params[i];
      let key = param[0];
      if (optionalDecode(key) === name) {
        entryIndex = i;
        break;
      }
    }
    if (entryIndex === -1) {
      return null;
    }

    const entry = this.params[entryIndex];
    if (entry) {
      return optionalDecode(entry[1]);
    }
    return null;
  }

  public getAll(name: string): string[] {
    let value: string[] =[]
    for (let i = 0; i < this.params.length; i++) {
      const param = this.params[i];
      
      let key = param[0];
      if (optionalDecode(key) === name) {
        value.push(param[1]);
      }
      
    }

    return value;
    // return this.params
    //   .filter((param): bool => {
    //     let key = param[0];
    //     return optionalDecode(key) === name
    //   })
    //   .map(kv => kv[1]);
  }

  public has(name: string): boolean {
    return this.get(name) !== null;
  }

  public keys(): Array<string> {
    return this.params.map((param): string => {
      let key = param[0];
      return optionalDecode(key)
    });
    // for (let i = 0; i < this.params.length; i += 1) {
    //   yield optionalDecode(this.params[i][0]);
    // }
  }

  /**
   * The set() method of the URLSearchParams interface sets the value associated with a given
   * search parameter to the given value. If there were several matching values, this method
   * deletes the others. If the search parameter doesn't exist, this method creates it.
   * @param name
   * @param value
   */
  public set(name: string, value: string): void {
    // const firstIndex = this.params.findIndex(
    //   (param) => {
    //     let k = param[0];
    //     return optionalDecode(k) === name
    //   }
    // );
    let firstIndex = -1;
    for (let i = 0; i < this.params.length; i++) {
      const param = this.params[i];
      let key = param[0];
      if (optionalDecode(key) === name) {
        firstIndex = i;
        break;
      }
    }

    if (firstIndex === -1) {
      this.append(name, value);
      return;
    }
    this.delete(name);
    // this.params.splice(firstIndex, 0);
    this.params.push([encodeParameter(name), encodeParameter(value)]);
  }

  public sort(): void {
    this.params = this.params.sort((a, b) => a[0].localeCompare(b[0]));
  }

  public toString(): string {
    return this.params.map((param:string[]): string => {
      let k = param[0];
      let v = param[1];
      return `${k}=${v}`
    }).join('&');
  }

  public values(): Array<string> {
    let values: string[] = [];
    for (let i = 0; i < this.params.length; i += 1) {
      let val = optionalDecode(this.params[i][1]);
      values.push(val);
    }
    return values;
  }

  // public [Symbol.iterator](): Array<Array<string>>  {
  //   return this.entries();
  // }
}

export function extractParams(
  urlString: string,
  start: i32,
  end: i32,
  params: SearchParams,
  separators: i32[],
  equals: i32,
  breakCodes: i32[],
  encode:bool = false,
):i32 {
  let index:i32 = start;
  let keyStart:i32 = index;
  let keyEnd:i32 = 0;
  let valStart: i32 = 0;
  

  // const appendParams = encode
  //   ? params.append.bind(params)
  //   : (n: string, v: string) => params.params.push([n, v]);




  for (; index <= end; index += 1) {
    const code = urlString.charCodeAt(index);
    if (code === equals && keyEnd === 0) {
      keyEnd = index;
      valStart = index + 1;
    } else if (separators.indexOf(code) !== -1) {
      // don't add if key and value are empty
      if (index > keyStart) {
        // push directly to the params array to skip encoding step
        if (encode) {
          params.append(
            urlString.slice(keyStart, keyEnd || index),
            urlString.slice(valStart || index, index),
          );
        } else {
          params.params.push([
            urlString.slice(keyStart, keyEnd || index),
            urlString.slice(valStart || index, index),
          ]);
        }
        
      }

      keyStart = index + 1;
      keyEnd = 0;
      valStart = 0;
    } else if (breakCodes.indexOf(code) !== -1) {
      break;
    }
  }
  // push last key-value
  if (index !== keyStart) {
    if (encode) {
      params.append(
        urlString.slice(keyStart, keyEnd || index),
        urlString.slice(valStart || index, index),
      );
    } else {
      params.params.push([
        urlString.slice(keyStart, keyEnd || index),
        urlString.slice(valStart || index, index),
      ]);
    }
  }
  return index;
}

// function decodeURIComponentSafe(s: string): string {
//   try {
//     return decodeURIComponent(s.replace(/\+/g, ' '));
//   } catch (e) {
//     return s;
//   }
// }

function optionalDecode(s: string): string {
  if (s.indexOf('%') !== -1) {
    // return decodeURIComponentSafe(s);
    return decodeURIComponent(s);
  } else {
    return s;
  }
}

function encodeParameter(_s: string): string {
  const s = '' + _s;
  let encoded = '';
  for (let i = 0; i < s.length; i++) {
    if (s.charCodeAt(i) === CODE_SPACE) {
      encoded += '+';
    } else {
      encoded += encodeURIComponent(s.at(i));
    }
  }
  return encoded;
}
