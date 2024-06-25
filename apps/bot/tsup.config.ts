import { defineConfig }from "../../tsup.config"

export default defineConfig({
    entry: ['src/index.ts'],
    format: "cjs",
    dts: false
})