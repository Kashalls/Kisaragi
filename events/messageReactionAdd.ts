import {MessageEmbed, MessageReaction, User} from "discord.js"
import {Embeds} from "./../structures/Embeds"
import {Kisaragi} from "./../structures/Kisaragi"
import {SQLQuery} from "./../structures/SQLQuery"
const active = new Set()

export default class MessageReactionAdd {
    constructor(private readonly discord: Kisaragi) {}

    public run = async (reaction: MessageReaction, user: User) => {
        if (user.id === this.discord.user!.id) return
        const sql = new SQLQuery(reaction.message)
        const embeds = new Embeds(this.discord, reaction.message)
        const retriggerEmbed = async (reaction: MessageReaction) => {
            if (!reaction.message.partial) return
            reaction.message = await reaction.message.fetch()
            if (reaction.message.author.id === this.discord.user!.id) {
                if (active.has(reaction.message.id)) return
                const newArray = await sql.selectColumn("collectors", "message", true)
                let cached = false
                for (let i = 0; i < newArray.length; i++) {
                    if (newArray[i][0] === reaction.message.id.toString()) {
                        cached = true
                    }
                }
                if (cached) {
                    const messageID = await sql.fetchColumn("collectors", "message", "message", reaction.message.id)
                    if (String(messageID)) {
                        const cachedEmbeds = await sql.fetchColumn("collectors", "embeds", "message", reaction.message.id)
                        const collapse = await sql.fetchColumn("collectors", "collapse", "message", reaction.message.id)
                        const page = await sql.fetchColumn("collectors", "page", "message", reaction.message.id)
                        const help = await sql.fetchColumn("collectors", "help", "message", reaction.message.id)
                        const download = await sql.fetchColumn("collectors", "download", "message", reaction.message.id)
                        const newEmbeds: MessageEmbed[] = []
                        for (let i = 0; i < cachedEmbeds.length; i++) {
                            newEmbeds.push(new MessageEmbed(JSON.parse(cachedEmbeds[i])))
                        }
                        active.add(reaction.message.id)
                        if (help && !download) {
                            embeds.editHelpEmbed(reaction.message, reaction.emoji.name, user, newEmbeds)
                        } else {
                            embeds.editReactionCollector(reaction.message, reaction.emoji.name, user, newEmbeds, Boolean(collapse), Boolean(download), Number(page))
                        }
                    }
                } else {
                    return
                }
            }
        }
        retriggerEmbed(reaction)

        const addReactionRole = async (reaction: MessageReaction, user: User) => {
            const reactionroles = await sql.fetchColumn("special roles", "reaction roles")
            if (!reactionroles?.[0]) return
            for (let i = 0; i < reactionroles.length; i++) {
                const reactionrole = JSON.parse(reactionroles[i])
                if (!reactionrole.state || reactionrole.state === "off") continue
                if (reactionrole.message !== reaction.message.id) continue
                if (reactionrole.emoji === reaction.emoji.toString()) {
                    const member = reaction.message.guild?.members.cache.get(user.id)
                    const exists = member?.roles.cache.get(reactionrole.role)
                    if (exists) return
                    try {
                        const roleName = reaction.message.guild?.roles.cache.get(reactionrole.role)?.name
                        await reaction.message.member?.roles.add(reactionrole.role)
                        if (reactionrole.dm === "on") {
                            const dmEmbed = embeds.createEmbed()
                            dmEmbed
                            .setAuthor("reaction role", "https://cdn.discordapp.com/emojis/589152499617759232.gif")
                            .setTitle(`**Reaction Role Add** ${this.discord.getEmoji("gabYes")}`)
                            .setDescription(`${this.discord.getEmoji("star")}Added the role **${roleName}** in the guild **${reaction.message.guild?.name}**`)
                            await user.send(dmEmbed).catch(() => null)
                        }
                    } catch {
                        const foundMsg = await this.discord.fetchMessage(reaction.message, reactionrole.message)
                        try {
                            await foundMsg?.channel.send(`I need the **Manage Roles** permission in order to add this reaction role ${this.discord.getEmoji("kannaFacepalm")}`)
                        } catch {
                            await user.send(`I need the **Manage Roles** permission in order to add this reaction role ${this.discord.getEmoji("kannaFacepalm")}`)
                            .catch(() => null)
                        }
                    }
                }
            }
        }
        addReactionRole(reaction, user)
    }
}
