export const SourceRegex = {
    soundCloud: /(^(https:)\/\/(soundcloud.com)\/)/,
    spotify: /(^(https:)\/\/(open.spotify.com)\/(track)\/)/,
    youtube: /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(-nocookie)?\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/,
    spotifyPlaylist: /(^(https:)\/\/(open.spotify.com)\/(playlist)\/)/,
    deezer: [
        /(^https:)\/\/(www\.)?deezer.com\/([a-zA-Z]+\/)?track\/[0-9]+/,
        /(^https:)\/\/(www\.)?deezer.com\/[a-zA-Z]+\/(playlist|album)\/[0-9]+(\?)?(.*)/,
        /(^https:)\/\/deezer\.page\.link\/[A-Za-z0-9]+/
    ]    
}