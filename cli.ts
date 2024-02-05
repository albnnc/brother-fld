#!/usr/bin/env -S deno run -A
import { Command } from "cliffy/command/mod.ts";
import { pack } from "./pack.ts";

await new Command()
  .name("cli")
  .description("Freelancer's Defender.")
  .command("pack", "Pack WEB-app to a standalone executable.")
  .option(
    "-i, --input [path]",
    "Input path to be packed.",
    { required: true },
  )
  .option(
    "-o, --output [path]",
    "Output path where executable will be placed.",
    { required: true },
  )
  .option(
    "-f, --filter [glob]",
    "Glob to filter files in input path.",
    { default: "**/*" },
  )
  .option(
    "--initial-pathname [pathname]",
    "Pathname to open when packed executable starts.",
    {
      default: "/index.html",
    },
  )
  .action(async ({ input, output, filter, initialPathname }) => {
    await pack({
      input: String(input),
      output: String(output),
      filter: String(filter),
      initialPathname: String(initialPathname),
    });
  })
  .parse(Deno.args);
