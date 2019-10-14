import {Message} from "discord.js"
import {Command} from "../../structures/Command"
import {Embeds} from "./../../structures/Embeds"
import {Functions} from "./../../structures/Functions"
import {Kisaragi} from "./../../structures/Kisaragi"

export default class Holiday extends Command {
    constructor(discord: Kisaragi, message: Message) {
        super(discord, message, {
            description: "Posts the daily holiday.",
            aliases: [],
            cooldown: 3
        })
    }

    public run = async (args: string[]) => {
        const discord = this.discord
        const message = this.message
        const embeds = new Embeds(discord, message)
        const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
        ]
        let inputMonth, inputDay
        if (args[1]) {
            for (let i = 0; i < monthNames.length; i++) {
                if (monthNames[i].toLowerCase() === args[1].toLowerCase()) {
                    inputMonth = i + 1
                }
            }
            if (!inputMonth) inputMonth = parseInt(args[1][0], 10)
            if (!args[2]) {
                inputDay = args[1].match(/\/\d+/g)
                if (inputDay![0]) inputDay  = parseInt(inputDay![0].replace(/\//g, ""), 10)
            } else {
                inputDay = parseInt(args[2], 10)
            }
        }
        const axios = require("axios")
        const pg1Regex = /(?<=href="\/days\/).*?(?="(> |\s))/gm
        const pg2Regex = /(?<=description" content=").*?(?="(\s))/gm
        const imageRegex = /(?<=image" content=").*?(?=(\s))/gm
        const now = new Date(Date.now())
        const month = inputMonth ? inputMonth : now.getUTCMonth() + 1
        const day = inputDay ? inputDay : now.getUTCDate()
        const year = now.getUTCFullYear()
        const data = await axios.get(`https://www.daysoftheyear.com/days/${year}/${month < 10 ? `0${month}` : month}/${day < 10 ? `0${day}` : day}/`)
        const matchArray = data.data.match(pg1Regex)
        const holidayName = Functions.toProperCase(matchArray[0].replace(/-/g, " ").replace(/\//g, ""))
        const date = `${monthNames[month - 1]} ${day}`
        const url = `https://www.daysoftheyear.com/days/${matchArray[0]}`
        const holidayData = await axios.get(url)
        const rawDescription = holidayData.data.match(pg2Regex)[0]
        const description = rawDescription.replace(/&hellip;/g, "...").replace(/&#8217;/g, "'").replace(/&#8211;/g, "-").trim()
        const image = holidayData.data.match(imageRegex)[0].replace(/"/g, "")

        const holidayEmbed = embeds.createEmbed()
        holidayEmbed
        .setAuthor("days of the year", "https://media.daysoftheyear.com/20181228141243/logo.jpg")
        .setTitle(`**Daily Holiday** ${discord.getEmoji("padoruPadoru")}`)
        .setURL(url)
        .setThumbnail(image.trim())
        .setDescription(
            `${discord.getEmoji("star")}_Holiday:_ **${date} - ${holidayName}**\n` +
            `${discord.getEmoji("star")}_Description:_ ${Functions.checkChar(description, 2000, ".")}`
            )
        message.channel.send(holidayEmbed)
    }
}