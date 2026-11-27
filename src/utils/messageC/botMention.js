const { Message } = require('discord.js');
const getGifById = require('../getGifById');
require('dotenv').config();

function getRandom(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const answers = new Map([
  [1, 'Ja!'],
  [2, 'Nein!'],
  [3, 'Vielleicht!'],
  [4, 'Frag erneut!'],
  [5, 'Niemals!'],
  [6, 'Darauf habe ich keine Antwort!'],
  [7, 'Ist das nicht eindeutig?'],
  [8, 'Formuliere die Frage bitte klarer.'],
  [9, 'Ja, Ja und nochmal Ja!'],
  [10, 'Darüber sollte demokratisch abgestimmt werden.'],
  [11, 'Ich denke nicht.'],
  [12, 'Ich werde darüber nachdenken.'],
  [13, 'Auf jeden Fall!'],
  [14, 'Nö :P'],
  [15, 'Yep!'],
  [16, 'Leider nicht. :('],
  [17, 'Ich fürchte du bist nicht berechtigt diese Antwort zu erfahren.'],
  [18, 'Eher nicht.'],
  [19, 'Wie bitte? Wurde ich etwas gefragt?'],
  [20, 'Ich bin leider im "Nein-Modus"!'],
  [21, 'Schlag Seite 394 auf, dort steht die Antwort.'],
  [22, 'ERROR: Question to difficult!'],
  [23, 'Vielleicht ein anderes Mal.'],
  [24, 'Unter anderen Umständen wäre das sicherlich denkbar.'],
  [25, 'Gewiss.'],
  [26, 'In der Tat.'],
  [27, 'Ja, so steht es in der Bibel geschrieben!'],
  [28, 'Ich bin noch unentschlossen.'],
  [29, 'Ich prüfe das...'],
  [30, 'Denk noch einmal genau über deine Frage nach.'],
  [31, '42'],
  [32, 'Alex weiß auf alles die Antwort, frag bitte sie.'],
  [33, 'Die Antwort ist das Gegenteil von dem, was Jonas antworten würde.'],
  [34, 'Ich schmolle und werde deshalb nicht antworten!'],
  [35, 'Nur wenn heute Sonntag ist!'],
  [36, 'So eine dreiste Frage beantworte ich nicht.'],
  [37, 'Wenn du mich sowas nochmal fragst, passiert irgendwas!'],
  [38, 'What would Jesus do?'],
  [39, 'Nur wenn du mir Kekse gibst.'],
  [40, 'Gegen eine kleine Spende könnte ich dem zustimmen.'],
]);

/**
 *
 * @param {Message} message
 * @returns
 */
async function botMention(message) {
  console.log(`Miesmuschel was mentioned`);
  const number = getRandom(1, answers.size);

  const response = await fetch(
    `https://discord.com/api/v10/channels/${message.channel.id}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bot ${process.env.MIESMUSCHEL_ID}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: answers.get(number),
        message_reference: {
          message_id: message.id,
          channel_id: message.channel.id,
          guild_id: message.guild.id,
        },
        allowed_mentions: {
          replied_user: true,
        },
      }),
    },
  );
  console.log(
    `Bot Mention Response: ${response.status} ${response.statusText}`,
  );
}

module.exports = botMention;
