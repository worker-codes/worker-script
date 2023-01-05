/**
 * @module fly
 * @private
 */
// import { stringify } from "querystring"
import { URLSearchParams } from "../url/url_search_params"

/**
 * Class representing a fetch response.
 * @hidden
 */
export default class FormData {
  private _data: Map<string, string[]>

  constructor() {
    this._data = new Map<string, string[]>()
  }

  public append(name: string, value: string):void {
    let vals: string[]
    const currentVals = this._data.get(name)
    if (currentVals === undefined) {
      vals = [value]
    } else {
      vals = currentVals.concat([value])
    }
    this._data.set(name, vals)
  }

  public delete(name: string):void {
    this._data.delete(name)
  }

  public entries(): Array<Array<string[]>>{

    let output: Array<Array<string[]>> = []
    let keys = this._data.keys();
    for (var i = 0; i < keys.length; i++) {

      let values = this._data.get(keys[i]);

      output.push([[keys[i]], values])
    }

    return output;

  }

  public get(name: string): string | null {
    const vals = this._data.get(name)
    if (vals === undefined) {
      return null
    }
    return vals[0]
  }

  public getAll(name: string): string[] {
    const vals = this._data.get(name)
    if (vals === undefined) {
      return []
    }
    return vals
  }

  public has(name: string): boolean {
    return changetype<boolean>(this._data.has(name))
  }

  public keys(): string[] {
    return this._data.keys()
  }

  public set(name: string, value: string):void {
    this._data.set(name, [value])
  }

  public values(): Array<string> {
    let values = this._data.values();

    let output: string[] = []
    for (var i = 0; i < values.length; i++) {
      output.push(values.join(", "));
    }

    return output;
  }

  public toString(): string {
    
    let output2 = new URLSearchParams("");
    let keys = this._data.keys();
    for (var i = 0; i < keys.length; i++) {

      let values = this._data.get(keys[i]);

       for (var v = 0; v < values.length; v++) {
        this.append(keys[i], values[v])
      }

    }
    return output2.toString()
  }
}
