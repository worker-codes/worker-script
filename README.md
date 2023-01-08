# Worker Cloud Platform

Worker Cloud is an open-source platform that provides a set of APIs and tools for building and deploying web and mobile applications. It aims to make it easier for developers to create and manage the backend infrastructure for their applications, such as databases, user management, storage, and more.

Worker Cloud includes a range of features, including:

* A set of APIs for building web and mobile applications
* A user management system for authentication and authorization
* A database for storing and querying data
* A file storage system for storing and serving files
* A serverless function platform for running custom logic
* A hosting platform for deploying and hosting applications

Worker Code is built on top of modern technologies such as Docker, Kubernetes, and WebAssembly (WASM) and can be run on-premises or in the cloud. It is designed to be easy to use and to allow developers to focus on building their applications rather than worrying about the underlying infrastructure.

## WorkerScript

AssemblyScript is a programming language that is designed to be a subset of TypeScript, a popular superset of JavaScript. It is used to write code that is compiled to WebAssembly (WASM), which can be run in modern web browsers or on the server. AssemblyScript is often used for writing high-performance code that needs to run in a web browser or on the server, such as games, audio and video processing, and data visualization. AssemblyScript code can be transpiled to WASM using the AssemblyScript compiler, which is written in TypeScript and can be run on the command line or as part of a build process.

The runtime is based on Wasm, with a proxy-appropriate set of Wasm libraries. There are built in APIs for file access, database, low level caching, and HTTP requests/responses. When possible, we use WhatWG standards (like `fetch`, `Request`, `Response`, `Cache` `Url`, `ReadableStream`, `Crypto`, `BroadcastChannel`, `File`).

You can [use it locally](#hello-world) for development and testing, and [deploy it to Worker's fleet](#deployment) of edge servers for production use.


# Getting Started

## Installation

The Worker CLI is built on Node.js

Install globally:

```bash
# install in your project
npm install -g @workercodes/cli

# confirm that the installation was successful
wkr --version

# authenticate the CLI
wkr config

# create a new project
wkr generate my-worker && cd my-worker

# deploy project
wkr publish

```

## Usage

### Hello World!

Write Assemblyscript code to a file (`assemblyscript/index.ts`):

```ts
addEventListener("fetch", event => {
    event.respondWith(
        handleRequest(event.request)
    );
});

async function handleRequest(request) {
    return new Response("Hello world");
}
```

Start the worker server:

```bash
# start your app:
wkr dev

# visit your app:
open http://localhost:3000
```



### How does it work?

Simply put:

- Uses a basic webpack configuration to bundle your javascript
- Assumes the presence of  `index.ts`
- You can customize everything by creating a `webpack.wkr.config.ts` which will be loaded for you
- Use npm packages compatible with the v8 javascript engine, you don't have access to node.ts-specific concepts or packages.

### Configuration

By default, wkr will read your `.wkr.toml` file in your current working directory.

```toml
# .wkr.toml
[package]
name = "wasmtest"
version = "0.1.0"
env = {
    foo:bar
}
files = [
    "path/to/file"
]

```

Properties:

- `name` - the worker.codes app name, can be ommitted, useful for deployment purposes
- `version` - the worker.codes app version, can be ommitted, useful for deployment purposes
- `env` - settings for your applications, accessible in your code via the global variable `app.env`
- `files` - array of files, relative to your `.wkr.toml` to include in the deployment. Can be accessed via `fetch("file://path/to/file")`

### Secrets

You can require secrets in your app.env like this:

```toml
# .wkr.toml
[package]
name = "wasmtest"
version = "0.1.0"
env = {
    fromSecret = "secretKey"
}
```

In your code, you can seamlessly use this value like:

```ts
app.env.secretThing
```

When deployed on worker.codes, secrets are fetched from an encrypted store. You need to pre-define your secrets via `wkr secrets:set <key> <value>`.

Locally, you need to define them in a `.wkr.secrets.toml` file, make sure you add it to your `.gitignore` as it can contain sensitive data. Example file.

```toml
# .wkr.secrets.toml
secretKey = <your secret value>
```

## Testing

Woker Codes comes with a default testing framework.

You can write unit tests and use `wkr test` to run them within the worker runtime environment:

```ts
// ./test/index.spec.ts
describe("http_fetch", () => {
    test("get_request", () => {
        let rq: Request = new Request("https://httpbin.org/ip", {
            method: null,
            headers: null,
            body:null,
          });
        
          let result = fetch(rq);
        let status = result.status;
        assert( status == 200, "result.status is not 200");
    });
});

```

## Deployment

You can deploy to [worker.codes](https://worker.codes).

### 1. Login

Use `wkr login` to log into your worker.codes account, create one at [worker.codes](https://worker.codes).

### 2. Create an app

Make sure you've created your wkr app for your account with `wkr apps:create [name]`

Set your `app` property in your `.wkr.toml`

### 3. Deploy!

Using `wkr deploy`, here's what happens:
- Your code is bundled via assemblyscript
- Your code, source map and `files` are added to a simple tarball, gzipped and uploaded to the worker.codes API using your token
- We create a "release" for your app, those are immutable, changing anything (by using `wkr deploy` or `wkr secrets:set`) will trigger a new release which will be deployed automatically

## Logs

Tail production logs with:

```bash
wkr logs
```

## Help Full Links

- [Home](https://worker.codes/)
- [Console](https://console.worker.codes/)
- [Getting Started](https://docs.worker.codes/getting-started.htm)
- [Documentation](https://docs.worker.codes)
- [Runtime API](https://docs.worker.codes/runtime/)
- [Examples](https://github.com/worker-codes/wkr-example/)
- [Repositories](https://github.com/worker-codes/)

## Open source

Worker Cloud in an open source company. We're [Apache licensed](https://github.com/worker-codes/workerscript/blob/main/LICENSE) and designed to run easily in local dev. You can deploy our core software to production.