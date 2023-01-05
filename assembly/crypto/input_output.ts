export class HmacKeyAlgorithm{
    name: string;
    hash: string;
    length: i32;
}

export class HmacKey{
    algorithm: HmacKeyAlgorithm;
    extractable: bool;
    type: KeyType;
    usages: KeyUsage[];
}


export class HmacDigestArg {
    algorithm: string;
    key: ArrayBuffer;
    data: ArrayBuffer;
}

export class HmacDigestResult {
    digest: ArrayBuffer;
}

export class HmacSignArg {
    algorithm: string;
    key: ArrayBuffer;
    data: ArrayBuffer;
}

export class HmacSignResult {
    signature: ArrayBuffer;
}

export class HmacVerifyArg {
    algorithm: string;
    key: ArrayBuffer;
    data: ArrayBuffer;
    signature: ArrayBuffer;
}

export class HmacVerifyResult {
    valid: bool;
}

export class HmacImportKeyArg {
    format: string;
    keyData: ArrayBuffer;
    algorithm: string;
    extractable: bool;
    keyUsages: KeyUsage[];
}

export class HmacImportKeyResult {
    key: ArrayBuffer;
}

export class HmacExportKeyArg {
    format: string;
    key: ArrayBuffer;
}

export class HmacExportKeyResult {
    keyData: ArrayBuffer;
}

export class HmacGenerateKeyArg {
    algorithm: string;
    extractable: bool;
    keyUsages: KeyUsage[];
}

export class HmacGenerateKeyResult {
    key: ArrayBuffer;
}

export class HmacDeriveKeyArg {
    algorithm: string;
    baseKey: ArrayBuffer;
    derivedKeyType: string;
    extractable: bool;
    keyUsages: KeyUsage[];
}

export class HmacDeriveKeyResult {
    key: ArrayBuffer;
}

export class HmacDeriveBitsArg {
    algorithm: string;
    baseKey: ArrayBuffer;
    length: i32;
}

export class HmacDeriveBitsResult {
    bits: ArrayBuffer;
}

export class HmacWrapKeyArg {
    format: string;
    key: ArrayBuffer;
    wrappingKey: ArrayBuffer;
    wrapAlgorithm: string;
}