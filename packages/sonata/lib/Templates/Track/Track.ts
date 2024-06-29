import internal from "stream";

export interface ArtistData {
    name: string;
    thumbnail?: string;
}

export interface AlbumData {
    name: string;
    thumbnail?: string;
}

export interface ReadableStreamData {
    format: string;
    stream: internal.Readable
}

export interface TrackData<Metadata> {
    name: string;
    artists: ArtistData[];
    duration: string; // provide "00:00:00" if no duration can be obtained
    album?: AlbumData;
    stream: () => Promise<ReadableStreamData | string>;
    thumbnail?: string;
    requestBridgeContent: () => Promise<string>;
    metadata?: Metadata;
    durationRaw: number;
    url: string;
    source?: string;
    popularity?: number;
}

export class Track<Metadata> {
    name: string;
    artists: ArtistData[];
    duration: string;
    durationRaw: number;
    album?: AlbumData;
    stream: TrackData<Metadata>['stream'];
    thumbnail?: string;
    requestBridgeContent: TrackData<Metadata>['requestBridgeContent'];
    metadata?: Metadata
    url: string
    source: string
    popularity?: number

    constructor(options: TrackData<Metadata>) {
        this.name = options.name
        this.album = options.album
        this.artists = options.artists
        this.duration = options.duration
        this.durationRaw = options.durationRaw
        this.stream = options.stream
        this.requestBridgeContent = options.requestBridgeContent
        this.metadata = options.metadata
        this.thumbnail = options.thumbnail
        this.url = options.url
        this.source = options.source ?? "UNKNOWN SOURCE"
        this.popularity = options.popularity
    }

    setMetadata(metadata: Metadata) {
        this.metadata = metadata
    }
}