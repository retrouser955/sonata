import { BasePlugin, PluginReturnSearch, Track, Playlist, Util } from "eris-player"
import Innertube, { UniversalCache, OAuth2Tokens } from "youtubei.js"
import { Video } from "youtubei.js/dist/src/parser/nodes";
import { SourceRegex } from "../Constants/Regex";
import { URL } from "url";

export interface YouTubePluginOptions {
    cache?: string|null;
    credentials?: OAuth2Tokens;
}

const YOUTUBE_INNER_REGEX = {
    playlist: /^(https:\/\/)(www\.)?youtube\.com\/playlist\?list=([^#\&\?]*).*/
}

/**
 * THIS PLUGIN IS NOT AFFILIATED WITH YOUTUBE, YOUTUBE .INC OR GOOGLE
 * BY USING THIS PLUGIN, YOU ARE AGREEING THAT THE AUTHOR OF THIS PLUGIN (retro_ig, retrouser955) IS NOT RESPONSIBLE FOR ANY DAMAGES CAUSED
 */
export class YoutubePlugin extends BasePlugin<YouTubePluginOptions> {
    youtube!: Innertube
    name: string = "com.eris-player.youtubeplugin";

    validate(query: string): boolean {
        return SourceRegex.youtube.test(query)
    }

    async init() {
        this.youtube = await Innertube.create({
            fetch: (i, init) => {
                return fetch(i, {
                    ...init // TODO: IMPLEMENT IP ROTATION
                })
            },
            cache: new UniversalCache(true, this.options.cache ?? `${process.cwd()}/.eris-player/youtube/.cache`)
        })

        if(this.options.credentials) {
            try {
                await this.youtube.session.signIn(this.options.credentials)
            } catch {
                console.warn("INVALID OAUTH2 TOKENS FOR YOUTUBE PLUGIN. RUN generateYouTubeCookie() TO GENERATE VALID ONES.")
            }
        }
    }

    buildTrackFromVideo(video: Video) {
        const youtube = this.youtube

        return new Track({
            name: video.title.text ?? "UNKNOWN VIDEO",
            thumbnail: video.thumbnails[0]?.url || "https://upload.wikimedia.org/wikipedia/commons/e/ef/Youtube_logo.png",
            artists: [
                {
                    name: video.author.name,
                    thumbnail: video.author.best_thumbnail?.url ?? video.author.thumbnails[0].url
                }
            ],
            url: `https://youtube.com/watch?v=${video.id}`,
            duration: video.duration.text,
            durationRaw: video.duration.seconds * 1000,
            async stream() {
                const info = await youtube.getBasicInfo(this.url.replace("https://youtube.com/watch?v=", ""))
                const fmt = info.chooseFormat({ type: "audio", quality: "best" })
                return fmt.decipher(youtube.session.player)
            },
            async requestBridgeContent() {
                return `${this.artists[0].name} - ${this.name}`
            },
            source: "youtube",
            popularity: video.view_count.text ? parseInt(video.view_count.text as unknown as string) : undefined
        })
    }

    async search(query: string): Promise<PluginReturnSearch> {
        if(YOUTUBE_INNER_REGEX.playlist.test(query)) {
            const playlist = new URL(query)
            const playlistID = playlist.searchParams.get("list")

            if(!playlistID) {
                console.warn("UNABLE TO EXTRACT PLAYLIST ID")
                return {
                    playlist: null,
                    tracks: []
                }
            }

            const playlistData = await this.youtube.getPlaylist(playlistID)

            let duration = 0

            const tracks = (playlistData.videos as unknown as Video[]).map(video => {
                duration += video.duration.seconds

                return this.buildTrackFromVideo(video)
            })

            const returnPlaylist = new Playlist({
                name: playlistData.info.title ?? "UNKNOWN YOUTUBE PLAYLIST",
                thumbnail: playlistData.info.thumbnails[0].url,
                duration: Util.createTimeCode(duration * 1000),
                durationRaw: duration,
                authors: playlistData.channels.map(({ author }) => ({
                    name: author.name,
                    thumbnail: author.best_thumbnail?.url ?? author.thumbnails[0].url
                })),
                url: query,
                tracks
            })

            return {
                playlist: returnPlaylist,
                tracks
            }
        }

        const search = await this.youtube.search(query, {
            type: "video"
        })

        const tracks = (search.results as any as Video[]).map((video) => {
            return this.buildTrackFromVideo(video)
        })

        return {
            playlist: null,
            tracks
        }
    }
}