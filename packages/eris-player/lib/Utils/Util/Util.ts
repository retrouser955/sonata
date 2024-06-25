import internal from "stream"
import { FFmpeg } from "../FFmpeg/FFmpeg"
import { FFmpegLocatingAgent, VALID_FFMPEG_LIBS } from "../../Constants/ValidFFmpegLibs"
import { execSync } from "child_process"

export interface FFmpegReturn extends FFmpegLocatingAgent {
    version: string
}

export class Util {
    static createFFmpegArgs(args: Record<string, string | number | void>) {
        const a = Object.entries(args).map((v, i) => {
            const isKey = i % 2 === 1

            const returnData = isKey ? `-${v}` : v.toString()

            return returnData
        })

        return a
    }

    static createFFmpegStream(stream: string | internal.Readable, args: string[], format?: string | null, mod?: FFmpegLocatingAgent) {
        const ffmpegProcess = new FFmpeg(mod)
        const ffmpegArgs: string[] = [
            ...args,
            ...this.createFFmpegArgs({
                f: format || "s16le",
                acodec: format === "opus" ? "libopus" : "pcm_s16le",
            }),
            "pipe:"
        ]

        let returnStream: internal.Readable
        
        if(typeof stream !== "string") {
            ffmpegArgs.push("-i", "pipe:")

            ffmpegProcess.spawnProcess(...ffmpegArgs)

            stream.pipe(ffmpegProcess.process!.stdin)

            returnStream = ffmpegProcess.process!.stdout
        } else {
            ffmpegArgs.push("-i", stream)

            ffmpegProcess.spawnProcess(...ffmpegArgs)

            returnStream = ffmpegProcess.process!.stdout
        }

        return returnStream
    }

    static getFFmpegLib(mod?: FFmpegLocatingAgent): FFmpegReturn|null|undefined {
        if(mod) {
            return {
                ...mod,
                version: execSync(`${mod.getPath()} -version`).toString().split("\n")[0]
            }
        }
        
        for(let lib of VALID_FFMPEG_LIBS) {
            const isLib = lib.getPath()
            if(isLib) {
                try {
                    execSync(isLib + " -version")
                    return {
                        ...lib,
                        version: execSync(`${isLib} -version`).toString().split("\n")[0]
                    }
                } catch {
                    continue;
                }
            }
        }
    }

    static createTimeCode(ms: number) {
        let seconds = ms / 1000
        const hours = Math.round(seconds / 3600)
        seconds = seconds % 3600
        const minutes = Math.round(seconds / 60)
        seconds = seconds % 60

        return `${this.padZero(hours)}:${this.padZero(minutes)}:${this.padZero(seconds)}`
    }

    private static padZero(num: number) {
        // Don't flame me. Stack Overflow said this is the most efficient
        // also thank you github.com/itsLimeNade
        return num >= 10 ? num + "" : "0" + num
    }
}