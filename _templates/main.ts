export const mainTemplate = (initialPathname: string) => `
import { Webview } from "https://deno.land/x/webview@0.7.6/mod.ts";

new Worker(
  new URL(
    "./worker.js",
    import.meta.url,
  ).href,
  { type: "module" },
);

const webview = new Webview();
webview.navigate("http://localhost:10000${initialPathname}");
webview.run();
`;
