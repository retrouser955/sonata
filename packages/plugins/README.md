# \[WIP\] Sonata Plugins

[![Stand With Ukraine](https://raw.githubusercontent.com/vshymanskyy/StandWithUkraine/main/badges/StandWithUkraine.svg)](https://stand-with-ukraine.pp.ua)

A plugin library to add sources for [Sonata.js](https://www.npmjs.com/package/sonata.js)

![eris player logo](../../assets/Sonata.png)

This package provides `sonata` with 4 sources. YouTube, Deezer, SoundCloud and Spotify

```ts
import { YoutubePlugin } from "@sonatajs/plugins"

const player = getPlayerSomehow()

player.plugins.add(new YoutubePlugin())
```

#### Or add it directly

```ts
new MusicClient(erisClient, {
    plugins: [new YoutubePlugin()]
})
```