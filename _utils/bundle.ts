import * as fs from "std/fs/mod.ts";
import * as path from "std/path/mod.ts";
import { Codec } from "./codec.ts";
import { relativiseUrl } from "./relativise_url.ts";

export interface BundleChunk {
  data: Uint8Array;
}

export class Bundle extends Map<string, BundleChunk> {
  private changes = new Set<string>();

  constructor(entries?: readonly (readonly [string, BundleChunk])[] | null) {
    if (entries?.some(([k]) => !k.startsWith("."))) {
      throw new Error("Only relative paths are allowed");
    }
    entries?.forEach(([k]) => this.changes.add(k));
    super(entries);
  }

  set(url: string, chunk: BundleChunk) {
    if (!url.startsWith(".")) {
      throw new Error("Only relative paths are allowed");
    }
    super.set(url, chunk);
    return this;
  }

  async write(targetUrl: string) {
    const textDecoder = new TextDecoder();
    const targetData: Record<string, string> = {};
    for (const [key, { data }] of this.entries()) {
      targetData[key] = textDecoder.decode(data);
    }
    const targetPath = path.fromFileUrl(targetUrl);
    const targetDir = path.dirname(targetPath);
    await fs.ensureDir(targetDir);
    await Deno.writeTextFile(targetPath, JSON.stringify(targetData, null, 2));
  }

  process() {
    for (const [_, { data }] of this.entries()) {
      Codec.process(data);
    }
  }

  static async fromFs(inputUrl: string, glob: string) {
    if (!glob.startsWith(".")) {
      glob = "./" + glob;
    }
    const absoluteGlobUrl = new URL(glob, inputUrl).toString();
    const absoluteGlobPath = path.fromFileUrl(absoluteGlobUrl);
    const bundle = new Bundle();
    for await (const entry of fs.expandGlob(absoluteGlobPath)) {
      if (!entry.isFile) {
        continue;
      }
      const absoluteEntryUrl = path.toFileUrl(entry.path).toString();
      const entryUrl = relativiseUrl(absoluteEntryUrl, inputUrl);
      const entryData = await fetch(absoluteEntryUrl).then(async (v) => {
        if (!v.ok) {
          throw new Error(v.statusText);
        }
        return new Uint8Array(await v.arrayBuffer());
      });
      bundle.set(entryUrl, { data: entryData });
    }
    return bundle;
  }
}
