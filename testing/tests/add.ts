// export add function
import {
    Response,
    Headers,
    FetchEvent,
    URL,
    Status,
    fetch,
    Request,
    connect,
    Config,
    FileSystem,
    // crypto
} from "/home/dallen/Codes/assemblyscript/assembly/index";
import { hostCall, handleAbort, handleCall, register, Result } from "/home/dallen/Codes/assemblyscript/assembly/worker/wapc";
import { _startTests } from "/home/dallen/Codes/assemblyscript/assembly/test";
// import { FileSystem } from "as-wasi/assembly";
// export function add(a: i32, b: i32): i32 {
//     return a + b;
// }


// export function __guest_call(operation_size: usize, payload_size: usize): bool { 
//     return handleEvent(operation_size, payload_size);
// }



describe("URL", () => {
    test("hostname", () => {
        let url = new URL("https://github.com/denoland/deno/blob/v0.2.10/js/url.ts");
        console.log(url.host);
        assert(url.host == "github.com", "url.host is not github.com");
    });
});

describe("http_fetch", () => {
    test("get_request", () => {
        let rq: Request = new Request("https://httpbin.org/ip", {
            method: null,
            headers: null,
            body:null,
          });
        
          let result = fetch(rq);
        console.log(result.text());
        let status = result.status;
        assert( status == 200, "result.status is not 200");
    });
});

describe("database", () => {
    test("connect_to_database", () => {
        let config: Config = {
            url: "test",
            // username: "localhost",
            // password: "5432",
            // host: "5432",
            // port: 5432,
        };

        let result = connect(config)

    });

    test("query_database", () => {
        let config: Config = {
            url: "test",
            // username: "localhost",
            // password: "5432",
            // host: "5432",
            // port: "5432",
        };

        let result = connect(config)
        if (result.isOk) {
            let connection = result.get();
            let rows = connection.query("SELECT 1");
        }

    });
});

// test("A test", () => {
//     assert(true, "a test");
// });

// describe("A block", () => {
//     test("a test", () => {
//         assert(42 == 42, "this test fails");
//     });
// });

// _startTests();


register("test", function (payload: ArrayBuffer): Result<ArrayBuffer> {
    console.log("test called");
    console.log("_______________________________________________________");

    // read file
    let file = FileSystem.open("test.txt", "r+");
    if (file == null) {
        console.log("file is null");
    }else{
        console.log("file is not null");            
        file.writeString("Hello World");       
        file.close();
 
    }
    
    let file2 = FileSystem.open("folder2/file1.txt", "r+");
    if (file2 == null) {
        console.log("file is null");
    }else{
        let content = file2.readString();

        if (content != null) {
            console.log(content);
        }      
        file2.close();     
    }
    
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


    let readdir = FileSystem.readdir2(".");
    if (readdir != null) {
        console.log("readdir is not null");
        console.log(readdir.length.toString());

        //loop through dir
        for (let i = 0; i < readdir.length; i++) {
            // console.log(readdir[i]);
            console.log(readdir[i].name);

            // console.log(readdir[i].isBlockDevice().toString());
            // console.log(readdir[i].isCharacterDevice().toString());
            // console.log(readdir[i].isDirectory().toString());
            // console.log(readdir[i].isFile().toString());
            // console.log(readdir[i].isSocket().toString());
            // console.log(readdir[i].isSymbolicLink().toString());


        }

    } else {
        console.log("readdir is null");
    }

    



    

    // let url = new URL("https://github.com/denoland/deno/blob/v0.2.10/js/url.ts");
    // console.log(url.host);
    // assert(url.host == "github.com2", "url.host is not github.com2");


    return Result.ok(String.UTF8.encode("Hello"));
    // return Result.error<ArrayBuffer>(new Error("Hello"));
});

export function __guest_call(operation_size: usize, payload_size: usize): bool {
    return handleCall(operation_size, payload_size);
}
