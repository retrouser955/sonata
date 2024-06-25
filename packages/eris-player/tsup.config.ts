import { defineConfig } from "../../tsup.config"

export default defineConfig({
    format: ["cjs"],
    entry: ["lib/index.ts"]
})