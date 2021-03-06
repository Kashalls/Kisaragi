import axios from "axios"
import {Collection, Message, MessageAttachment, MessageEmbed, MessageReaction, StreamDispatcher, User, VoiceConnection} from "discord.js"
import fs from "fs"
import path from "path"
import Soundcloud, {SoundCloudTrack} from "soundcloud.ts"
import Youtube from "youtube.ts"
import {Embeds} from "./Embeds"
import {Functions} from "./Functions"
import {Kisaragi} from "./Kisaragi"
import {Video} from "./Video"

const procBlock = new Collection()
const globalProcBlock = new Collection()

export class ProcBlock {
    public constructor(private readonly discord: Kisaragi, private readonly message: Message) {}
    public getID = () => {
        if (this.message.guild) {
            return this.message.guild.id
        } else {
            return this.message.author.id
        }
    }
    public getProcBlock = () => {
        if (procBlock.has(this.getID())) {
            return true
        } else {
            return false
        }
    }

    public setProcBlock = (remove?: boolean) => {
        if (remove) {
            procBlock.delete(this.getID())
        } else {
            procBlock.set(this.getID(), true)
        }
    }

    public getGlobalProcBlock = () => {
        if (globalProcBlock.has(this.discord.user!.id)) {
            return true
        } else {
            return false
        }
    }

    public setGlobalProcBlock = (remove?: boolean) => {
        if (remove) {
            globalProcBlock.delete(this.discord.user!.id)
        } else {
            globalProcBlock.set(this.discord.user!.id, true)
        }
    }
}
