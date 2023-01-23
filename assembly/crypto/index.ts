import { Crypto } from "./crypto";
export { HmacKeyGenParams, RsaHashedKeyGenParams } from "./input_output";
export { CryptoKey } from "./types";

let crypto = new Crypto();
export { crypto };