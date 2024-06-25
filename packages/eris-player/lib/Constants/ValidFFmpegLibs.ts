export interface FFmpegLocatingAgent {
    name: string;
    getPath: () => string|null|undefined;
    static: boolean;
}

export const VALID_FFMPEG_LIBS: FFmpegLocatingAgent[] = [
    {
        name: "ffmpeg",
        static: false,
        getPath: () => {
            return "ffmpeg"
        }
    },
    {
        name: "avconv",
        static: false,
        getPath: () => {
            return "avconv"
        }
    },
    {
        name: "./ffmpeg",
        static: false,
        getPath: () => {
            return process.platform === "win32" ? `${process.cwd()}/ffmpeg.exe` : `${process.cwd()}/ffmpeg`
        }
    },
    {
        name: "ffmpeg-static",
        static: true,
        getPath: () => {
            try {
                return (require("ffmpeg-static") as { default: string }).default;
            } catch {
                return null;
            }
        }
    }
]