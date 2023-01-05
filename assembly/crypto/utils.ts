  // P-521 is not yet supported.
  const supportedNamedCurves = ["P-256", "P-384"];
  const recognisedUsages = [
    "encrypt",
    "decrypt",
    "sign",
    "verify",
    "deriveKey",
    "deriveBits",
    "wrapKey",
    "unwrapKey",
  ];

  const simpleAlgorithmDictionaries = {
    AesGcmParams: { iv: "BufferSource", additionalData: "BufferSource" },
    RsaHashedKeyGenParams: { hash: "HashAlgorithmIdentifier" },
    EcKeyGenParams: {},
    HmacKeyGenParams: { hash: "HashAlgorithmIdentifier" },
    RsaPssParams: {},
    EcdsaParams: { hash: "HashAlgorithmIdentifier" },
    HmacImportParams: { hash: "HashAlgorithmIdentifier" },
    HkdfParams: {
      hash: "HashAlgorithmIdentifier",
      salt: "BufferSource",
      info: "BufferSource",
    },
    Pbkdf2Params: { hash: "HashAlgorithmIdentifier", salt: "BufferSource" },
    RsaOaepParams: { label: "BufferSource" },
    RsaHashedImportParams: { hash: "HashAlgorithmIdentifier" },
    EcKeyImportParams: {},
  };

  const supportedAlgorithms = {
    "digest": {
      "SHA-1": null,
      "SHA-256": null,
      "SHA-384": null,
      "SHA-512": null,
    },
    "generateKey": {
      "RSASSA-PKCS1-v1_5": "RsaHashedKeyGenParams",
      "RSA-PSS": "RsaHashedKeyGenParams",
      "RSA-OAEP": "RsaHashedKeyGenParams",
      "ECDSA": "EcKeyGenParams",
      "ECDH": "EcKeyGenParams",
      "AES-CTR": "AesKeyGenParams",
      "AES-CBC": "AesKeyGenParams",
      "AES-GCM": "AesKeyGenParams",
      "AES-KW": "AesKeyGenParams",
      "HMAC": "HmacKeyGenParams",
      "X25519": null,
      "Ed25519": null,
    },
    "sign": {
      "RSASSA-PKCS1-v1_5": null,
      "RSA-PSS": "RsaPssParams",
      "ECDSA": "EcdsaParams",
      "HMAC": null,
      "Ed25519": null,
    },
    "verify": {
      "RSASSA-PKCS1-v1_5": null,
      "RSA-PSS": "RsaPssParams",
      "ECDSA": "EcdsaParams",
      "HMAC": null,
      "Ed25519": null,
    },
    "importKey": {
      "RSASSA-PKCS1-v1_5": "RsaHashedImportParams",
      "RSA-PSS": "RsaHashedImportParams",
      "RSA-OAEP": "RsaHashedImportParams",
      "ECDSA": "EcKeyImportParams",
      "ECDH": "EcKeyImportParams",
      "HMAC": "HmacImportParams",
      "HKDF": null,
      "PBKDF2": null,
      "AES-CTR": null,
      "AES-CBC": null,
      "AES-GCM": null,
      "AES-KW": null,
      "Ed25519": null,
      "X25519": null,
    },
    "deriveBits": {
      "HKDF": "HkdfParams",
      "PBKDF2": "Pbkdf2Params",
      "ECDH": "EcdhKeyDeriveParams",
      "X25519": "EcdhKeyDeriveParams",
    },
    "encrypt": {
      "RSA-OAEP": "RsaOaepParams",
      "AES-CBC": "AesCbcParams",
      "AES-GCM": "AesGcmParams",
      "AES-CTR": "AesCtrParams",
    },
    "decrypt": {
      "RSA-OAEP": "RsaOaepParams",
      "AES-CBC": "AesCbcParams",
      "AES-GCM": "AesGcmParams",
      "AES-CTR": "AesCtrParams",
    },
    "get key length": {
      "AES-CBC": "AesDerivedKeyParams",
      "AES-CTR": "AesDerivedKeyParams",
      "AES-GCM": "AesDerivedKeyParams",
      "AES-KW": "AesDerivedKeyParams",
      "HMAC": "HmacImportParams",
      "HKDF": null,
      "PBKDF2": null,
    },
    "wrapKey": {
      "AES-KW": null,
    },
    "unwrapKey": {
      "AES-KW": null,
    },
  };

  const aesJwkAlg = {
    "AES-CTR": {
      128: "A128CTR",
      192: "A192CTR",
      256: "A256CTR",
    },
    "AES-CBC": {
      128: "A128CBC",
      192: "A192CBC",
      256: "A256CBC",
    },
    "AES-GCM": {
      128: "A128GCM",
      192: "A192GCM",
      256: "A256GCM",
    },
    "AES-KW": {
      128: "A128KW",
      192: "A192KW",
      256: "A256KW",
    },
  };