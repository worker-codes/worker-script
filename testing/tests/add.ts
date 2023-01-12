// export add function
import {
    Response,
    Headers,
    // FetchEvent,
    URL,
    Status,
    fetch,
    Request,
    connect,
    Config,
    FileSystem,
    Args,
    ExecutedQuery,
    Transaction,
    // crypto
} from "/home/dallen/WorkerCodes/WASM/worker-script/assembly/index";
import { hostCall, handleAbort, handleCall, register, Result } from "/home/dallen/WorkerCodes/WASM/worker-script/assembly/worker/wapc";
import { _startTests } from "/home/dallen/WorkerCodes/WASM/worker-script/assembly/test";
import { Value } from "/home/dallen/WorkerCodes/WASM/worker-script/assembly/database/value";
// import { FileSystem } from "as-wasi/assembly";
// export function add(a: i32, b: i32): i32 {
//     return a + b;
// }


// export function __guest_call(operation_size: usize, payload_size: usize): bool { 
//     return handleEvent(operation_size, payload_size);
// }



// describe("URL", () => {
//     test("hostname", () => {
//         let url = new URL("https://github.com/denoland/deno/blob/v0.2.10/js/url.ts");
//         console.log(url.host);
//         assert(url.host == "github.com", "url.host is not github.com");
//     });
// });

// describe("http_fetch", () => {
//     test("get_request", () => {
//         let rq: Request = new Request("https://httpbin.org/ip", {
//             method: null,
//             headers: null,
//             body:null,
//           });
        
//           let result = fetch(rq);
//         console.log(result.text());
//         let status = result.status;
//         assert( status == 200, "result.status is not 200");
//     });
// });

// describe("database", () => {
//     test("connect_to_database", () => {
//         let config: Config = {
//             url: "test",
//             // username: "localhost",
//             // password: "5432",
//             // host: "5432",
//             // port: 5432,
//         };

//         let result = connect(config)

//     });

//     test("query_database", () => {
//         let config: Config = {
//             url: "test",
//             // username: "localhost",
//             // password: "5432",
//             // host: "5432",
//             // port: "5432",
//         };

//         let result = connect(config)
//         if (result.isOk) {
//             let connection = result.get();

//             let args = new Args();
//             args.add(10);
//             // args.add("test");
//             // args.add(true);
//             // args.addInt32(22);
//             // args.add(3.88);
//             // args.addNull();
//             // args.add<null>(null);
//             // args.add("test").add("test2").add(1).add(true).add(1.55);
//             console.log(args.length.toString());
//             console.log(args.toBuffer().byteLength.toString());

//             // args.decode();
//             // return;
            
//             // let rows = connection.query("SELECT 1");
//             // let result_ = connection.query("SELECT * FROM Track LIMIT ?;", args);
//             // console.log("|||||||||||||||||||||||||||||||||||||||||||||||||||");
//             // type Row = Map<string, Value>
//             // let type_name = nameof<Map<string, Value>>();
//             // console.log(type_name);

// /*            
//             CREATE TABLE coffees (
//                 id INTEGER PRIMARY KEY,
//                 coffee_name TEXT NOT NULL,
//                 price REAL NOT NULL
//             );
//             INSERT INTO coffees VALUES (null, 'Colombian', 7.99);
//             INSERT INTO coffees VALUES (null, 'French_Roast', 8.99);
//             INSERT INTO coffees VALUES (null, 'Espresso', 9.99);
//             INSERT INTO coffees VALUES (null, 'Colombian_Decaf', 8.99);
//             INSERT INTO coffees VALUES (null, 'French_Roast_Decaf', 9.99);
//  */
//             let result_ = connection.transaction((tx:Transaction): Result<ExecutedQuery> => {
                
//                 let args = new Args();
//                 args.add(10);
//                 // let result_ = tx.execute(`
//                 // CREATE TABLE coffees2 (
//                 //     id INTEGER PRIMARY KEY,
//                 //     coffee_name TEXT NOT NULL,
//                 //     price REAL NOT NULL
//                 // );
//                 // `, null);
//                 let result2_ = tx.execute("INSERT INTO coffees VALUES (null, 'Colombian', 7.99);", null);
//                 let result_ = tx.execute("INSERT INTO coffees VALUES (null, 'French_Roast', 8.99;", null);
//                 // let result_ = tx.execute("INSERT INTO coffees VALUES (null, 'Espresso', 9.99);", null);
//                 // let result_ = tx.execute("INSERT INTO coffees VALUES (null, 'Colombian_Decaf', 8.99);", null);
//                 // let result_ = tx.execute("INSERT INTO coffees VALUES (null, 'French_Roast_Decaf', 9.99);", null);
           

//                 // let result_ = tx.query("SELECT * FROM Track LIMIT 10;");
//                 // let result_ = tx.query("SELECT * FROM Track LIMIT 10;");
                
//                 return result_;
//             });
//             console.log("|||||||||||||||||||||||||||||||||||||||||||||||||||");
            
