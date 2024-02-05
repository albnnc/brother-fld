import * as path from "std/path/mod.ts";
import { mainTemplate } from "./_templates/main.ts";
import { workerTemplate } from "./_templates/worker.ts";
import { Bundle } from "./_utils/bundle.ts";
import { Codec } from "./_utils/codec.ts";
import { minify } from "./_utils/minify.ts";

export interface PackOptions {
  input: string;
  output: string;
  filter: string;
  initialPathname: string;
}

export async function pack({
  input,
  output,
  filter,
  initialPathname,
}: PackOptions) {
  const tempPath = await Deno.makeTempDir();
  const tempUrl = path.toFileUrl(tempPath).toString() + "/";
  try {
    const currentPath = Deno.cwd() + "/";
    const inputPath = path.resolve(currentPath, input) + "/";
    const inputUrl = path.toFileUrl(inputPath).toString();
    const bundle = await Bundle.fromFs(inputUrl, filter);
    bundle.process();
    const bundleTempUrl = new URL("./data.json", tempUrl).toString();
    const mainTempUrl = new URL("./main.js", tempUrl).toString();
    const workerTempUrl = new URL("./worker.js", tempUrl).toString();
    await bundle.write(bundleTempUrl);
    await minify(mainTemplate(initialPathname), "./main.js", mainTempUrl);
    await minify(workerTemplate(Codec.key), "worker.js", workerTempUrl);
    await new Deno.Command("deno", {
      args: [
        "compile",
        "-A",
        "--unstable-ffi",
        "--output",
        output,
        "--include",
        workerTempUrl,
        mainTempUrl,
      ],
      stdin: "inherit",
      stdout: "inherit",
    }).output();
  } finally {
    await Deno.remove(tempPath, { recursive: true });
  }
}
