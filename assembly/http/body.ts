import { TextDecoder, TextEncoder } from "./text-encoding";
import { JSON } from "assemblyscript-json/assembly";
import FormData from "./form_data";
import { URLSearchParams } from "../url";
import Blob from "./blob";

export class Body {
  protected bodySource: ArrayBuffer | null;
  protected isbodyUsed: boolean;

  constructor(body: ArrayBuffer | null) {
    this.bodySource = body
    this.isbodyUsed = false;
  }

  get bodyUsed(): boolean {
    return this.isbodyUsed
  }
  public blob(): Blob {
    this.consumeBody();

    if (this.bodySource == null) {
      return new Blob()
    }
    return new Blob([this.bodySource], null)
  }

  public formData(): FormData {
    this.consumeBody();
    if (this.bodySource instanceof FormData) {
      return this.bodySource
    }

    const raw = this.text()

    const query = new URLSearchParams(raw)
    const formdata = new FormData()

    let entries = formdata.entries();
    for (var i = 0; i < entries.length; i++) {
      const key = entries[i][0]
      const value = entries[i][1]
      if (Array.isArray(value)) {
        for (var v = 0; v < value.length; v++) {
          formdata.append(key[0], value[v])
        }
      } else {
        formdata.append(key[0], value[0])
      }
    }
    return formdata
  }

  public text(): string {
    this.consumeBody();

    if (this.bodySource == null) {
      return "";
    }

    const arr = this.bodySource;
    return new TextDecoder("utf-8").decode(arr)
  }

  public json(): JSON.Obj {
    this.consumeBody()
    const arr = this.bodySource;
    const raw = new TextDecoder("utf-8").decode(arr)
    return <JSON.Obj>(JSON.parse(raw))
  }


  public arrayBuffer(): ArrayBuffer | null {
    this.consumeBody()
    return this.bodySource
  }

  protected consumeBody(): void {
    if (this.isbodyUsed) {
      throw new Error("Body already used");
    }
    this.isbodyUsed = true;
  }
}

