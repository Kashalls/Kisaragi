import Kuroshiro from "kuroshiro";
import KuromojiAnalyzer from "kuroshiro-analyzer-kuromoji";

exports.run = async (client: any, message: any, args: string[]) => {
    const kuroshiro = new Kuroshiro();
    await kuroshiro.init(new KuromojiAnalyzer());

    let input = client.combineArgs(args, 1);
    let result = await kuroshiro.convert(input, {mode: "spaced", to: "katakana"});
    let cleanResult = result.replace(/<\/?[^>]+(>|$)/g, "");

    let katakanaEmbed = client.createEmbed();
    katakanaEmbed
    .setAuthor("kuroshiro", "https://kuroshiro.org/kuroshiro.png")
    .setTitle(`**Katakana Conversion** ${client.getEmoji("kannaSip")}`)
    .setDescription(`${client.getEmoji("star")}${cleanResult}`);
    message.channel.send(katakanaEmbed);
}