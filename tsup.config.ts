import { defineConfig as createTsUpConfig, type Options } from "tsup"

export function defineConfig(options: Options) {
    return createTsUpConfig({
        dts: true,
        ...options
    })
}