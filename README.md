# Worker Script

## Getting Started

Instructions for use:

First, install `assemblyscript`, and `workerscript`.

```sh
npm install --save-dev assemblyscript workerscript
```

Then, install [workerscript](https://github.com/worker-codes/workerscript).

Next, modify your asconfig to extend workerscript,

```json
{
  "extends": "workerscript/asconfig.json"
}
```

Import the `workerscript` library. This library will provide a couple of globals including implementations for `abort`, `trace`, `__finalize`, and a few other functions.

```ts
// assembly/index.ts
import * as workerscript from "workerscript";
```

Finally, export a `_start()` function from the entry file, so that the main thread knows what function to execute when workerscript starts up.

> Note: any code that does not reside in the _start() method will execute every time a new `Process` is created.
## Errors

Incoming HTTP requests are "fetch" events, it contains the request and how the receiver will treat the response. It provides the event.respondWith() method, which allows us to provide a response to the client.
Use the addEventListener method to register a "fetch" event. Also network requests are assign to the "fetch" event, using the FetchEvent.
Respond to incoming HTTP request, by use any of the following methods to augment or control how the request is handled.

Intercepts the request and allows the Worker to send a custom response back to the client.

```ts
addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest() {
  return new Response(JSON.stringify({ hello: "world" }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}

```