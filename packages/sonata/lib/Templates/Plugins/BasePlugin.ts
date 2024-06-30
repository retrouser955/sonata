import { Playlist } from "../Playlists/Playlist";
import { Track } from "../Track/Track";

export interface PluginReturnSearch {
    playlist?: Playlist<unknown> | null;
    tracks: Track<unknown>[];
}

export class BasePlugin<T> {
    options: T
    name = "unknown"

    constructor(options: T) {
        this.options = options
        this.init()
    }

    async init() {
        throw new Error("Not implemented")
    }

    validate(query: string, isTextBased: boolean = false): boolean {
        throw new Error("Not implemented")
    }

    async search(query: string, isTextBased: boolean = false): Promise<PluginReturnSearch> {
        throw new Error("Not implemented")
    }
}