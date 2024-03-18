#!/usr/bin/env node

import { add } from "~/src/commands/add.js"
import { init } from "~/src/commands/init.js"
import { Command } from "commander"
import { restoreCache } from "./cache.js"
import { refresh } from "./commands/refresh.js"
import { libraryCommand } from "./commands/library.js"
import { checkVersion } from "./check-version.js"
import packageJson from "../package.json"
import { authCommand } from "./commands/auth.js"
import { healthcheck } from "./healthcheck.js"

process.on("SIGINT", () => process.exit(0))
process.on("SIGTERM", () => process.exit(0))

await healthcheck()
await checkVersion()
void restoreCache()

export const program = new Command()
  .name("sly")
  .description("add components, icons, and utilities as code, not dependencies")
  .option("-y, --yes", "skip confirmation prompt.", false)
  // flags with --no are inverted, so this is yes-cache by default
  .option("--no-cache", "disable caching.", true)
  .version(packageJson.version, "-v, --version", "display the version number")
  .hook("preAction", () => {
    console.log("Connected to ", process.env.REGISTRY_URL)
    // This runs before every command, so this is our global state
    const options = program.optsWithGlobals()

    // Flags override env vars
    process.env.YES = options.yes ? "true" : ""
    process.env.CACHE = options.cache ? "true" : ""
  })

program
  .addCommand(init)
  .addCommand(add)
  .addCommand(refresh)
  .addCommand(libraryCommand)
  .addCommand(authCommand)

program.parse()

/**
 * These are imported by the JSDoc in the transformers
 */

export type Meta = {
  name: string
  source: string
  description?: string
  license: string
}

export type Transformer = (
  input: string,
  meta: Meta
) => Promise<string> | string
