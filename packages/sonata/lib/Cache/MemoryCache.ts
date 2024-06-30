import { SearchResults } from "../Templates/SearchResults/SearchResults";
import { BaseCache } from "./BaseCache";

export interface CachedData {
    result: SearchResults;
    timeout: NodeJS.Timeout;
}

export class MemoryCache extends BaseCache {
    options = {
        timeout: 10_000_000
    }
    #cache = new Map<string, CachedData>()

    // 2.7 hours
    constructor(timeoutDurationMS?: number|null) {
        super()

        if(timeoutDurationMS) this.options.timeout = timeoutDurationMS
    }
    
    async get(query: string): Promise<SearchResults|undefined|null|void> {
        const get = this.#cache.get(query)
        if(!get) return null
        
        clearTimeout(get.timeout)
        get.timeout = setTimeout(() => {
            this.#deleteOnEnd(query)
        }, this.options.timeout)
        this.#cache.set(query, get)

        return get.result
    }

    #deleteOnEnd(q: string) {
        this.#cache.delete(q)
    }

    async set(query: string, data: SearchResults): Promise<void> {
        this.#cache.set(query, {
            result: data,
            timeout: setTimeout(() => {
                this.#deleteOnEnd(query)
            }, this.options.timeout)
        })    
    }
}