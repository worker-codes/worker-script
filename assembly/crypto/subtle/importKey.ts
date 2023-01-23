import { hostCall, Result } from "../../worker/wapc";
import { copyBuffer } from "../crypto";
import { AesCbcParams, AesCtrParams, AesGcmParams, Algorithm, EcdsaParams, RsaOaepParams, RsaPssParams } from "../input_output";
import { AlgorithmOptions, CryptoKey, DecryptAlgorithmOptions, KeyType } from "../types";


export function importKey<T>(format: string, keyData: ArrayBuffer, algorithm: T, extractable: bool, keyUsages: KeyUsage[]): Result<CryptoKey> {

}