export const workerTemplate = (codecKey: string) => `
import raw from "./data.json" with { type: "json" };

export class Codec {
  static process(data) {
    const textEncoder = new TextEncoder();
    const keyUint8Array = textEncoder.encode(Codec.key);
    for (const [i, v] of data.entries()) {
      data[i] = keyUint8Array[i % keyUint8Array.length] ^ v;
    }
  }
  static textEncoder = new TextEncoder();
  static key = \`${codecKey}\`;
}

const textEncoder = new TextEncoder();
const data = {};
for (const [k, v] of Object.entries(raw)) {
  data[k] = textEncoder.encode(v);
  Codec.process(data[k]);
}

Deno.serve({
  handler: (req) => {
    const parsedUrl = new URL(req.url);
    const entryUrl = "." + parsedUrl.pathname;
    console.log("Handling", entryUrl);
    if (data[entryUrl]) {
      return new Response(data[entryUrl]);
    } else {
      return new Response(null, { status: 404 });
    }
  },
  port: 10_000,
});
`;
