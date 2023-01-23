import { hostCall, Result } from "../../worker/wapc";
import { copyBuffer } from "../crypto";
import { AesCbcParams, AesCtrParams, AesGcmParams, Algorithm, EcdsaParams, RsaOaepParams, RsaPssParams } from "../input_output";
import { AlgorithmOptions, CryptoKey, DecryptAlgorithmOptions, KeyType } from "../types";


export function unwrapKey<T>(algorithm: T, baseKey: CryptoKey, length: u32): Result<ArrayBuffer> {

}