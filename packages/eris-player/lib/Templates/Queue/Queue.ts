import Eris from "eris";
import { MuiscEvents, MusicClient } from "../../Constructs/MusicClient";
import { Util } from "../../Utils/Util/Util";
import { ReadableStreamData, Track } from "../Track/Track";

export interface QueueOptions<T> {
    initialTracks?: Track<unknown>[];
    skipFFmpeg?: boolean;
    metadata?: T | null;
    leaveOnEnd?: boolean;
    deleteOnEnd?: boolean;
    loop?: QueueLoopMode;
}

export enum QueueLoopMode {
    RepeatAll = 1,
    RepeatTrack = 2,
    None = 3
}

export const DEFAULT_QUEUE_OPTIONS: QueueOptions<any> = {
    initialTracks: [],
    skipFFmpeg: false,
    metadata: {},
    leaveOnEnd: true,
    deleteOnEnd: true,
    loop: QueueLoopMode.None
}

export class Queue<T> {
    mucli: MusicClient
    vcid?: string
    tracks: Track<unknown>[] = []
    initialised = 0
    options: QueueOptions<T>
    guildId = "unknownguild"
    metadata?: T | null

    constructor(cli: MusicClient, options: QueueOptions<T> = DEFAULT_QUEUE_OPTIONS, guildId: string) {
        this.mucli = cli
        this.initialised = Date.now()
        this.options = options
        this.guildId = guildId
        this.metadata = options.metadata
    }

    get isPlaying() {
       return this.connection?.playing ?? false
    }

    get queueLifetimeMS() {
        return Date.now() - this.initialised
    }

    get queueLifetime() {
        return Util.createTimeCode(Date.now() - this.initialised)
    }

    private playStream(connection: Eris.VoiceConnection, stream: ReadableStreamData | string) {
        if (typeof stream === "string") {
            const realStream = this.options.skipFFmpeg ? stream : Util.createFFmpegStream(stream, [], null, this.mucli.options.ffmpeg)

            connection?.play(realStream)
        } else {
            const realStream = this.options.skipFFmpeg ? stream.stream : Util.createFFmpegStream(stream.stream, [], stream.format, this.mucli.options.ffmpeg)

            connection?.play(realStream)
        }
    }

    private async handleEnd() {
        if (this.tracks.length === 0) {
            this.mucli.emit(MuiscEvents.QueueEmpty, this)

            if (this.options.deleteOnEnd) {
                // handle queue delete
                this.mucli.emit(MuiscEvents.QueueDelete, this.guildId)
                this.mucli.queues.delete(this.guildId)
            }

            if(this.options.leaveOnEnd && !this.options.deleteOnEnd) {
                this.connection?.disconnect()
            } 
            return
        }

        const connection = this.connection!

        if(this.options.loop === QueueLoopMode.RepeatTrack) {
            const stream = await this.tracks[0].stream()

            this.playStream(connection, stream)
            this.mucli.emit(MuiscEvents.TrackStart, this, this.tracks[0], undefined)

            return
        }

        const lastTrack = this.tracks.shift()!

        if(this.options.loop === QueueLoopMode.RepeatAll) {
            this.tracks.push(lastTrack)
        }

        const currentTrack = this.tracks[0]

        const stream = await currentTrack.stream()

        this.playStream(connection, stream)

        this.mucli.emit(MuiscEvents.TrackStart, this, currentTrack, lastTrack)
    }

    async connect(channelId: string) {
        if (this.connection) {
            this.connection.switchChannel(channelId)
        } else {
            await this.mucli.bot.joinVoiceChannel(channelId)
        }

        this.vcid = channelId

        this.connection?.on('end', this.handleEnd)

        return this.connection
    }

    get connection() {
        if (!this.vcid) throw new Error("Voice not connected")
        return this.mucli.bot.voiceConnections.get(this.vcid)
    }

    addTrack(track: Track<unknown>) {
        this.tracks.push(track)
        this.mucli.emit(MuiscEvents.TrackAdded, this, track)
    }

    removeTrack(position: number) {
        const track = this.tracks.splice(position, 1)[0]
        this.mucli.emit(MuiscEvents.TrackRemoved, this, track)
    }

    moveTracks(first: number, second: number) {
        const copy = JSON.parse(JSON.stringify(this.tracks)) as Track<unknown>[]

        this.tracks[first] = this.tracks[second]
        this.tracks[second] = copy[first]
    }

    async play() {
        if (this.isPaused) return this.connection?.resume()

        const track = this.tracks[0]

        if (!track) throw new Error("Queue is empty")

        const trackStream = await track.stream()

        if (!trackStream) throw new Error(`ERR_NO_RESULTS. Unable to get stream from track { name: ${track.name}, url: ${track.url} }`)

        this.playStream(this.connection!, trackStream)
    }

    get isPaused() {
        return this.connection?.paused
    }

    async pause() {
        this.connection?.pause()
    }

    // DO NOT CALL OUTSIDE OF <QueueManager>delete() METHOD!
    async handleExit() {
        this.tracks = []
        const connection = this.connection

        connection?.off("end", this.handleEnd)

        connection?.stopPlaying()

        connection?.disconnect()
    }

    setMetadata(data: T) {
        this.metadata = data
    }
}