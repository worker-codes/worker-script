import asc from "assemblyscript/asc";

const { error, stdout, stderr, stats } = await asc.main([
        // Command line options
        "testing/tests/add.ts",
        "--outFile", "testing/builds/myModule.wasm",
        "--textFile", "testing/builds/myModule.wat",
        "--use", "abort=testing/tests4/add/abort",
        // "--path", "/home/dallen/Codes/assemblyscript/assemblyscript",
      //   "--optimize",
        "--sourceMap",
        "--stats",
        "--bindings",
      ], {
  // Additional API options
//   stdout?: ...,
//   stderr?: ...,
//   readFile?: ...,
//   writeFile?: ...,
//   listFiles?: ...,
//   reportDiagnostic?: ...,
//   transforms?: ...
});
if (error) {
  console.log("Compilation failed: " + error.message);
  console.log(stderr.toString());
} else {
  console.log(stdout.toString());
}


// [
//     // Command line options
//     "testing/tests/add.ts",
//     "--outFile", "testing/builds/myModule.wasm",
//     "--textFile", "testing/builds/myModule.wat",
//   //   "--optimize",
//     "--sourceMap",
//     "--stats",
//     "--target debug",
//     "--bindings false",
//   ]