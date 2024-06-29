import Eris from "eris"
import { MuiscEvents, MusicClient } from "sonata.js"

const client = new Eris.Client("", {
    intents: [
        "guildMessages",
        "guildVoiceStates"
    ]
})

interface QueueMetadata {
    channel: Eris.Channel
}

interface TrackMetadata {
    requestedUser: Eris.User
}

const player = new MusicClient(client)

client.on("messageCreate", (message) => {
    
})

player.on(MuiscEvents.TrackStart, (queue, track, lastTrack) => {
    const metadata = (queue.metadata as any as QueueMetadata)

    client.createMessage(metadata.channel.id, {
        embeds: [
            {
                title: "A new track is starting",
                description: `**name:** [${track.name}](${track.url})\n**artists:** ${track.artists.map((v) => v.name).join(", ")}`,
                color: 0xFF00FF,
                footer: {
                    text: `Requested by ${(track.metadata as any as TrackMetadata).requestedUser.username}`,
                    icon_url: (track.metadata as any as TrackMetadata).requestedUser.dynamicAvatarURL("png")
                },
                thumbnail: track.thumbnail ? { url: track.thumbnail } : undefined
            }
        ]
    })
})

client.connect()