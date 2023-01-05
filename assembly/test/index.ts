// import { Maybe } from "as-lunatic/assembly/index";
// import { __envyLogs, __envyTestNodes, __envyTodos } from "./setup";
// import { completeTestNodeMaybe, TestNodeResult } from "./TestNode";
// import { wasi_Date } from "@assemblyscript/wasi-shim/assembly/wasi_date";

// export function start(): void {
//   // the entry of every test application is simple

//   // create a list of maybes to resolve
//   let maybes = new Array<Maybe<TestNodeResult, TestNodeResult>>();
  
//   // start the timer
//   let start = wasi_Date.now();

//   // for every test node that needs to be resolved, resolve it
//   for (let i = 0; i < __envyTestNodes.length; i++) {
//     let node = __envyTestNodes[i];
//     maybes.push(completeTestNodeMaybe(node));
//   }
  
//   // end the timer
//   let end = wasi_Date.now();

//   let result = new TestNodeResult("root", start, end, true, __envyLogs, __envyTodos, null);
//   result.collect(maybes);
  
// }

import { fd_write } from "@assemblyscript/wasi-shim/assembly/bindings/wasi_snapshot_preview1";

export function _startTests(): void {
  root.evaluate(new TestNodeReporterContext());
}

class TestNodeReporterContext {
  indent: i32 = 0;
}

function write(str: string): void {
  let buff = String.UTF8.encode(str);
  let iov = memory.data(16);
  store<u32>(iov, changetype<usize>(buff), 0);
  store<u32>(iov, <u32>buff.byteLength, sizeof<usize>());
  let written_ptr = memory.data(8);
  fd_write(1, iov, 1, written_ptr);
}

class TestNode {
  group: bool = false;
  children: TestNode[] = [];
  success: bool = false;
  constructor(
    public name: string,
    public callback: () => void,
  ) {}

  evaluate(ctx: TestNodeReporterContext): void {
    if (this != root) {
      ctx.indent += 2;
      if (this.group) write("\x1b[36m"+ " ".repeat(ctx.indent) + "Group: " + this.name + "\x1b[0m\n");
      else write(" ".repeat(ctx.indent) + "Test: " + this.name + "\n");
    }

    let parent = current;
    current = this;
    this.callback();

    // once the test is run, children are determined, evaluate them
    let children = this.children;
    let childrenLength = children.length;
    for (let i = 0; i < childrenLength; i++) {
      let child = unchecked(children[i]);
      child.evaluate(ctx);
    }

    current = parent;
    if (this != root) {
      ctx.indent -= 2;
    }
  }
}

let root: TestNode = new TestNode("Root", () => {});
let current: TestNode = root;

@global
function test(name: string, callback: () => void): void {
  let t = new TestNode(name, callback);
  current.children.push(t);
}

@global
function describe(name: string, callback: () => void): void {
  let t = new TestNode(name, callback);
  t.group = true;
  current.children.push(t);
}