import { BasePlugin } from "sonata.js";
import { SourceRegex } from "../Constants/Regex";

export class DeezerPlugin extends BasePlugin<null> {
    name: string = "sonata-defaults.deezerplugin"

    validate(query: string): boolean {
        for(let regex of SourceRegex.deezer) {
            if(regex.test(query)) return true
        }
        return false
    }
}