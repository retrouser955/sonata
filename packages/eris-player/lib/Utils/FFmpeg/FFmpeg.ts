import { ChildProcessWithoutNullStreams, spawn } from "node:child_process"
import { FFmpegLocatingAgent } from "../../Constants/ValidFFmpegLibs"
import { Util } from "../Util/Util"

let ffmpegCommand: FFmpegLocatingAgent|undefined|null
let ffmpegPath: string

export class FFmpeg {
    constructor(mod?: FFmpegLocatingAgent) {
        if(!ffmpegCommand) {
            const ffmpeg = Util.getFFmpegLib(mod)
            if(!ffmpeg) throw new Error("Unable to find ffmpeg")
            ffmpegPath = ffmpeg.getPath()!
            ffmpegCommand = ffmpeg
        }
    }

    process?: ChildProcessWithoutNullStreams

    spawnProcess(...args: string[]) {
        this.process = spawn(ffmpegPath || "ffmpeg", args)
    }
}