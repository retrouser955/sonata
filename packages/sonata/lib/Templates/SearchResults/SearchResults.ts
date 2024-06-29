import { Playlist } from "../Playlists/Playlist";
import { Track } from "../Track/Track";

export interface SearchResultsOptions {
    playlist?: Playlist<unknown> | null
    tracks: Track<unknown>[]
    plugin: string;
}

export class SearchResults {
    playlist?: Playlist<unknown> | null
    tracks: Track<unknown>[]
    searchedOn: number
    plugin: string

    constructor(options: SearchResultsOptions) {
        this.playlist = options.playlist
        this.tracks = options.tracks
        this.searchedOn = Date.now()
        this.plugin = options.plugin
    }
}