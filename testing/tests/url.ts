import {
  Response,
  Headers,
  FetchEvent,
  URL,
  Status,
  fetch,
  Request,
  crypto
} from "@wkr/assemblyscript/assembly";

addEventListener("fetch", (event: FetchEvent) => {
  
  console.log("________________________________________");
  let result = crypto.randomUUID();
  console.log(result);

  let body = String.UTF8.encode("Hello from addEventListener");
  let response: Response = new Response(body, {
    status: 200,
    statusText: "OK",
    headers: new Headers(),
    url:""
  });
  event.respondWith(response);
  
})