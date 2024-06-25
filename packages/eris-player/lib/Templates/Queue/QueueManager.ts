import { MusicClient } from "../../Constructs/MusicClient";
import { Queue, QueueOptions } from "./Queue";

export class QueueManager {
    musCli: MusicClient
    queues = new Map<string, Queue<unknown>>()

    constructor(musicClient: MusicClient) {
        this.musCli = musicClient
    }

    create<T>(guildId: string, options?: QueueOptions<T>) {
        if(this.queues.has(guildId)) return this.queues.get(guildId)

        const queue = new Queue<T>(this.musCli, options, guildId)
        this.queues.set(guildId, queue)
    
        return queue
    }

    get(guildId: string) {
        return this.queues.get(guildId)
    }

    exists(guildId: string) {
        return this.queues.has(guildId)
    }

    async delete(guildId: string, force = false) {
        const currentQueue = this.get(guildId)
        if(!currentQueue) return

        try {
            await currentQueue.handleExit()

            this.queues.delete(guildId)
        } catch (error) {
            this.musCli.debug(`Unable to delete queue of guild: ${guildId}`, String(error))

            if(force) this.queues.delete(guildId)
        }
    }
}