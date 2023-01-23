    /**
     * @param {string} format
     * @param {BufferSource} keyData
     * @param {string} algorithm
     * @param {boolean} extractable
     * @param {KeyUsages[]} keyUsages
     * @returns {Promise<any>}
     */
    // deno-lint-ignore require-await
    async importKey(format, keyData, algorithm, extractable, keyUsages) {
        webidl.assertBranded(this, SubtleCryptoPrototype);
        const prefix = "Failed to execute 'importKey' on 'SubtleCrypto'";
        webidl.requiredArguments(arguments.length, 4, { prefix });
        format = webidl.converters.KeyFormat(format, {
          prefix,
          context: "Argument 1",
        });
        keyData = webidl.converters["BufferSource or JsonWebKey"](keyData, {
          prefix,
          context: "Argument 2",
        });
        algorithm = webidl.converters.AlgorithmIdentifier(algorithm, {
          prefix,
          context: "Argument 3",
        });
        extractable = webidl.converters.boolean(extractable, {
          prefix,
          context: "Argument 4",
        });
        keyUsages = webidl.converters["sequence<KeyUsage>"](keyUsages, {
          prefix,
          context: "Argument 5",
        });
  
        // 2.
        if (format !== "jwk") {
          if (
            ArrayBufferIsView(keyData) ||
            ObjectPrototypeIsPrototypeOf(ArrayBufferPrototype, keyData)
          ) {
            keyData = copyBuffer(keyData);
          } else {
            throw new TypeError("keyData is a JsonWebKey");
          }
        } else {
          if (
            ArrayBufferIsView(keyData) ||
            ObjectPrototypeIsPrototypeOf(ArrayBufferPrototype, keyData)
          ) {
            throw new TypeError("keyData is not a JsonWebKey");
          }
        }
  
        const normalizedAlgorithm = normalizeAlgorithm(algorithm, "importKey");
  
        const algorithmName = normalizedAlgorithm.name;
  
        switch (algorithmName) {
          case "HMAC": {
            return importKeyHMAC(
              format,
              normalizedAlgorithm,
              keyData,
              extractable,
              keyUsages,
            );
          }
          case "ECDH":
          case "ECDSA": {
            return importKeyEC(
              format,
              normalizedAlgorithm,
              keyData,
              extractable,
              keyUsages,
            );
          }
          case "RSASSA-PKCS1-v1_5":
          case "RSA-PSS":
          case "RSA-OAEP": {
            return importKeyRSA(
              format,
              normalizedAlgorithm,
              keyData,
              extractable,
              keyUsages,
            );
          }
          case "HKDF": {
            return importKeyHKDF(format, keyData, extractable, keyUsages);
          }
          case "PBKDF2": {
            return importKeyPBKDF2(format, keyData, extractable, keyUsages);
          }
          case "AES-CTR":
          case "AES-CBC":
          case "AES-GCM": {
            return importKeyAES(
              format,
              normalizedAlgorithm,
              keyData,
              extractable,
              keyUsages,
              ["encrypt", "decrypt", "wrapKey", "unwrapKey"],
            );
          }
          case "AES-KW": {
            return importKeyAES(
              format,
              normalizedAlgorithm,
              keyData,
              extractable,
              keyUsages,
              ["wrapKey", "unwrapKey"],
            );
          }
          case "X25519": {
            return importKeyX25519(
              format,
              keyData,
              extractable,
              keyUsages,
            );
          }
          case "Ed25519": {
            return importKeyEd25519(
              format,
              keyData,
              extractable,
              keyUsages,
            );
          }
          default:
            throw new DOMException("Not implemented", "NotSupportedError");
        }
}
      
