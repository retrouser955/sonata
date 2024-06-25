import { ArtistData, Track } from "../Track/Track";

export interface PlaylistOptions<T> {
    name: string;
    authors: ArtistData[];
    duration: string; // FORMAT hh:mm:ss
    durationRaw: number; // Timecode
    url: string;
    tracks: Track<unknown>[];
    popularity?: number | null; // View count
    metadata?: T | null;
    thumbnail?: string | null;
}

export class Playlist<T> {
    name: string;
    authors: ArtistData[];
    duration: string; // FORMAT hh:mm:ss
    durationRaw: number; // Timecode
    url: string;
    tracks: Track<unknown>[];
    popularity?: number | null; // View count
    metadata?: T | null;
    thumbnail?: string | null;

    constructor(options: PlaylistOptions<T>) {
        this.name = options.name
        this.authors = options.authors
        this.duration = options.duration
        this.durationRaw = options.durationRaw
        this.url = options.url
        this.tracks = options.tracks
        this.popularity = options.popularity
        this.metadata = options.metadata
        this.thumbnail = options.thumbnail
    }

    setMetadata(data: T) {
        this.metadata = data
    }
}