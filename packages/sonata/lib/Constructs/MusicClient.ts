import Eris from "eris"
import { PluginManager } from "../Templates/Plugins/PluginManager"
import { QueueManager } from "../Templates/Queue/QueueManager"
import { TypedEmitter } from "tiny-typed-emitter"
import { Queue } from "../Templates/Queue/Queue"
import { Track } from "../Templates/Track/Track"
import { BasePlugin } from "../Templates/Plugins/BasePlugin"
import { SearchResults } from "../Templates/SearchResults/SearchResults"
import { setMusicClient } from "../helpers/helpers"
import { AsyncLocalStorage } from "async_hooks"
import { Util } from "../Utils/Util/Util"
import { FFmpegLocatingAgent } from "../Constants/ValidFFmpegLibs"
import { BaseCache } from "../Cache/BaseCache"

export enum MuiscEvents {
    QueueCreate = "createQueue",
    QueueDelete = "deleteQueue",
    TrackAdded = "addTracks",
    TrackRemoved = "removedTrack",
    TrackStart = "startTrack",
    QueueEmpty = "emptyQueue"
}

export interface TypedMusicEvents {
    [MuiscEvents.QueueCreate]: (queue: Queue<unknown>) => unknown;
    [MuiscEvents.QueueDelete]: (guildId: string) => unknown;
    [MuiscEvents.TrackAdded]: (queue: Queue<unknown>, track: Track<unknown>) => unknown;
    [MuiscEvents.TrackRemoved]: (queue: Queue<unknown>, track: Track<unknown>) => unknown;
    [MuiscEvents.TrackStart]: (queue: Queue<unknown>, track: Track<unknown>, previousTrack?: Track<unknown> | null) => unknown;
    [MuiscEvents.QueueEmpty]: (queue: Queue<unknown>) => unknown; 
}

export type HelperContext = Eris.CommandInteraction | Eris.Message | Eris.ComponentInteraction

const contextProvider = new AsyncLocalStorage<HelperContext>()

export function getHelperContext() {
    return contextProvider.getStore()
}

export function provideMusicClientContext(context: HelperContext, cb: () => unknown) {
    return contextProvider.run(context, cb)
}

export interface LibOptions {
    debug?: boolean;
    plugins?: BasePlugin<unknown>[];
    ffmpeg?: FFmpegLocatingAgent;
    cache?: BaseCache
}

export interface SearchOptions {
    filter?: string[] | ((pluginName: string) => boolean)
}

export class MusicClient extends TypedEmitter<TypedMusicEvents> {
    bot: Eris.Client
    plugins = new PluginManager(this)
    queues = new QueueManager(this)
    options: LibOptions

    constructor(bot: Eris.Client, options: LibOptions = { debug: false, plugins: [] }) {
        super()
        this.bot = bot
        this.options = options
        options.plugins?.forEach((plugin) => {
            this.plugins.add(plugin)
        });

        setMusicClient(this)
    }

    debug(...message: string[]) {
        if(!this.options.debug) return
        console.log(`[2;34m[[2;37mDEBUG | ERIS PLAYER[0m[2;34m] | [2;30m${message.join("")}[0m[2;34m[2;37m[0m[2;34m[0m`)
    }

    _isTextBased(query: string) {
        try {
            new URL(query)
            return true
        } catch {
            return false
        }
    }

    async search(query: string, options: SearchOptions = {}): Promise<SearchResults> {
        if(this.options.cache) {
            this.debug(`Searching for ${query} in cache`)
            const q = await this.options.cache.get(query)
            if(q) return q
        }

        this.debug(`Cache miss for ${query}`)
        if(query.startsWith("exec://com.")) {
            const [pluginUID, text] = query.replace("exec://", "").split(":::")

            if(!text) throw new Error("No query found. `query` is undefined!")

            this.debug("DETECTED MUST FOLLOW RULE exec.")
            const plugin = this.plugins.get(pluginUID)
            if(plugin) {
                const isText = this._isTextBased(text)

                this.debug(`Executing plugin: ${pluginUID}`)
                
                if(plugin.validate(text, isText)) {
                    const results = await plugin.search(text, isText)

                    const searchRes = new SearchResults({
                        plugin: plugin.name,
                        playlist: results.playlist,
                        tracks: results.tracks
                    })

                    if(results.tracks.length > 0 && this.options.cache) this.options.cache.set(query, searchRes) 
                    
                    return searchRes
                }

                this.debug(`Attempted to query using ${pluginUID}. plugin rejected your query.`)
            }

            this.debug(`unable to find ${pluginUID} going ahead with default queries`)
        }

        const isTextBased = this._isTextBased(query)

        const allPlugins = this.plugins.getAll()

        const filterFunction = (plugin: BasePlugin<unknown>) => {
            if(Array.isArray(options.filter)) return (options.filter as string[]).includes(plugin.name)
            return options.filter!(plugin.name)
        }

        const validPlugins = options.filter ? allPlugins.filter(filterFunction) : allPlugins

        for(let plugin of validPlugins) {
            if(!plugin.validate(query, isTextBased)) continue;

            const search = await plugin.search(query, isTextBased).catch((err) => {
                this.debug(err)
                return null
            })

            if(!search) continue

            if(search.tracks.length === 0) continue;

            const res = new SearchResults({
                plugin: plugin.name,
                playlist: search.playlist,
                tracks: search.tracks,
            })

            if(this.options.cache) this.options.cache.set(query, res)

            return res
        }

        return new SearchResults({
            plugin: "unable to find a proper plugin",
            playlist: null,
            tracks: []
        })
    }

    generateLibraryAnalysis() {
        const ffmpeg = Util.getFFmpegLib()
        const ffmpegPath = ffmpeg?.getPath()

        return `--------------------==== ERIS PLAYER ====--------------------
        
        ------------------------ Plugins Loaded ------------------------
        ${this.plugins.getAll().map((v) => v.name).join("\n")}
        
        ---------------------------- FFMPEG ----------------------------
        Name: ${ffmpeg?.name ?? "N/A"}
        Command: ${ffmpegPath ?? "N/A"}
        Version: ${ffmpeg?.version ?? "N/A"}
        `
    }
}