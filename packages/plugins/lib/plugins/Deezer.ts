import { BasePlugin } from "eris-player";
import { SourceRegex } from "../Constants/Regex";

export class DeezerPlugin extends BasePlugin<null> {
    name: string = "eris-player-defaults.deezerplugin"

    validate(query: string): boolean {
        for(let regex of SourceRegex.deezer) {
            if(regex.test(query)) return true
        }
        return false
    }
}