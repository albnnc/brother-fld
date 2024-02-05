export class Codec {
  static process(data: Uint8Array) {
    const textEncoder = new TextEncoder();
    const keyUint8Array = textEncoder.encode(Codec.key);
    for (const [i, v] of data.entries()) {
      data[i] = keyUint8Array[i % keyUint8Array.length] ^ v;
    }
  }

  static textEncoder = new TextEncoder();

  // TODO: Move somewhere else.
  static key = "IDDQD";
}
