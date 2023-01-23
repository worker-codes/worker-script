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
    crypto,
    HmacKeyGenParams, CryptoKey, RsaHashedKeyGenParams
} from "/home/dallen/WorkerCodes/WASM/worker-script/assembly/index";
import { hostCall, handleAbort, handleCall, register, Result } from "/home/dallen/WorkerCodes/WASM/worker-script/assembly/worker/wapc";
import { _startTests } from "/home/dallen/WorkerCodes/WASM/worker-script/assembly/test";
import { CryptoKeyPair } from "../../assembly/crypto/types";
// import { RsaHashedKeyGenParams } from "../../assembly/crypto/input_output";



describe("crypto", () => {
/*     test("crypto randomUUID", () => {
        let uuid = crypto.randomUUID();
        console.log("randomUUID: "+uuid);       
    });
    test("crypto getRandomValues", () => {
        const array = new Uint8Array(13);
        crypto.getRandomValues<Uint8Array, u8>(array);
      
        array.forEach((num) => {
      
            console.log(num.toString());
          
        })
    });
    test("crypto_subtle_digest", () => {
        const message = 'An obscure body in the S-K System, your majesty. The inhabitants refer to it as the planet Earth.';
        // const encoder = new TextEncoder();
        // const data = encoder.encode(message);
        let data = String.UTF8.encode(message);
        const result = crypto.subtle.digest('SHA-256', data);

        if (result.isOk) {
            let hash = result.get();
            console.log("hash: "+hash.byteLength.toString());
            
            const hashArray = Uint8Array.wrap(hash);

            const hashHex = hashArray.reduce<string>((a, b) => {
                let r = b.toString(16);
                let p = r.padStart(2, '0');
                return a + p
              }, "");
              console.log(hashHex);
 
  
        } else {
            let err = result.error()
            throw new Error(changetype<string>(err));
        }
      
       
    });

    test("test_generate_ HMACKey", () => {
        const result =  crypto.subtle.generateKey<HmacKeyGenParams, CryptoKey>(
            {
              name: "HMAC",
              hash: "SHA-512",
            },
            true,
            ["sign", "verify"],
        );

        if (result.isOk) {
            let key = result.get();
            console.log("key: " + key.algorithm.length.toString());
            if (key.handle != null) {
                let handle = changetype<ArrayBuffer>(key.handle);
                console.log("keyData: " + handle.byteLength.toString());  
            }          
        } else {
            let err = result.error()
            throw new Error(changetype<string>(err));
        }

    }); */

    // test("test_generate_RSA-OAEPKey", () => {
    //     console.log("test_generate_RSA-OAEPKey??????????????????????????????");
        
    //     let publicExponent = new Uint8Array(3);
    //     publicExponent.set([0x01, 0x00, 0x01], 0);
    //     console.log("test_generate_RSA-OAEPKey??????????????????????????????");
    //     const result =  crypto.subtle.generateKeyPair<RsaHashedKeyGenParams>(
    //         {
    //             name: "RSA-OAEP",
    //             modulusLength: 2048,
    //             publicExponent: publicExponent,
    //             hash: "SHA-256"
    //           },
    //           true,
    //           ["encrypt", "decrypt"]
    //     );

    //     if (result.isOk) {
    //         let key = result.get();
    //         console.log("key: " + key.privateKey.algorithm.length.toString());
    //         if (key.privateKey.handle != null) {
    //             let handle = changetype<ArrayBuffer>(key.privateKey.handle);
    //             console.log("keyData: " + handle.byteLength.toString());
    //         }
    //     } else {
    //         let err = result.error()
    //         throw new Error(changetype<string>(err));
    //     }

    // });
    
    test("test_generate_RSA-PSS", () => {
        console.log("test_generate_RSA-PSS??????????????????????????????");
        
        let publicExponent = new Uint8Array(3);
        publicExponent.set([0x01, 0x00, 0x01], 0);
        console.log("test_generate_RSA-PSS??????????????????????????????");
        const result =  crypto.subtle.generateKeyPair<RsaHashedKeyGenParams>(
            {
                name: "RSA-PSS",
                // Consider using a 4096-bit key for systems that require long-term security
                modulusLength: 2048,
                publicExponent: publicExponent,
                hash: "SHA-256",
              },
              true,
              ["sign", "verify"]
        );

        if (result.isOk) {
            let key = result.get();
            console.log("key: " + key.privateKey.algorithm.length.toString());
            if (key.privateKey.handle != null) {
                let handle = changetype<ArrayBuffer>(key.privateKey.handle);
                console.log("keyData: " + handle.byteLength.toString());  
            }          
        } else {
            let err = result.error()
            throw new Error(changetype<string>(err));
        }

    });
});

_startTests();


register("test", function (payload: ArrayBuffer): Result<ArrayBuffer> {


    return Result.ok(String.UTF8.encode("Hello"));
    // return Result.error<ArrayBuffer>(new Error("Hello"));
});

export function __guest_call(operation_size: usize, payload_size: usize): bool {
    return handleCall(operation_size, payload_size);
}
