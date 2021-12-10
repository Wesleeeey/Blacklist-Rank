const Discord = require('discord.js');
const db = require('quick.db');
const { token, prefix, owner } = require('./config.json')
const client = new Discord.Client();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
})

client.on('guildMemberUpdate', async (oldMember, newMember) => {
    if (db.get(`blrank_${oldMember.id}`) !== true) return;
    newMember.roles.cache.forEach(async role => {
        if (!oldMember.roles.cache.has(role.id)) {
            if (role.permissions.toArray().includes("ADMINISTRATOR") || role.permissions.toArray().includes("MANAGE_ROLES") ||
                role.permissions.toArray().includes("MANAGE_WEBHOOKS") || role.permissions.toArray().includes("KICK_MEMBERS") ||
                role.permissions.toArray().includes("BAN_MEMBERS") || role.permissions.toArray().includes("MUTE_MEMBERS") ||
                role.permissions.toArray().includes("MOVE_MEMBERS")) {
                newMember.roles.remove(role)
            }
        }
    })
})

client.on('message', async message => {
    if (message.content.startsWith(`${prefix}help`)) {
        const embed = new Discord.MessageEmbed()
            .setColor(0x2E3136)
            .setAuthor(`Page d'aide`, `https://cdn.discordapp.com/emojis/605019677424353291.png?size=96`)
            .setDescription(`\`${prefix}blr\`\nAjouter/supprimé des personnens de la blrank\n\`${prefix}check\`\nUnrank toute les personne de la blrank`)
        message.channel.send(embed)
    }
})

client.on('message', async message => {
    if (message.content.startsWith(`${prefix}check`)) {
        if (!owner.includes(message.author.id)) return message.channel.send({
            embed: {
                color: 0x2E3136,
                description: `*Vous n'avez pas assez de permission.*`
            }
        })
        message.guild.members.cache.forEach(async member => {
            if (db.get(`blrank_${member.id}`) !== true) return;
            message.react('✅')
            message.roles.cache.forEach(async role => {
                if (!message.roles.cache.has(role.id)) {
                    if (role.permissions.toArray().includes("ADMINISTRATOR") || role.permissions.toArray().includes("MANAGE_ROLES") ||
                        role.permissions.toArray().includes("MANAGE_WEBHOOKS") || role.permissions.toArray().includes("KICK_MEMBERS") ||
                        role.permissions.toArray().includes("BAN_MEMBERS") || role.permissions.toArray().includes("MUTE_MEMBERS") ||
                        role.permissions.toArray().includes("MOVE_MEMBERS")) {
                        member.roles.remove(role)
                    }
                }
            })
        })
    }
})

client.on('message', message => {
    if (message.content.startsWith(`${prefix}blr`)) {
        if (!owner.includes(message.author.id)) return message.channel.send({
            embed: {
                color: 0x2E3136,
                description: `*Vous n'avez pas assez de permission.*`
            }
        })
        let args = message.content.split(" ").slice(1, 2);
        const member = message.mentions.members.first();
        switch (args[0]) {
            case "add":
                if (!member) return message.channel.send({
                    embed: {
                        color: 0x2E3136,
                        description: `*Vous devez mentionner une personne*`
                    }
                })
                if (db.get(`blrank_${member.id}`) === null) {
                    db.set(`blrank_${member.id}`, true)
                    message.guild.members.cache.get(member.id).roles.cache.forEach(async role => {
                        message.guild.members.cache.get(member.id).roles.remove(role).catch(() => { })
                        message.channel.send({
                            embed: {
                                color: 0x2E3136,
                                description: `J'ai bien ajouté ${member} dans la blrank`
                            }
                        })
                    })
                } else {
                    message.channel.send({
                        embed: {
                            color: 0x2E3136,
                            description: `*${member} est déjà dans la blrank*`
                        }
                    })
                }
                break;
            case "remove":
                if (!member) return message.channel.send({
                    embed: {
                        color: 0x2E3136,
                        description: `*Vous devez mentionner une personne*`
                    }
                })
                if (db.get(`blrank_${member.id}`) !== null) {
                    db.delete(`blrank_${member.id}`)
                    message.channel.send({
                        embed: {
                            color: 0x2E3136,
                            description: `J'ai bien retiré ${member} de la blrank`
                        }
                    })
                } else {
                    message.channel.send({
                        embed: {
                            color: 0x2E3136,
                            description: `*${member} n'est pas dans la blrank*`
                        }
                    })
                }
                break;
            case "list":
                var content = ""
                const blrank = db
                    .all()
                    .filter((data) => data.ID.startsWith(`blrank_`))
                    .sort((a, b) => b.data - a.data);
                for (let i in blrank) {
                    if (blrank[i].data === null) blrank[i].data = 0;

                    let userData = client.users.cache.get(blrank[i].ID.split("_")[1])
                        ? client.users.cache.get(blrank[i].ID.split("_")[1]).tag
                        : "User#0000";
                    content += `**${blrank.indexOf(blrank[i]) + 1}**. \`${userData}\`\n`
                }
                message.channel.send({
                    embed: {
                        color: 0x303136,
                        title: "Liste Blrank",
                        description: `${content}`,
                    }
                })
                break;
            default:
                message.channel.send({
                    embed: {
                        color: 0x303136,
                        description: `*Liste des sous-commandes : \`list\`, \`add\`, \`remove\`*`,
                    }
                })
                break;
        }
    }
});

client.login(token);