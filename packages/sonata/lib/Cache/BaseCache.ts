import { SearchResults } from "../Templates/SearchResults/SearchResults";

export class BaseCache {
    constructor() {}

    async get(query: string): Promise<SearchResults|undefined|null|void> {
        throw new Error('NOT IMPLEMENTED')
    }

    async set(query: string, data: SearchResults) {
        throw new Error("NOT IMPLEMENTED")
    }
}