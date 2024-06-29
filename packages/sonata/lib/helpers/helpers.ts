import Eris from "eris";
import { HelperContext, MusicClient, getHelperContext } from "../Constructs/MusicClient";

let currentInstance: MusicClient|null

export function setMusicClient(instance: MusicClient) {
    currentInstance = instance
}

function completeCheckList(context: HelperContext | undefined) {
    if(!context) throw new Error("Unable to run a helper outside of `provideHelperContext`")
    if(!currentInstance) throw new Error("Unable to run a helper without having a MusicClient")
    if(!context.guildID) throw new Error('Unable to local Guild ID of the context')
}

export function useMusicClient() {
    return currentInstance
}

export function useQueue() {
    const context = getHelperContext()

    completeCheckList(context)

    return currentInstance!.queues.get(context!.guildID!)
}

export function useMetadata<T>() {
    const context = getHelperContext()

    completeCheckList(context)
    
    const queue = currentInstance!.queues.get(context!.guildID!)

    if(!queue) return [undefined, (metadata: T) => { currentInstance!.debug(`Cannot set metadata ${JSON.stringify(metadata)} of queue ${context!.guildID!} as it does not exists.`) }]

    return [
        queue.metadata as T,
        (metadata: T) => {
            queue.setMetadata(metadata)
        }
    ]
}