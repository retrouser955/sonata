import { MusicClient } from "../../Constructs/MusicClient";
import { BasePlugin } from "./BasePlugin";

export class PluginManager {
    musicClient: MusicClient
    plugins = new Map<string, BasePlugin<unknown>>()

    constructor(musicCli: MusicClient) {
        this.musicClient = musicCli
    }

    async add(plugin: BasePlugin<unknown>, force: boolean = false) {
        if(this.plugins.has(plugin.name)) {
            console.log("WARNING: This plugin already exists inside the plugin manager. You may be registering this plugin twice or a third-party plugin maybe impersonating an official plugin. In this case, please investigate further on the third-party plugins you are using.\nUse the 'force' option to replace the existing plugin with the new one.")
            if(!force) return
        }

        this.plugins.set(plugin.name, plugin)
    }

    getRegisteredPlugins(stringFormat?: boolean) {
        const plugins = Object.keys(Object.fromEntries(this.plugins))

        return stringFormat ? plugins.join("\n") : plugins
    }

    remove(name: string) {
        this.plugins.delete(name)
    }

    get(name: string) {
        return this.plugins.get(name)
    }

    getAll() {
        return Object.values(Object.fromEntries(this.plugins))
    }
}