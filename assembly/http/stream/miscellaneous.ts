export let IsNonNegativeNumber = (v:u32):bool => {
  if (typeof v !== 'number') {
    return false;
  }

  if (Number.isNaN(v)) {
    return false;
  }

  if (v < 0) {
    return false;
  }

  return true;
};

export let CloneAsUint8Array = (O:Uint8Array ):Uint8Array=> {
  const buffer = O.buffer.slice(O.byteOffset, O.byteOffset + O.byteLength);
  return Uint8Array.wrap(buffer);
};
