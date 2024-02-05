import { build, BuildOptions } from "esbuild";
import { denoPlugins } from "esbuild-deno-loader";
import * as path from "std/path/mod.ts";

export async function minify(
  contents: string,
  sourceUrl: string,
  targetUrl: string,
) {
  const buildOptions: BuildOptions = {
    stdin: {
      contents,
      resolveDir: "./source/",
      sourcefile: sourceUrl,
    },
    write: true,
    outfile: path.fromFileUrl(targetUrl),
    bundle: false,
    metafile: true,
    minify: true,
    target: "esnext",
    platform: "browser",
    format: "esm",
    logLevel: "silent",
    define: { "import.meta.main": "false" },
    plugins: denoPlugins(),
  };
  await build(buildOptions);
}