function importKeyEd25519(
    format,
    keyData,
    extractable,
    keyUsages,
  ) {
    switch (format) {
      case "raw": {
        // 1.
        if (
          ArrayPrototypeFind(
            keyUsages,
            (u) => !ArrayPrototypeIncludes(["verify"], u),
          ) !== undefined
        ) {
          throw new DOMException("Invalid key usages", "SyntaxError");
        }

        const handle = {};
        WeakMapPrototypeSet(KEY_STORE, handle, keyData);

        // 2-3.
        const algorithm = {
          name: "Ed25519",
        };

        // 4-6.
        return constructKey(
          "public",
          extractable,
          usageIntersection(keyUsages, recognisedUsages),
          algorithm,
          handle,
        );
      }
      case "spki": {
        // 1.
        if (
          ArrayPrototypeFind(
            keyUsages,
            (u) => !ArrayPrototypeIncludes(["verify"], u),
          ) !== undefined
        ) {
          throw new DOMException("Invalid key usages", "SyntaxError");
        }

        const publicKeyData = new Uint8Array(32);
        if (!ops.op_import_spki_ed25519(keyData, publicKeyData)) {
          throw new DOMException("Invalid key data", "DataError");
        }

        const handle = {};
        WeakMapPrototypeSet(KEY_STORE, handle, publicKeyData);

        const algorithm = {
          name: "Ed25519",
        };

        return constructKey(
          "public",
          extractable,
          usageIntersection(keyUsages, recognisedUsages),
          algorithm,
          handle,
        );
      }
      case "pkcs8": {
        // 1.
        if (
          ArrayPrototypeFind(
            keyUsages,
            (u) => !ArrayPrototypeIncludes(["sign"], u),
          ) !== undefined
        ) {
          throw new DOMException("Invalid key usages", "SyntaxError");
        }

        const privateKeyData = new Uint8Array(32);
        if (!ops.op_import_pkcs8_ed25519(keyData, privateKeyData)) {
          throw new DOMException("Invalid key data", "DataError");
        }

        const handle = {};
        WeakMapPrototypeSet(KEY_STORE, handle, privateKeyData);

        const algorithm = {
          name: "Ed25519",
        };

        return constructKey(
          "private",
          extractable,
          usageIntersection(keyUsages, recognisedUsages),
          algorithm,
          handle,
        );
      }
      case "jwk": {
        // 1.
        const jwk = keyData;

        // 2.
        if (jwk.d !== undefined) {
          if (
            ArrayPrototypeFind(
              keyUsages,
              (u) =>
                !ArrayPrototypeIncludes(
                  ["sign"],
                  u,
                ),
            ) !== undefined
          ) {
            throw new DOMException("Invalid key usages", "SyntaxError");
          }
        } else {
          if (
            ArrayPrototypeFind(
              keyUsages,
              (u) =>
                !ArrayPrototypeIncludes(
                  ["verify"],
                  u,
                ),
            ) !== undefined
          ) {
            throw new DOMException("Invalid key usages", "SyntaxError");
          }
        }

        // 3.
        if (jwk.kty !== "OKP") {
          throw new DOMException("Invalid key type", "DataError");
        }

        // 4.
        if (jwk.crv !== "Ed25519") {
          throw new DOMException("Invalid curve", "DataError");
        }

        // 5.
        if (jwk.alg !== undefined && jwk.alg !== "EdDSA") {
          throw new DOMException("Invalid algorithm", "DataError");
        }

        // 6.
        if (
          keyUsages.length > 0 && jwk.use !== undefined && jwk.use !== "sig"
        ) {
          throw new DOMException("Invalid key usage", "DataError");
        }

        // 7.
        if (jwk.key_ops !== undefined) {
          if (
            ArrayPrototypeFind(
              jwk.key_ops,
              (u) => !ArrayPrototypeIncludes(recognisedUsages, u),
            ) !== undefined
          ) {
            throw new DOMException(
              "'key_ops' property of JsonWebKey is invalid",
              "DataError",
            );
          }

          if (
            !ArrayPrototypeEvery(
              jwk.key_ops,
              (u) => ArrayPrototypeIncludes(keyUsages, u),
            )
          ) {
            throw new DOMException(
              "'key_ops' property of JsonWebKey is invalid",
              "DataError",
            );
          }
        }

        // 8.
        if (jwk.ext !== undefined && jwk.ext === false && extractable) {
          throw new DOMException("Invalid key extractability", "DataError");
        }

        // 9.
        if (jwk.d !== undefined) {
          // https://www.rfc-editor.org/rfc/rfc8037#section-2
          const privateKeyData = ops.op_crypto_base64url_decode(jwk.d);

          const handle = {};
          WeakMapPrototypeSet(KEY_STORE, handle, privateKeyData);

          const algorithm = {
            name: "Ed25519",
          };

          return constructKey(
            "private",
            extractable,
            usageIntersection(keyUsages, recognisedUsages),
            algorithm,
            handle,
          );
        } else {
          // https://www.rfc-editor.org/rfc/rfc8037#section-2
          const publicKeyData = ops.op_crypto_base64url_decode(jwk.x);

          const handle = {};
          WeakMapPrototypeSet(KEY_STORE, handle, publicKeyData);

          const algorithm = {
            name: "Ed25519",
          };

          return constructKey(
            "public",
            extractable,
            usageIntersection(keyUsages, recognisedUsages),
            algorithm,
            handle,
          );
        }
      }
      default:
        throw new DOMException("Not implemented", "NotSupportedError");
    }
  }

  function importKeyX25519(
    format,
    keyData,
    extractable,
    keyUsages,
  ) {
    switch (format) {
      case "raw": {
        // 1.
        if (keyUsages.length > 0) {
          throw new DOMException("Invalid key usages", "SyntaxError");
        }

        const handle = {};
        WeakMapPrototypeSet(KEY_STORE, handle, keyData);

        // 2-3.
        const algorithm = {
          name: "X25519",
        };

        // 4-6.
        return constructKey(
          "public",
          extractable,
          [],
          algorithm,
          handle,
        );
      }
      case "spki": {
        // 1.
        if (keyUsages.length > 0) {
          throw new DOMException("Invalid key usages", "SyntaxError");
        }

        const publicKeyData = new Uint8Array(32);
        if (!ops.op_import_spki_x25519(keyData, publicKeyData)) {
          throw new DOMException("Invalid key data", "DataError");
        }

        const handle = {};
        WeakMapPrototypeSet(KEY_STORE, handle, publicKeyData);

        const algorithm = {
          name: "X25519",
        };

        return constructKey(
          "public",
          extractable,
          [],
          algorithm,
          handle,
        );
      }
      case "pkcs8": {
        // 1.
        if (
          ArrayPrototypeFind(
            keyUsages,
            (u) => !ArrayPrototypeIncludes(["deriveKey", "deriveBits"], u),
          ) !== undefined
        ) {
          throw new DOMException("Invalid key usages", "SyntaxError");
        }

        const privateKeyData = new Uint8Array(32);
        if (!ops.op_import_pkcs8_x25519(keyData, privateKeyData)) {
          throw new DOMException("Invalid key data", "DataError");
        }

        const handle = {};
        WeakMapPrototypeSet(KEY_STORE, handle, privateKeyData);

        const algorithm = {
          name: "X25519",
        };

        return constructKey(
          "private",
          extractable,
          usageIntersection(keyUsages, recognisedUsages),
          algorithm,
          handle,
        );
      }
      case "jwk": {
        // 1.
        const jwk = keyData;

        // 2.
        if (jwk.d !== undefined) {
          if (
            ArrayPrototypeFind(
              keyUsages,
              (u) =>
                !ArrayPrototypeIncludes(
                  ["deriveKey", "deriveBits"],
                  u,
                ),
            ) !== undefined
          ) {
            throw new DOMException("Invalid key usages", "SyntaxError");
          }
        }

        // 3.
        if (jwk.d === undefined && keyUsages.length > 0) {
          throw new DOMException("Invalid key usages", "SyntaxError");
        }

        // 4.
        if (jwk.kty !== "OKP") {
          throw new DOMException("Invalid key type", "DataError");
        }

        // 5.
        if (jwk.crv !== "X25519") {
          throw new DOMException("Invalid curve", "DataError");
        }

        // 6.
        if (keyUsages.length > 0 && jwk.use !== undefined) {
          if (jwk.use !== "enc") {
            throw new DOMException("Invalid key use", "DataError");
          }
        }

        // 7.
        if (jwk.key_ops !== undefined) {
          if (
            ArrayPrototypeFind(
              jwk.key_ops,
              (u) => !ArrayPrototypeIncludes(recognisedUsages, u),
            ) !== undefined
          ) {
            throw new DOMException(
              "'key_ops' property of JsonWebKey is invalid",
              "DataError",
            );
          }

          if (
            !ArrayPrototypeEvery(
              jwk.key_ops,
              (u) => ArrayPrototypeIncludes(keyUsages, u),
            )
          ) {
            throw new DOMException(
              "'key_ops' property of JsonWebKey is invalid",
              "DataError",
            );
          }
        }

        // 8.
        if (jwk.ext !== undefined && jwk.ext === false && extractable) {
          throw new DOMException("Invalid key extractability", "DataError");
        }

        // 9.
        if (jwk.d !== undefined) {
          // https://www.rfc-editor.org/rfc/rfc8037#section-2
          const privateKeyData = ops.op_crypto_base64url_decode(jwk.d);

          const handle = {};
          WeakMapPrototypeSet(KEY_STORE, handle, privateKeyData);

          const algorithm = {
            name: "X25519",
          };

          return constructKey(
            "private",
            extractable,
            usageIntersection(keyUsages, ["deriveKey", "deriveBits"]),
            algorithm,
            handle,
          );
        } else {
          // https://www.rfc-editor.org/rfc/rfc8037#section-2
          const publicKeyData = ops.op_crypto_base64url_decode(jwk.x);

          const handle = {};
          WeakMapPrototypeSet(KEY_STORE, handle, publicKeyData);

          const algorithm = {
            name: "X25519",
          };

          return constructKey(
            "public",
            extractable,
            [],
            algorithm,
            handle,
          );
        }
      }
      default:
        throw new DOMException("Not implemented", "NotSupportedError");
    }
  }

  function exportKeyAES(
    format,
    key,
    innerKey,
  ) {
    switch (format) {
      // 2.
      case "raw": {
        // 1.
        const data = innerKey.data;
        // 2.
        return data.buffer;
      }
      case "jwk": {
        // 1-2.
        const jwk = {
          kty: "oct",
        };

        // 3.
        const data = ops.op_crypto_export_key({
          format: "jwksecret",
          algorithm: "AES",
        }, innerKey);
        ObjectAssign(jwk, data);

        // 4.
        const algorithm = key[_algorithm];
        switch (algorithm.length) {
          case 128:
            jwk.alg = aesJwkAlg[algorithm.name][128];
            break;
          case 192:
            jwk.alg = aesJwkAlg[algorithm.name][192];
            break;
          case 256:
            jwk.alg = aesJwkAlg[algorithm.name][256];
            break;
          default:
            throw new DOMException(
              "Invalid key length",
              "NotSupportedError",
            );
        }

        // 5.
        jwk.key_ops = key.usages;

        // 6.
        jwk.ext = key[_extractable];

        // 7.
        return jwk;
      }
      default:
        throw new DOMException("Not implemented", "NotSupportedError");
    }
  }

  function importKeyAES(
    format,
    normalizedAlgorithm,
    keyData,
    extractable,
    keyUsages,
    supportedKeyUsages,
  ) {
    // 1.
    if (
      ArrayPrototypeFind(
        keyUsages,
        (u) => !ArrayPrototypeIncludes(supportedKeyUsages, u),
      ) !== undefined
    ) {
      throw new DOMException("Invalid key usages", "SyntaxError");
    }

    const algorithmName = normalizedAlgorithm.name;

    // 2.
    let data = keyData;

    switch (format) {
      case "raw": {
        // 2.
        if (
          !ArrayPrototypeIncludes([128, 192, 256], keyData.byteLength * 8)
        ) {
          throw new DOMException("Invalid key length", "Datarror");
        }

        break;
      }
      case "jwk": {
        // 1.
        const jwk = keyData;

        // 2.
        if (jwk.kty !== "oct") {
          throw new DOMException(
            "'kty' property of JsonWebKey must be 'oct'",
            "DataError",
          );
        }

        // Section 6.4.1 of RFC7518
        if (jwk.k === undefined) {
          throw new DOMException(
            "'k' property of JsonWebKey must be present",
            "DataError",
          );
        }

        // 4.
        const { rawData } = ops.op_crypto_import_key(
          { algorithm: "AES" },
          { jwkSecret: jwk },
        );
        data = rawData.data;

        // 5.
        switch (data.byteLength * 8) {
          case 128:
            if (
              jwk.alg !== undefined &&
              jwk.alg !== aesJwkAlg[algorithmName][128]
            ) {
              throw new DOMException("Invalid algorithm", "DataError");
            }
            break;
          case 192:
            if (
              jwk.alg !== undefined &&
              jwk.alg !== aesJwkAlg[algorithmName][192]
            ) {
              throw new DOMException("Invalid algorithm", "DataError");
            }
            break;
          case 256:
            if (
              jwk.alg !== undefined &&
              jwk.alg !== aesJwkAlg[algorithmName][256]
            ) {
              throw new DOMException("Invalid algorithm", "DataError");
            }
            break;
          default:
            throw new DOMException(
              "Invalid key length",
              "DataError",
            );
        }

        // 6.
        if (
          keyUsages.length > 0 && jwk.use !== undefined && jwk.use !== "enc"
        ) {
          throw new DOMException("Invalid key usages", "DataError");
        }

        // 7.
        // Section 4.3 of RFC7517
        if (jwk.key_ops !== undefined) {
          if (
            ArrayPrototypeFind(
              jwk.key_ops,
              (u) => !ArrayPrototypeIncludes(recognisedUsages, u),
            ) !== undefined
          ) {
            throw new DOMException(
              "'key_ops' property of JsonWebKey is invalid",
              "DataError",
            );
          }

          if (
            !ArrayPrototypeEvery(
              jwk.key_ops,
              (u) => ArrayPrototypeIncludes(keyUsages, u),
            )
          ) {
            throw new DOMException(
              "'key_ops' property of JsonWebKey is invalid",
              "DataError",
            );
          }
        }

        // 8.
        if (jwk.ext === false && extractable === true) {
          throw new DOMException(
            "'ext' property of JsonWebKey must not be false if extractable is true",
            "DataError",
          );
        }

        break;
      }
      default:
        throw new DOMException("Not implemented", "NotSupportedError");
    }

    const handle = {};
    WeakMapPrototypeSet(KEY_STORE, handle, {
      type: "secret",
      data,
    });

    // 4-7.
    const algorithm = {
      name: algorithmName,
      length: data.byteLength * 8,
    };

    const key = constructKey(
      "secret",
      extractable,
      usageIntersection(keyUsages, recognisedUsages),
      algorithm,
      handle,
    );

    // 8.
    return key;
  }

  function importKeyHMAC(
    format,
    normalizedAlgorithm,
    keyData,
    extractable,
    keyUsages,
  ) {
    // 2.
    if (
      ArrayPrototypeFind(
        keyUsages,
        (u) => !ArrayPrototypeIncludes(["sign", "verify"], u),
      ) !== undefined
    ) {
      throw new DOMException("Invalid key usages", "SyntaxError");
    }

    // 3.
    let hash;
    let data;

    // 4. https://w3c.github.io/webcrypto/#hmac-operations
    switch (format) {
      case "raw": {
        data = keyData;
        hash = normalizedAlgorithm.hash;
        break;
      }
      case "jwk": {
        const jwk = keyData;

        // 2.
        if (jwk.kty !== "oct") {
          throw new DOMException(
            "'kty' property of JsonWebKey must be 'oct'",
            "DataError",
          );
        }

        // Section 6.4.1 of RFC7518
        if (jwk.k === undefined) {
          throw new DOMException(
            "'k' property of JsonWebKey must be present",
            "DataError",
          );
        }

        // 4.
        const { rawData } = ops.op_crypto_import_key(
          { algorithm: "HMAC" },
          { jwkSecret: jwk },
        );
        data = rawData.data;

        // 5.
        hash = normalizedAlgorithm.hash;

        // 6.
        switch (hash.name) {
          case "SHA-1": {
            if (jwk.alg !== undefined && jwk.alg !== "HS1") {
              throw new DOMException(
                "'alg' property of JsonWebKey must be 'HS1'",
                "DataError",
              );
            }
            break;
          }
          case "SHA-256": {
            if (jwk.alg !== undefined && jwk.alg !== "HS256") {
              throw new DOMException(
                "'alg' property of JsonWebKey must be 'HS256'",
                "DataError",
              );
            }
            break;
          }
          case "SHA-384": {
            if (jwk.alg !== undefined && jwk.alg !== "HS384") {
              throw new DOMException(
                "'alg' property of JsonWebKey must be 'HS384'",
                "DataError",
              );
            }
            break;
          }
          case "SHA-512": {
            if (jwk.alg !== undefined && jwk.alg !== "HS512") {
              throw new DOMException(
                "'alg' property of JsonWebKey must be 'HS512'",
                "DataError",
              );
            }
            break;
          }
          default:
            throw new TypeError("unreachable");
        }

        // 7.
        if (
          keyUsages.length > 0 && jwk.use !== undefined && jwk.use !== "sig"
        ) {
          throw new DOMException(
            "'use' property of JsonWebKey must be 'sig'",
            "DataError",
          );
        }

        // 8.
        // Section 4.3 of RFC7517
        if (jwk.key_ops !== undefined) {
          if (
            ArrayPrototypeFind(
              jwk.key_ops,
              (u) => !ArrayPrototypeIncludes(recognisedUsages, u),
            ) !== undefined
          ) {
            throw new DOMException(
              "'key_ops' property of JsonWebKey is invalid",
              "DataError",
            );
          }

          if (
            !ArrayPrototypeEvery(
              jwk.key_ops,
              (u) => ArrayPrototypeIncludes(keyUsages, u),
            )
          ) {
            throw new DOMException(
              "'key_ops' property of JsonWebKey is invalid",
              "DataError",
            );
          }
        }

        // 9.
        if (jwk.ext === false && extractable === true) {
          throw new DOMException(
            "'ext' property of JsonWebKey must not be false if extractable is true",
            "DataError",
          );
        }

        break;
      }
      default:
        throw new DOMException("Not implemented", "NotSupportedError");
    }

    // 5.
    let length = data.byteLength * 8;
    // 6.
    if (length === 0) {
      throw new DOMException("Key length is zero", "DataError");
    }
    // 7.
    if (normalizedAlgorithm.length !== undefined) {
      if (
        normalizedAlgorithm.length > length ||
        normalizedAlgorithm.length <= (length - 8)
      ) {
        throw new DOMException(
          "Key length is invalid",
          "DataError",
        );
      }
      length = normalizedAlgorithm.length;
    }

    const handle = {};
    WeakMapPrototypeSet(KEY_STORE, handle, {
      type: "secret",
      data,
    });

    const algorithm = {
      name: "HMAC",
      length,
      hash,
    };

    const key = constructKey(
      "secret",
      extractable,
      usageIntersection(keyUsages, recognisedUsages),
      algorithm,
      handle,
    );

    return key;
  }

  function importKeyEC(
    format,
    normalizedAlgorithm,
    keyData,
    extractable,
    keyUsages,
  ) {
    const supportedUsages = SUPPORTED_KEY_USAGES[normalizedAlgorithm.name];

    switch (format) {
      case "raw": {
        // 1.
        if (
          !ArrayPrototypeIncludes(
            supportedNamedCurves,
            normalizedAlgorithm.namedCurve,
          )
        ) {
          throw new DOMException(
            "Invalid namedCurve",
            "DataError",
          );
        }

        // 2.
        if (
          ArrayPrototypeFind(
            keyUsages,
            (u) =>
              !ArrayPrototypeIncludes(
                SUPPORTED_KEY_USAGES[normalizedAlgorithm.name].public,
                u,
              ),
          ) !== undefined
        ) {
          throw new DOMException("Invalid key usages", "SyntaxError");
        }

        // 3.
        const { rawData } = ops.op_crypto_import_key({
          algorithm: normalizedAlgorithm.name,
          namedCurve: normalizedAlgorithm.namedCurve,
        }, { raw: keyData });

        const handle = {};
        WeakMapPrototypeSet(KEY_STORE, handle, rawData);

        // 4-5.
        const algorithm = {
          name: normalizedAlgorithm.name,
          namedCurve: normalizedAlgorithm.namedCurve,
        };

        // 6-8.
        const key = constructKey(
          "public",
          extractable,
          usageIntersection(keyUsages, recognisedUsages),
          algorithm,
          handle,
        );

        return key;
      }
      case "pkcs8": {
        // 1.
        if (
          ArrayPrototypeFind(
            keyUsages,
            (u) =>
              !ArrayPrototypeIncludes(
                SUPPORTED_KEY_USAGES[normalizedAlgorithm.name].private,
                u,
              ),
          ) !== undefined
        ) {
          throw new DOMException("Invalid key usages", "SyntaxError");
        }

        // 2-9.
        const { rawData } = ops.op_crypto_import_key({
          algorithm: normalizedAlgorithm.name,
          namedCurve: normalizedAlgorithm.namedCurve,
        }, { pkcs8: keyData });

        const handle = {};
        WeakMapPrototypeSet(KEY_STORE, handle, rawData);

        const algorithm = {
          name: normalizedAlgorithm.name,
          namedCurve: normalizedAlgorithm.namedCurve,
        };

        const key = constructKey(
          "private",
          extractable,
          usageIntersection(keyUsages, recognisedUsages),
          algorithm,
          handle,
        );

        return key;
      }
      case "spki": {
        // 1.
        if (normalizedAlgorithm.name == "ECDSA") {
          if (
            ArrayPrototypeFind(
              keyUsages,
              (u) =>
                !ArrayPrototypeIncludes(
                  SUPPORTED_KEY_USAGES[normalizedAlgorithm.name].public,
                  u,
                ),
            ) !== undefined
          ) {
            throw new DOMException("Invalid key usages", "SyntaxError");
          }
        } else if (keyUsages.length != 0) {
          throw new DOMException("Key usage must be empty", "SyntaxError");
        }

        // 2-12
        const { rawData } = ops.op_crypto_import_key({
          algorithm: normalizedAlgorithm.name,
          namedCurve: normalizedAlgorithm.namedCurve,
        }, { spki: keyData });

        const handle = {};
        WeakMapPrototypeSet(KEY_STORE, handle, rawData);

        const algorithm = {
          name: normalizedAlgorithm.name,
          namedCurve: normalizedAlgorithm.namedCurve,
        };

        // 6-8.
        const key = constructKey(
          "public",
          extractable,
          usageIntersection(keyUsages, recognisedUsages),
          algorithm,
          handle,
        );

        return key;
      }
      case "jwk": {
        const jwk = keyData;

        const keyType = (jwk.d !== undefined) ? "private" : "public";

        // 2.
        if (
          ArrayPrototypeFind(
            keyUsages,
            (u) => !ArrayPrototypeIncludes(supportedUsages[keyType], u),
          ) !== undefined
        ) {
          throw new DOMException("Invalid key usages", "SyntaxError");
        }

        // 3.
        if (jwk.kty !== "EC") {
          throw new DOMException(
            "'kty' property of JsonWebKey must be 'EC'",
            "DataError",
          );
        }

        // 4.
        if (
          keyUsages.length > 0 && jwk.use !== undefined &&
          jwk.use !== supportedUsages.jwkUse
        ) {
          throw new DOMException(
            `'use' property of JsonWebKey must be '${supportedUsages.jwkUse}'`,
            "DataError",
          );
        }

        // 5.
        // Section 4.3 of RFC7517
        if (jwk.key_ops !== undefined) {
          if (
            ArrayPrototypeFind(
              jwk.key_ops,
              (u) => !ArrayPrototypeIncludes(recognisedUsages, u),
            ) !== undefined
          ) {
            throw new DOMException(
              "'key_ops' member of JsonWebKey is invalid",
              "DataError",
            );
          }

          if (
            !ArrayPrototypeEvery(
              jwk.key_ops,
              (u) => ArrayPrototypeIncludes(keyUsages, u),
            )
          ) {
            throw new DOMException(
              "'key_ops' member of JsonWebKey is invalid",
              "DataError",
            );
          }
        }

        // 6.
        if (jwk.ext === false && extractable === true) {
          throw new DOMException(
            "'ext' property of JsonWebKey must not be false if extractable is true",
            "DataError",
          );
        }

        // 9.
        if (jwk.alg !== undefined && normalizedAlgorithm.name == "ECDSA") {
          let algNamedCurve;

          switch (jwk.alg) {
            case "ES256": {
              algNamedCurve = "P-256";
              break;
            }
            case "ES384": {
              algNamedCurve = "P-384";
              break;
            }
            case "ES512": {
              algNamedCurve = "P-521";
              break;
            }
            default:
              throw new DOMException(
                "Curve algorithm not supported",
                "DataError",
              );
          }

          if (algNamedCurve) {
            if (algNamedCurve !== normalizedAlgorithm.namedCurve) {
              throw new DOMException(
                "Mismatched curve algorithm",
                "DataError",
              );
            }
          }
        }

        // Validate that this is a valid public key.
        if (jwk.x === undefined) {
          throw new DOMException(
            "'x' property of JsonWebKey is required for EC keys",
            "DataError",
          );
        }
        if (jwk.y === undefined) {
          throw new DOMException(
            "'y' property of JsonWebKey is required for EC keys",
            "DataError",
          );
        }

        if (jwk.d !== undefined) {
          // it's also a Private key
          const { rawData } = ops.op_crypto_import_key({
            algorithm: normalizedAlgorithm.name,
            namedCurve: normalizedAlgorithm.namedCurve,
          }, { jwkPrivateEc: jwk });

          const handle = {};
          WeakMapPrototypeSet(KEY_STORE, handle, rawData);

          const algorithm = {
            name: normalizedAlgorithm.name,
            namedCurve: normalizedAlgorithm.namedCurve,
          };

          const key = constructKey(
            "private",
            extractable,
            usageIntersection(keyUsages, recognisedUsages),
            algorithm,
            handle,
          );

          return key;
        } else {
          const { rawData } = ops.op_crypto_import_key({
            algorithm: normalizedAlgorithm.name,
            namedCurve: normalizedAlgorithm.namedCurve,
          }, { jwkPublicEc: jwk });

          const handle = {};
          WeakMapPrototypeSet(KEY_STORE, handle, rawData);

          const algorithm = {
            name: normalizedAlgorithm.name,
            namedCurve: normalizedAlgorithm.namedCurve,
          };

          const key = constructKey(
            "public",
            extractable,
            usageIntersection(keyUsages, recognisedUsages),
            algorithm,
            handle,
          );

          return key;
        }
      }
      default:
        throw new DOMException("Not implemented", "NotSupportedError");
    }
  }

  const SUPPORTED_KEY_USAGES = {
    "RSASSA-PKCS1-v1_5": {
      public: ["verify"],
      private: ["sign"],
      jwkUse: "sig",
    },
    "RSA-PSS": {
      public: ["verify"],
      private: ["sign"],
      jwkUse: "sig",
    },
    "RSA-OAEP": {
      public: ["encrypt", "wrapKey"],
      private: ["decrypt", "unwrapKey"],
      jwkUse: "enc",
    },
    "ECDSA": {
      public: ["verify"],
      private: ["sign"],
      jwkUse: "sig",
    },
    "ECDH": {
      public: [],
      private: ["deriveKey", "deriveBits"],
      jwkUse: "enc",
    },
  };

  function importKeyRSA(
    format,
    normalizedAlgorithm,
    keyData,
    extractable,
    keyUsages,
  ) {
    switch (format) {
      case "pkcs8": {
        // 1.
        if (
          ArrayPrototypeFind(
            keyUsages,
            (u) =>
              !ArrayPrototypeIncludes(
                SUPPORTED_KEY_USAGES[normalizedAlgorithm.name].private,
                u,
              ),
          ) !== undefined
        ) {
          throw new DOMException("Invalid key usages", "SyntaxError");
        }

        // 2-9.
        const { modulusLength, publicExponent, rawData } = ops
          .op_crypto_import_key(
            {
              algorithm: normalizedAlgorithm.name,
              // Needed to perform step 7 without normalization.
              hash: normalizedAlgorithm.hash.name,
            },
            { pkcs8: keyData },
          );

        const handle = {};
        WeakMapPrototypeSet(KEY_STORE, handle, rawData);

        const algorithm = {
          name: normalizedAlgorithm.name,
          modulusLength,
          publicExponent,
          hash: normalizedAlgorithm.hash,
        };

        const key = constructKey(
          "private",
          extractable,
          usageIntersection(keyUsages, recognisedUsages),
          algorithm,
          handle,
        );

        return key;
      }
      case "spki": {
        // 1.
        if (
          ArrayPrototypeFind(
            keyUsages,
            (u) =>
              !ArrayPrototypeIncludes(
                SUPPORTED_KEY_USAGES[normalizedAlgorithm.name].public,
                u,
              ),
          ) !== undefined
        ) {
          throw new DOMException("Invalid key usages", "SyntaxError");
        }

        // 2-9.
        const { modulusLength, publicExponent, rawData } = ops
          .op_crypto_import_key(
            {
              algorithm: normalizedAlgorithm.name,
              // Needed to perform step 7 without normalization.
              hash: normalizedAlgorithm.hash.name,
            },
            { spki: keyData },
          );

        const handle = {};
        WeakMapPrototypeSet(KEY_STORE, handle, rawData);

        const algorithm = {
          name: normalizedAlgorithm.name,
          modulusLength,
          publicExponent,
          hash: normalizedAlgorithm.hash,
        };

        const key = constructKey(
          "public",
          extractable,
          usageIntersection(keyUsages, recognisedUsages),
          algorithm,
          handle,
        );

        return key;
      }
      case "jwk": {
        // 1.
        const jwk = keyData;

        // 2.
        if (jwk.d !== undefined) {
          if (
            ArrayPrototypeFind(
              keyUsages,
              (u) =>
                !ArrayPrototypeIncludes(
                  SUPPORTED_KEY_USAGES[normalizedAlgorithm.name].private,
                  u,
                ),
            ) !== undefined
          ) {
            throw new DOMException("Invalid key usages", "SyntaxError");
          }
        } else if (
          ArrayPrototypeFind(
            keyUsages,
            (u) =>
              !ArrayPrototypeIncludes(
                SUPPORTED_KEY_USAGES[normalizedAlgorithm.name].public,
                u,
              ),
          ) !== undefined
        ) {
          throw new DOMException("Invalid key usages", "SyntaxError");
        }

        // 3.
        if (StringPrototypeToUpperCase(jwk.kty) !== "RSA") {
          throw new DOMException(
            "'kty' property of JsonWebKey must be 'RSA'",
            "DataError",
          );
        }

        // 4.
        if (
          keyUsages.length > 0 && jwk.use !== undefined &&
          StringPrototypeToLowerCase(jwk.use) !==
            SUPPORTED_KEY_USAGES[normalizedAlgorithm.name].jwkUse
        ) {
          throw new DOMException(
            `'use' property of JsonWebKey must be '${
              SUPPORTED_KEY_USAGES[normalizedAlgorithm.name].jwkUse
            }'`,
            "DataError",
          );
        }

        // 5.
        if (jwk.key_ops !== undefined) {
          if (
            ArrayPrototypeFind(
              jwk.key_ops,
              (u) => !ArrayPrototypeIncludes(recognisedUsages, u),
            ) !== undefined
          ) {
            throw new DOMException(
              "'key_ops' property of JsonWebKey is invalid",
              "DataError",
            );
          }

          if (
            !ArrayPrototypeEvery(
              jwk.key_ops,
              (u) => ArrayPrototypeIncludes(keyUsages, u),
            )
          ) {
            throw new DOMException(
              "'key_ops' property of JsonWebKey is invalid",
              "DataError",
            );
          }
        }

        if (jwk.ext === false && extractable === true) {
          throw new DOMException(
            "'ext' property of JsonWebKey must not be false if extractable is true",
            "DataError",
          );
        }

        // 7.
        let hash;

        // 8.
        if (normalizedAlgorithm.name === "RSASSA-PKCS1-v1_5") {
          switch (jwk.alg) {
            case undefined:
              hash = undefined;
              break;
            case "RS1":
              hash = "SHA-1";
              break;
            case "RS256":
              hash = "SHA-256";
              break;
            case "RS384":
              hash = "SHA-384";
              break;
            case "RS512":
              hash = "SHA-512";
              break;
            default:
              throw new DOMException(
                `'alg' property of JsonWebKey must be one of 'RS1', 'RS256', 'RS384', 'RS512'`,
                "DataError",
              );
          }
        } else if (normalizedAlgorithm.name === "RSA-PSS") {
          switch (jwk.alg) {
            case undefined:
              hash = undefined;
              break;
            case "PS1":
              hash = "SHA-1";
              break;
            case "PS256":
              hash = "SHA-256";
              break;
            case "PS384":
              hash = "SHA-384";
              break;
            case "PS512":
              hash = "SHA-512";
              break;
            default:
              throw new DOMException(
                `'alg' property of JsonWebKey must be one of 'PS1', 'PS256', 'PS384', 'PS512'`,
                "DataError",
              );
          }
        } else {
          switch (jwk.alg) {
            case undefined:
              hash = undefined;
              break;
            case "RSA-OAEP":
              hash = "SHA-1";
              break;
            case "RSA-OAEP-256":
              hash = "SHA-256";
              break;
            case "RSA-OAEP-384":
              hash = "SHA-384";
              break;
            case "RSA-OAEP-512":
              hash = "SHA-512";
              break;
            default:
              throw new DOMException(
                `'alg' property of JsonWebKey must be one of 'RSA-OAEP', 'RSA-OAEP-256', 'RSA-OAEP-384', or 'RSA-OAEP-512'`,
                "DataError",
              );
          }
        }

        // 9.
        if (hash !== undefined) {
          // 9.1.
          const normalizedHash = normalizeAlgorithm(hash, "digest");

          // 9.2.
          if (normalizedHash.name !== normalizedAlgorithm.hash.name) {
            throw new DOMException(
              `'alg' property of JsonWebKey must be '${normalizedAlgorithm.name}'`,
              "DataError",
            );
          }
        }

        // 10.
        if (jwk.d !== undefined) {
          // Private key
          const optimizationsPresent = jwk.p !== undefined ||
            jwk.q !== undefined || jwk.dp !== undefined ||
            jwk.dq !== undefined || jwk.qi !== undefined;
          if (optimizationsPresent) {
            if (jwk.q === undefined) {
              throw new DOMException(
                "'q' property of JsonWebKey is required for private keys",
                "DataError",
              );
            }
            if (jwk.dp === undefined) {
              throw new DOMException(
                "'dp' property of JsonWebKey is required for private keys",
                "DataError",
              );
            }
            if (jwk.dq === undefined) {
              throw new DOMException(
                "'dq' property of JsonWebKey is required for private keys",
                "DataError",
              );
            }
            if (jwk.qi === undefined) {
              throw new DOMException(
                "'qi' property of JsonWebKey is required for private keys",
                "DataError",
              );
            }
            if (jwk.oth !== undefined) {
              throw new DOMException(
                "'oth' property of JsonWebKey is not supported",
                "NotSupportedError",
              );
            }
          } else {
            throw new DOMException(
              "only optimized private keys are supported",
              "NotSupportedError",
            );
          }

          const { modulusLength, publicExponent, rawData } = ops
            .op_crypto_import_key(
              {
                algorithm: normalizedAlgorithm.name,
                hash: normalizedAlgorithm.hash.name,
              },
              { jwkPrivateRsa: jwk },
            );

          const handle = {};
          WeakMapPrototypeSet(KEY_STORE, handle, rawData);

          const algorithm = {
            name: normalizedAlgorithm.name,
            modulusLength,
            publicExponent,
            hash: normalizedAlgorithm.hash,
          };

          const key = constructKey(
            "private",
            extractable,
            usageIntersection(keyUsages, recognisedUsages),
            algorithm,
            handle,
          );

          return key;
        } else {
          // Validate that this is a valid public key.
          if (jwk.n === undefined) {
            throw new DOMException(
              "'n' property of JsonWebKey is required for public keys",
              "DataError",
            );
          }
          if (jwk.e === undefined) {
            throw new DOMException(
              "'e' property of JsonWebKey is required for public keys",
              "DataError",
            );
          }

          const { modulusLength, publicExponent, rawData } = ops
            .op_crypto_import_key(
              {
                algorithm: normalizedAlgorithm.name,
                hash: normalizedAlgorithm.hash.name,
              },
              { jwkPublicRsa: jwk },
            );

          const handle = {};
          WeakMapPrototypeSet(KEY_STORE, handle, rawData);

          const algorithm = {
            name: normalizedAlgorithm.name,
            modulusLength,
            publicExponent,
            hash: normalizedAlgorithm.hash,
          };

          const key = constructKey(
            "public",
            extractable,
            usageIntersection(keyUsages, recognisedUsages),
            algorithm,
            handle,
          );

          return key;
        }
      }
      default:
        throw new DOMException("Not implemented", "NotSupportedError");
    }
  }

  function importKeyHKDF(
    format,
    keyData,
    extractable,
    keyUsages,
  ) {
    if (format !== "raw") {
      throw new DOMException("Format not supported", "NotSupportedError");
    }

    // 1.
    if (
      ArrayPrototypeFind(
        keyUsages,
        (u) => !ArrayPrototypeIncludes(["deriveKey", "deriveBits"], u),
      ) !== undefined
    ) {
      throw new DOMException("Invalid key usages", "SyntaxError");
    }

    // 2.
    if (extractable !== false) {
      throw new DOMException(
        "Key must not be extractable",
        "SyntaxError",
      );
    }

    // 3.
    const handle = {};
    WeakMapPrototypeSet(KEY_STORE, handle, {
      type: "secret",
      data: keyData,
    });

    // 4-8.
    const algorithm = {
      name: "HKDF",
    };
    const key = constructKey(
      "secret",
      false,
      usageIntersection(keyUsages, recognisedUsages),
      algorithm,
      handle,
    );

    // 9.
    return key;
  }

  function importKeyPBKDF2(
    format,
    keyData,
    extractable,
    keyUsages,
  ) {
    // 1.
    if (format !== "raw") {
      throw new DOMException("Format not supported", "NotSupportedError");
    }

    // 2.
    if (
      ArrayPrototypeFind(
        keyUsages,
        (u) => !ArrayPrototypeIncludes(["deriveKey", "deriveBits"], u),
      ) !== undefined
    ) {
      throw new DOMException("Invalid key usages", "SyntaxError");
    }

    // 3.
    if (extractable !== false) {
      throw new DOMException(
        "Key must not be extractable",
        "SyntaxError",
      );
    }

    // 4.
    const handle = {};
    WeakMapPrototypeSet(KEY_STORE, handle, {
      type: "secret",
      data: keyData,
    });

    // 5-9.
    const algorithm = {
      name: "PBKDF2",
    };
    const key = constructKey(
      "secret",
      false,
      usageIntersection(keyUsages, recognisedUsages),
      algorithm,
      handle,
    );

    // 10.
    return key;
  }