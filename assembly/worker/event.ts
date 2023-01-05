import { Request, RequestInit, Headers, Response } from "../http";
import { __guest_response, __guest_request } from "./wapc";
// import { stringify, parse } from '@serial-as/json/assembly'


var event_functions = new Map<string, EventFunction>();

export type EventFunction = (event: FetchEvent) => void
export type FetchEventFunction = (err: Error | null, res: Response) => void
export class FetchEventInit {
  request: Request
}

export class FetchEvent {
  public event_type: string = "fetch"
  public request: Request

  constructor(event_type: string, options: FetchEventInit) {
      this.event_type = event_type;
      this.request = options.request;
  }

  respondWith(response: Response): void {
    
      // const data: ResponseArgs = {
  //     status: response.status,
  //     headers: response.headers.entries(),
  //     statusText: response.statusText
  // }

  // const stringified = stringify<ResponseArgs>(data);
  // let args = String.UTF8.encode(stringified);
  // let body_len = uIntToBytes(response.body.byteLength);
  // let buf = appendBuffer(body_len ,response.body, args)

  // const responseOK = response.body;
  // __guest_response(changetype<i32>(responseOK), responseOK.byteLength)
    
    let responseOK = response.arrayBuffer();
    if (responseOK == null) {
      responseOK = new ArrayBuffer(0);
    }
    
      __guest_response(changetype<i32>(responseOK), responseOK.byteLength)
  }
}
@global
export function addEventListener(event_type: string, fn: EventFunction): void {
  event_functions.set(event_type, fn)
}

function getEventListener(name: string): EventFunction {
  // if (!event_functions.has(name)) {
  //   return errorEventListener
  // }
  return event_functions.get(name)
}

// function errorEventListener(payload: ArrayBuffer): Result<ArrayBuffer> {
//   return Result.error<ArrayBuffer>(new Error("error"));
// }

@serializable
class RequestArgs {
    method: string;
    headers: string[][];
    url: string;
}

@serializable
class ResponseArgs {
    status: i32;
    headers: string[][];
    statusText: string;
}

function appendBuffer( buffer1: ArrayBuffer, buffer2: ArrayBuffer, buffer3: ArrayBuffer ) : ArrayBuffer {
    var tmp = new Uint8Array( buffer1.byteLength + buffer2.byteLength+ buffer3.byteLength );
    tmp.set( Uint8Array.wrap( buffer1 ), 0 );
    tmp.set( Uint8Array.wrap( buffer2 ), buffer1.byteLength );
    tmp.set( Uint8Array.wrap( buffer3 ), buffer2.byteLength );
    return tmp.buffer;
}
  
const uIntToBytes = (num:i32): ArrayBuffer => {
    const arr = new ArrayBuffer(4)
    const view = new DataView(arr)
    view.setInt32(0, num)
    return arr
}

@global
export function handleEvent(event_size: usize, payload_size: usize): bool {
  const eventBuf = new ArrayBuffer(changetype<i32>(event_size))
  const payload = new ArrayBuffer(changetype<i32>(payload_size))
  __guest_request(changetype<i32>(eventBuf), changetype<i32>(payload));

  const event = String.UTF8.decode(eventBuf)

  if (event == "fetch") {
    handleFetchEvent(payload) 
  }

  return true

  function newFunction() {

  }
}

function handleFetchEvent(payload: ArrayBuffer):void {
  const fn = getEventListener("fetch");

  let body_length_slice = payload.slice(0, 4);
  let dv = new DataView(body_length_slice, 0);
  let body_length = dv.getUint32(0);

  let body_position = body_length + 4;
  let body = payload.slice(4, body_position);
  let head = payload.slice(body_position, payload.byteLength);
  let text = String.UTF8.decode(head);

//   const request_arg = parse<RequestArgs>(text);

//   let headers = new Headers();
//   let r_header = request_arg.headers;
//   for (var i = 0; i < r_header.length; i++) {
//     let key = r_header[i][0];
//     let value = r_header[i];
//     headers.set(key, value);
//   }

//   let option: RequestInit = {
//     method: request_arg.method,
//     headers: headers,
//     body: body,
//   };
//   let request = new Request(request_arg.url, option);



    // const request_arg = parse<RequestArgs>(text);

    let headers = new Headers();
    // let r_header = request_arg.headers;
    // for (var i = 0; i < r_header.length; i++) {
    // let key = r_header[i][0];
    // let value = r_header[i];
    // headers.set(key, value);
    // }

    let option: RequestInit = {
    method: GET,
    headers: headers,
    body: body,
    };
    let request = new Request("google.com", option);

  let init: FetchEventInit = {
    request: request
  };
  // let response: Response = new Response(new ArrayBuffer(0), { status: 200, statusText:"OK", headers:new Headers() });
  let fetchevent: FetchEvent = new FetchEvent("fetch", init);

  fn(fetchevent);
}