//             if (result_.isOk) {
//                 let result_query = result_.get();
//                 console.log("statement " +result_query.statement.toString());
//                 console.log("last_insert_id "+ result_query.last_insert_id.toString());
//                 console.log("rows_affected "+result_query.rows_affected.toString());
//                 console.log("size "+result_query.size.toString());
//                 console.log("time "+result_query.time.toString());
           


//                 for (let i = 0; i < result_query.columns.length; i++) {
//                     console.log(result_query.columns[i].toString());
//                 }

//                 for (let i = 0; i < result_query.rows.length; i++) {
//                     // console.log(result_query.rows[i].toString());
//                     let row = result_query.rows[i];
//                     for (let j = 0; j < row.length; j++) {

//                         if (row[j] != null) {
//                             let row_item = row[j] as Value;
//                             console.log(row_item.toString());
//                         }
                        
//                     }
//                 }
//             } else {
//                 let e = result_.error();
//                 if (e != null) {
//                     console.log(e.message);
//                 }
  
//             }
//         }

//     });
// });

// test("A test", () => {
//     assert(true, "a test");
// });

// describe("A block", () => {
//     test("a test", () => {
//         assert(42 == 42, "this test fails");
//     });
// });


describe("fetch", () => {
    test("get fetch", () => {
        let rq: Request = new Request("https://httpbin.org/ip", {
            method: null,
            headers: null,
            body:null,
          });
        
        let result = fetch(rq);
        if (result.isOk) {
            let response = result.get();
            console.log(response.status.toString());
            console.log(response.statusText);
            // console.log(response.headers.toString());
            console.log(response.text());
        } else {
            let e = result.error();
            if (e != null) {
                console.log(e.message);
            }
        }
        //   console.log(result.text());
    });
});

_startTests();


register("test", function (payload: ArrayBuffer): Result<ArrayBuffer> {
    // console.log("test called");
    // console.log("_______________________________________________________");

    // // read file
    // let file = FileSystem.open("test.txt", "r+");
    // if (file == null) {
    //     console.log("file is null");
    // }else{
    //     console.log("file is not null");            
    //     file.writeString("Hello World");       
    //     file.close();
 
    // }
    
    // let file2 = FileSystem.open("folder2/file1.txt", "r+");
    // if (file2 == null) {
    //     console.log("file is null");
    // }else{
    //     let content = file2.readString();

    //     if (content != null) {
    //         console.log(content);
    //     }      
    //     file2.close();     
    // }
    
    // let dir = FileSystem.readdir("./");
    // if (dir != null) {
    //     console.log("dir is not null");
    //     console.log(dir.length.toString());
        

    //     //loop through dir
    //     for (let i = 0; i < dir.length; i++) {
    //         console.log(dir[i]);
    //     }

    // } else {
    //     console.log("dir is null");
    // }

    // let rename = FileSystem.rename("file1", "file2");
    // let mkdir = FileSystem.mkdir("newfolder");
    // let rmdir = FileSystem.rmdir("newfolder");
    // let exists = FileSystem.exists("folder2/file1.txt");
    // console.log(exists.toString());
    
    // let stat = FileSystem.stat("folder2/file1.txt");
    // if (stat != null) {
    //     console.log("stat is not null");
    //     console.log(stat.file_type.toString());
    //     console.log(stat.file_size.toString());
    //     console.log(stat.access_time.toString());
    //     console.log(stat.modification_time.toString());
    //     console.log(stat.creation_time.toString());
    // }

    // let lstat = FileSystem.lstat("folder2/file1.txt");
    // if (lstat != null) {
    //     console.log("stat is not null");
    //     console.log(lstat.file_type.toString());
    //     console.log(lstat.file_size.toString());
    //     console.log(lstat.access_time.toString());
    //     console.log(lstat.modification_time.toString());
    //     console.log(lstat.creation_time.toString());
    // }


    // let readdir = FileSystem.readdir2(".");
    // if (readdir != null) {
    //     console.log("readdir is not null");
    //     console.log(readdir.length.toString());

    //     //loop through dir
    //     for (let i = 0; i < readdir.length; i++) {
    //         // console.log(readdir[i]);
    //         console.log(readdir[i].name);

    //         // console.log(readdir[i].isBlockDevice().toString());
    //         // console.log(readdir[i].isCharacterDevice().toString());
    //         // console.log(readdir[i].isDirectory().toString());
    //         // console.log(readdir[i].isFile().toString());
    //         // console.log(readdir[i].isSocket().toString());
    //         // console.log(readdir[i].isSymbolicLink().toString());


    //     }

    // } else {
    //     console.log("readdir is null");
    // }

    



    

    // let url = new URL("https://github.com/denoland/deno/blob/v0.2.10/js/url.ts");
    // console.log(url.host);
    // assert(url.host == "github.com2", "url.host is not github.com2");


    return Result.ok(String.UTF8.encode("Hello"));
    // return Result.error<ArrayBuffer>(new Error("Hello"));
});

export function __guest_call(operation_size: usize, payload_size: usize): bool {
    return handleCall(operation_size, payload_size);
}
