const {
  MessageFlags,
  StringSelectMenuBuilder,
  UserSelectMenuBuilder,
  ButtonStyle,
  ButtonBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  LabelBuilder,
  ActionRowBuilder,
  PermissionsBitField,
  ChannelType,
} = require('discord.js');
const GameUser = require('../../models/GameUser');
require('../../models/Bankkonten');
require('../../models/Inventar');
const Items = require('../../models/Items');
const Tiere = require('../../models/Tiere');
const Config = require('../../models/Config');
const ActiveItems = require('../../models/ActiveItems');
const VoiceChannel = require('../../models/VoiceChannel');
const removeMoney = require('../removeMoney.js');
const giveMoney = require('../giveMoney.js');
const getGifById = require('../getGifById.js');
const { serverConfCache, confCache } = require('../data/cache');

const hugTexts = [
  (author, target) => `${author} umarmt ${target} ganz fest! Awwww! ❤️`,
  (author, target) => `Eine warme Umarmung von ${author} für ${target}! 😊`,
  (author, target) =>
    `${author} gibt ${target} eine liebevolle Umarmung. So süß! 🥰`,
  (author, target) => `Fühlt die Liebe! ${author} umarmt ${target}. ✨`,
  (author, target) =>
    `Brauchst du eine Umarmung? ${author} ist für ${target} da! 🤗`,
  (author, target) =>
    `${author} schließt ${target} in die Arme. Pure Zuneigung! 💖`,
  (author, target) => `*Umarmungsgeräusche* ${author} umarmt ${target}! 😄`,
  (author, target) =>
    `Da ist eine Umarmung von ${author} an ${target} unterwegs! Genießt es! ✨`,
  (author, target) => `So ein schöner Moment: ${author} umarmt ${target}. 🥺`,
  (author, target) => `${author} hat ${target} umarmt! Herz erwärmend! 🌡️`,
  (author, target) =>
    `Niemand ist zu cool für eine Umarmung! ${author} umarmt ${target}. 😎`,
  (author, target) => `Sende ${target} eine riesige Umarmung von ${author}! 🫂`,
  (author, target) =>
    `Die ultimative Geste der Zuneigung: ${author} umarmt ${target}. 💫`,
  (author, target) =>
    `Ein kleiner Moment der Freude, ${author} umarmt ${target}. 😊`,
  (author, target) =>
    `${author} ist heute in Umarmungslaune und hat ${target} erwischt! 🥰`,
];

const kissTexts = [
  (author, target) =>
    `${author} gibt ${target} einen sanften Kuss auf die Wange! 😙`,
  (author, target) => `Mwah! ${author} küsst ${target} liebevoll. 😘`,
  (author, target) => `Ein flüchtiger Kuss von ${author} für ${target}! ✨`,
  (author, target) => `${author} sendet ${target} einen dicken Schmatzer! 💋`,
  (author, target) => `Süße Küsse von ${author} an ${target}. 🥰`,
  (author, target) =>
    `Uhm, okay... ${author} küsst ${target}. Mal sehen, was passiert! 😉`,
  (author, target) =>
    `Ein Kuss, der Herzen verbindet: ${author} küsst ${target}! ❤️`,
  (author, target) =>
    `${author} verteilt Zuneigung in Form eines Kusses an ${target}. 💖`,
  (author, target) =>
    `Da ist ein kleiner Kuss von ${author} für ${target} unterwegs! 😚`,
  (author, target) => `Schmatz! ${author} küsst ${target} zur Begrüßung. 👋`,
  (author, target) =>
    `${author} stiehlt einen Kuss von ${target}! Frechdachs! 😏`,
  (author, target) =>
    `Manchmal sagt ein Kuss mehr als tausend Worte. ${author} küsst ${target}. 💫`,
  (author, target) => `Die Lippen treffen sich! ${author} küsst ${target}. 👀`,
  (author, target) =>
    `Ein überraschender Kuss von ${author} für ${target}! Genieß es! 🤫`,
];

const keksTexts = [
  ' frisst nen Keks!',
  ' fühlt sich nach dem Keksessen ein kleines bisschen runder. Eine gute Runde extra Bauchkraulen!',
  ' hat den Keks genüsslich verschlungen. Der Gürtel sitzt jetzt irgendwie... gemütlicher.',
  ' spürt, wie sich der Keks direkt auf die Hüften legt. Mehr zum Liebhaben!',
  ' hat sich einen Keks gegönnt und der Waage einen kleinen Schock verpasst. Aber hey, Glück ist keine Frage der Größe!',
  ' hat Keks-Energie getankt! Bereit für ein Nickerchen. Oder noch einen Keks?',
  ' genießt das Gefühl der vollen Magen. Ein Keks war genau das, was gebraucht wurde!',
  ' hat sich soeben in eine glückliche Keks-Komawurst verwandelt. Weiter so!',
  ' hat das Geräusch des Keks-Knusperns noch im Ohr. Und das Gewicht auf den Rippen.',
  ' ist jetzt offiziell Keks-beauftragt für Gemütlichkeit. Glückwunsch zur Gewichtszunahme!',
  ' hat den Keks mit einem zufriedenen Seufzer verputzt. Die Welt ist jetzt ein besserer, süßerer Ort.',
  ' hat den Keks regelrecht inhaliert! Die Waage lacht. Und dann weint sie leise.',
  ' hat bewiesen, dass Kekse nicht nur gut schmecken, sondern auch beim Winterfell helfen. Gewichtszunahme erfolgreich!',
  " hat nun offiziel den Status 'Kuschelweich dank Keks' erreicht.",
  ' ist jetzt nicht nur im Herzen, sondern auch im Bauch ein Keks-Liebhaber. Und das sieht man!',
  ' hat den Keks nicht gegessen, sondern adoptiert und in den Magen einziehen lassen. Die Waage freut sich mit!',
  ' spürt die Macht des Kekses! Eine neue, gemütliche Ära beginnt.',
  ' hat den Keks heldenhaft bekämpft... und verloren. Aber ein leckerer Verlust!',
  ' ist jetzt quasi eine keksgefüllte Piñata. Vorsicht beim Umarmen!',
  ' hat den Keks so schnell gegessen, dass das Universum noch nicht mit dem Zunehmen nachgekommen ist. Aber es kommt!',
  ' hat einen Keks verschlungen und fühlt sich nun bereit für ein Leben in Gemütlichkeit und süßen Träumen.',
  ' hat den Keks so erfolgreich verdrückt, dass alle nun sehr stolz sind! Gewichtszunahme: check!',
  " beweist einmal mehr, dass wir in 'LEAFing Realtiy' auch im Zunehmen Spitzenklasse sind.",
  ' hat den Keks nicht nur gegessen, sondern regelrecht ins Herz geschlossen. Oder besser gesagt: in die Hüften.',
  " ist nun offiziell das Vorzeigemodell von 'LEAFing Reality' in Sachen Keksverwertung und Gewichtszunahme.",
  " hat den Keksheldenstatus in 'LEAFing Reality' erreicht - der Bauch wächst, die Legende auch!",
  " hat den Keks verputzt und sich damit nahtlos in die Liga der gemütlichen 'LEAFing Reality'-Mitglieder eingereiht.",
  ' zeigt, dass hier auch das Zunehmen perfektioniert werden kann. Ein Keks nach dem anderen!',
  " hat den Keks nicht nur genossen, sondern auch das offizielle 'LEAFing Reality'-Siegel auf die Waage gedrückt bekommen.",
  ' ist jetzt nicht nur Mitglied, sondern auch das Schwergewicht des Servers. Glückwunsch zur Keks-Masse!',
  ' hat den Keks im Namen des Servers geopfert - für mehr Gemütlichkeit und eine extra Portion Gewicht.',
  ' hat den Keks mit voller Inbrunst verschlungen. Das Ergebnis ist sichtbar!',
  ' hat den Keks mit Bravour gemeistert und dabei die goldene Regel des Servers befolgt: Essen, bis es wehtut (vom Zunehmen).',
  ' hat den Keks 🍪 wie ein Profi vernichtet! Die Waage lacht sich ins Fäustchen... und wir auch! 😂',
  ' beweist, dass bei uns auch das Zunehmen eine Kunst ist. 🎨 Mehr Speck, mehr Spaß! 🐷',
  ' hat den Keks nicht gegessen, sondern geatmet. 🌬️💨',
  ' spürt, wie der Keks 🍪 direkt in die Wohlfühlzone wandert. Hallo, neue Polster! 👋🛋️',
  " ist jetzt offiziell im 'Keks-Koma' 😵‍💫 angekommen. Wir sind stolz auf diese Leistung! 🏆",
  ' hat den Keks verputzt und fühlt sich jetzt so rund wie eine Bowlingkugel! 🎳',
  ' hat sich soeben ein neues Lebensziel gesetzt: Noch mehr Kekse! 🎯 Und das Gewicht? Ein schöner Bonus! ✨',
  ' hat den Keks mit Liebe ❤️ und Leidenschaft verdrückt. Der Bauch dankt es mit extra Gemütlichkeit! 🤗',
  ' hat den Keks nicht verschlungen, sondern *liebevoll aufgenommen*. 🥺 Und das Gewicht? Eine schöne Erinnerung! 💖',
  ' hat den Keks als Sprungbrett für eine Karriere als Kuschelkissen genutzt. 🚀 cushions Mehr Kilos, mehr Komfort! 😴',
  ' zeigt uns, wie man richtig isst. 🍽️ Und zunimmt. 💯 Du bist ein Vorbild! 👍',
  ' ist jetzt so voll mit Keks, dass selbst die Schwerkraft stärker wird. 🌎🚀 Willkommen im Club der Schwergewichte! 🏋️',
  ' hat den Keks erfolgreich in Energie umgewandelt... und in ein paar extra Pfunde. 🔋➡️⚖️',
  ' hat erfolgreich 60g Keksmasse in 60g Körpermasse umgewandelt! 💪',
  ' ist jetzt exakt 60g schwerer und glücklicher. 🥳',
  ' hat den Keks von 60g heldenhaft bezwungen und trägt nun stolz die 60g extra Gewicht. Ein wahres Vorbild! 🏆',
  ' hat bewiesen, dass 60g Keks direkt auf die Hüften gehen können. Willkommen im Club der 60g-Gewinner! 😂',
  ' hat 60g Keks verdrückt und fühlt sich nun um 60g gemütlicher.🛋️',
  ' hat die 60g Keks so schnell verschlungen, dass das Universum noch versucht, die 60g Gewichtszunahme zu verarbeiten. 🌠',
  ' hat die 60g Keks als Grundstein für ein neues, gemütlicheres Ich gelegt. Bravo! 🧱',
  ' trägt jetzt stolze 60g mehr auf den Rippen - alles dank des köstlichen Kekses.🎉',
  ' hat die 60g Keks nicht einfach gegessen, sondern strategisch platziert. Die Waage ist beeindruckt! 📊',
  ' hat die 60g Keks in pure Liebe verwandelt - und in 60g extra zum Liebhaben. ❤️',
  ' fühlt sich nach dem Keksessen ein kleines bisschen runder. Eine gute Runde extra Bauchkraulen!',
  " spürt, wie der Keks direkt auf die Hüften wandert. Herzlichen Glückwunsch zum neuen 'Keks-Glow'!",
  ' hat den Keks genossen und fühlt sich nun bereit für ein Nickerchen. Das Gewicht? Nur ein süßer Nebeneffekt!',
  ' wundert sich, ob Kekse eigentlich auch fliegen können - denn leichter ist dadurch niemand geworden. Eher im Gegenteil!',
  ' hat den Keks wohl nicht nur gegessen, sondern auch geatmet. Das zusätzliche Gewicht ist der Beweis!',
  " ist nun offiziell im 'Team Gemütlich' angekommen. Der Keks hat ganze Arbeit geleistet!",
  " staunt nicht schlecht, wie schnell dieser Keks auf die Waage hüpft. Aber lecker war's!",
  ' hat sich mit diesem Keks einen kleinen Wohlfühlbauch angefuttert. Perfekt zum Knuddeln!',
  ' muss sich vielleicht bald neue Hosen kaufen - der Keks war einfach zu mächtig!',
  ' fühlt sich nach dem Keksessen ein bisschen wie ein rollender Hügel. Aber ein glücklicher Hügel!',
  ' hat bewiesen, dass Liebe durch den Magen geht - und sich dort auch gerne festsetzt. Keks sei Dank!',
  ' hat soeben seine persönliche Schwerkraft erhöht. Das Geheimnis? Kekse!',
  ' grinst breit, denn der Keks war es wert. Ein bisschen mehr Gewicht? Pff, Details!',
  " ist nun offiziell ein 'Keks-Champion' im Gewichtszulegen. Bravo!",
  ' merkt, wie sich jeder Keks aufs Neue in ein kleines Bäuchlein verwandelt. Komfort pur!',
  " hat nun mehr 'Substanz'. Der Keks hat's möglich gemacht!",
  " ist auf dem besten Weg, ein wahrer 'Keks-Mensch' zu werden. Das Gewicht steigt stetig!",
  ' spürt ein leichtes Vibrieren der Waage nach dem Keks. Alles im grünen Bereich - oder roten, je nach Zunahme!',
  ' hat seinen Körper mit einem Keks verwöhnt und das dankt er ihm mit ein paar zusätzlichen Gramm. Genieß es!',
  " freut sich über jeden Keks, der ihn 'voluminöser' macht. Mehr zum Kuscheln!",
  ' fühlt sich nach dem Keksessen ein kleines bisschen runder. Offenbar hilft der Keks dabei, sich tiefer in die LEAFing Reality zu erden!',
  ' spürt, wie der Keks direkt auf die Hüften wandert. Ein echter Realitätscheck für das eigene Gewicht in LEAFing Reality!',
  ' hat den Keks genossen und fühlt sich nun bereit für ein Nickerchen. Das zusätzliche Gewicht lässt dich noch tiefer in die LEAFing Reality eintauchen!',
  ' wundert sich, ob Kekse in LEAFing Reality eigentlich auch schweben können - denn leichter ist dadurch niemand geworden. Eher im Gegenteil!',
  " hat den Keks wohl nicht nur gegessen, sondern auch geatmet. Willkommen im Club der 'Realitäts-Schwergewichte' von LEAFing Reality!",
  " ist nun offiziell im 'Team Gemütlich' von LEAFing Reality angekommen. Der Keks hat ganze Arbeit geleistet!",
  " staunt nicht schlecht, wie schnell dieser Keks auf die Waage in LEAFing Reality hüpft. Aber lecker war's!",
  ' hat sich mit diesem Keks einen kleinen Wohlfühlbauch angefuttert. Perfekt, um sich in LEAFing Reality einzukuscheln!',
  ' muss sich vielleicht bald neue Hosen kaufen - der Keks war einfach zu mächtig für die LEAFing Reality-Garderobe!',
  ' fühlt sich nach dem Keksessen ein bisschen wie ein rollender Hügel. Aber ein glücklicher Hügel in LEAFing Reality!',
  ' hat bewiesen, dass Liebe durch den Magen geht - und sich dort auch gerne festsetzt. Besonders in der LEAFing Reality!',
  ' hat soeben seine persönliche Schwerkraft erhöht. Das Geheimnis in LEAFing Reality? Kekse!',
  ' grinst breit, denn der Keks war es wert. Ein bisschen mehr Gewicht in LEAFing Reality? Pff, Details!',
  " ist nun offiziell ein 'Keks-Champion' im Gewichtszulegen in LEAFing Reality. Bravo!",
  ' merkt, wie sich jeder Keks aufs Neue in ein kleines Bäuchlein verwandelt. Komfort pur in LEAFing Reality!',
  " hat nun mehr 'Substanz', um sich in LEAFing Reality zu behaupten. Der Keks hat's möglich gemacht!",
  " ist auf dem besten Weg, ein wahrer 'Keks-Mensch' von LEAFing Reality zu werden. Das Gewicht steigt stetig!",
  ' spürt ein leichtes Vibrieren der Waage nach dem Keks. Alles im grünen Bereich - oder roten, je nach Zunahme in LEAFing Reality!',
  ' hat seinen Körper mit einem Keks verwöhnt und das dankt er ihm mit ein paar zusätzlichen Gramm. Genieß es in LEAFing Reality!',
  " freut sich über jeden Keks, der ihn 'voluminöser' macht. Mehr zum Kuscheln in LEAFing Reality!",
];

async function useItems(interaction, client) {
  try {
    if (interaction.customId.includes('tier')) {
      await useItemTier(interaction);
    } else if (interaction.customId.includes('farbrolle')) {
      await useItemFarbrolle(interaction);
    } else if (interaction.customId.includes('voicechannel')) {
      await useItemVoiceChannel(interaction, client);
    } else if (interaction.customId.includes('rolleNamensliste')) {
      await useItemRolleNamensliste(interaction);
    } else if (interaction.customId.includes('doppelteXp_activate')) {
      await useItemDoppelteXp(interaction);
    } else if (interaction.customId.includes('obersterPlatz_activate')) {
      await useItemObersterPlatz(interaction);
    } else if (interaction.customId.includes('bankkontoUpgrade_activate')) {
      await useItemBankkontoUpgrade(interaction);
    } else if (interaction.customId.includes('umarmung_select')) {
      await useItemUmarmung(interaction);
    } else if (interaction.customId.includes('kuss_select')) {
      await useItemKuss(interaction);
    } else if (interaction.customId.includes('bombe')) {
      await useItemBombe(interaction);
    } else if (interaction.customId.includes('BlattläuseKlauBanane_select')) {
      await useItemBlattläuseKlauBanane(interaction);
    } else if (interaction.customId.includes('schuldschein_select')) {
      await useItemSchuldschein(interaction);
    } else if (interaction.customId.includes('keks')) {
      await useItemKeks(interaction);
    } else if (interaction.customId.includes('useItem_selectMenu')) {
      let itemName;
      if (interaction.isStringSelectMenu()) {
        itemName = interaction.values[0];
      } else {
        itemName = interaction.customId.split('useItem_selectMenu_')[1];
      }
      let firstRow;
      let content = 'Modal';
      let modal;
      switch (itemName) {
        case 'Tier': {
          const youButton = new ButtonBuilder()
            .setLabel('Selbst')
            .setStyle(ButtonStyle.Primary)
            .setCustomId(`useItem_tier_self`);
          const otherButton = new ButtonBuilder()
            .setLabel('Verschenken')
            .setStyle(ButtonStyle.Primary)
            .setCustomId(`useItem_tier_other`);
          firstRow = new ActionRowBuilder().addComponents(
            youButton,
            otherButton,
          );
          content = `Möchtest du das Tier für dich selbst oder es jemandem schenken?`;
          break;
        }
        case 'Bombe': {
          const selectMenu = new UserSelectMenuBuilder()
            .setCustomId('useItem_bombe_uselect')
            .setPlaceholder(
              'Wähle einen Nutzer aus, der die Bombe erhalten soll.',
            )
            .setMinValues(1)
            .setMaxValues(1);
          firstRow = new ActionRowBuilder().addComponents(selectMenu);
          content = `Wähle einen Nutzer aus, der die Bombe erhalten soll.`;
          break;
        }
        case 'Farbrolle': {
          modal = new ModalBuilder()
            .setTitle('Farbrolle erstellen')
            .setCustomId(`useItem_farbrolle`);
          const colorInput = new TextInputBuilder()
            .setCustomId('useItem_farbrolle_color')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(7);
          const colorInputLabel = new LabelBuilder()
            .setLabel('Farbe (Hex-Code):')
            .setTextInputComponent(colorInput);
          const rollenName = new TextInputBuilder()
            .setCustomId('useItem_farbrolle_name')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(15);
          const rollenNameLabel = new LabelBuilder()
            .setLabel('Name der Rolle:')
            .setTextInputComponent(rollenName);
          modal.addLabelComponents(colorInputLabel, rollenNameLabel);
          break;
        }
        case 'Voicechannel': {
          modal = new ModalBuilder()
            .setTitle('Voicechannel erstellen')
            .setCustomId(`useItem_voicechannel`);
          const channelNameInput = new TextInputBuilder()
            .setCustomId('useItem_voicechannel_name')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(100);
          const channelNameInputLabel = new LabelBuilder()
            .setLabel('Name des Voicechannels:')
            .setTextInputComponent(channelNameInput);
          modal.addLabelComponents(channelNameInputLabel);
          break;
        }
        case 'Rolle (Namensliste)': {
          modal = new ModalBuilder()
            .setTitle('Rolle erstellen')
            .setCustomId(`useItem_rolleNamensliste`);
          const rollenNameInput = new TextInputBuilder()
            .setCustomId('useItem_rolleNamensliste_name')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(100);
          const rollenNameInputLabel = new LabelBuilder()
            .setLabel('Name der Rolle:')
            .setTextInputComponent(rollenNameInput);
          modal.addLabelComponents(rollenNameInputLabel);
          break;
        }
        case 'Umarmung': {
          const selectMenu = new UserSelectMenuBuilder()
            .setCustomId('useItem_umarmung_select')
            .setPlaceholder('Wähle einen Nutzer aus, den du umarmen möchtest.')
            .setMinValues(1)
            .setMaxValues(1);
          firstRow = new ActionRowBuilder().addComponents(selectMenu);
          content = `Wähle einen Nutzer aus, den du umarmen möchtest.`;
          break;
        }
        case 'Küsse': {
          const selectMenu = new UserSelectMenuBuilder()
            .setCustomId('useItem_kuss_select')
            .setPlaceholder('Wähle einen Nutzer aus, den du küssen möchtest.')
            .setMinValues(1)
            .setMaxValues(1);
          firstRow = new ActionRowBuilder().addComponents(selectMenu);
          content = `Wähle einen Nutzer aus, den du küssen möchtest.`;
          break;
        }
        case 'Doppelte XP': {
          const activateButton = new ButtonBuilder()
            .setLabel('Aktivieren')
            .setStyle(ButtonStyle.Success)
            .setCustomId(`useItem_doppelteXp_activate`);
          firstRow = new ActionRowBuilder().addComponents(activateButton);
          content = `Möchtest du die doppelten XP aktivieren?`;
          break;
        }
        case 'Oberster Platz': {
          const activateButton = new ButtonBuilder()
            .setLabel('Aktivieren')
            .setStyle(ButtonStyle.Success)
            .setCustomId(`useItem_obersterPlatz_activate`);
          firstRow = new ActionRowBuilder().addComponents(activateButton);
          content = `Möchtest du den obersten Platz aktivieren?`;
          break;
        }
        case 'Klau-Banane': {
          const selectMenu = new UserSelectMenuBuilder()
            .setCustomId('useItem_BlattläuseKlauBanane_select')
            .setPlaceholder(
              `Wähle einen Nutzer aus, dessen ${confCache.get(interaction.guild.id).get('MONEY_NAME')} du klauen möchtest.`,
            )
            .setMinValues(1)
            .setMaxValues(1);
          firstRow = new ActionRowBuilder().addComponents(selectMenu);
          content = `Wähle einen Nutzer aus, dessen ${confCache.get(interaction.guild.id).get('MONEY_NAME')} du klauen möchtest.`;
          break;
        }
        case 'Schuldschein': {
          const selectMenu = new UserSelectMenuBuilder()
            .setCustomId('useItem_schuldschein_select')
            .setPlaceholder(
              'Wähle einen Nutzer aus, dem du den Schuldschein geben möchtest.',
            )
            .setMinValues(1)
            .setMaxValues(1);
          firstRow = new ActionRowBuilder().addComponents(selectMenu);
          content = `Wähle einen Nutzer aus, dem du den Schuldschein geben möchtest.`;
          break;
        }
        case 'Bankkonto Upgrade': {
          const activateButton = new ButtonBuilder()
            .setLabel('Aktivieren')
            .setStyle(ButtonStyle.Success)
            .setCustomId(`useItem_bankkontoUpgrade_activate`);
          firstRow = new ActionRowBuilder().addComponents(activateButton);
          content = `Möchtest du das Bankkonto-Upgrade aktivieren?`;
          break;
        }
        case 'Keks': {
          const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(`useItem_keks_select}`)
            .setPlaceholder('Was möchtest du tun?')
            .addOptions([
              { label: 'Essen', value: 'essen' },
              { label: 'Verschenken', value: 'schenken' },
            ]);
          firstRow = new ActionRowBuilder().addComponents(selectMenu);
          content = `Möchtest du den Keks essen oder verschenken?`;
          break;
        }
        default:
          await interaction.update({
            content: `Das Item ${itemName} kann nicht benutzt werden.`,
            flags: MessageFlags.Ephemeral,
          });
          return;
      }
      if (content === 'Modal') {
        await interaction.showModal(modal);
      } else {
        await interaction.update({
          content: content,
          components: [firstRow],
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  } catch (error) {
    console.log(error);
  }
}

async function useItemTier(interaction) {
  if (interaction.customId.includes('self_select')) {
    const tierart = interaction.values[0];
    const user = await GameUser.findOne({
      userId: interaction.user.id,
    }).populate({
      path: 'inventar',
      populate: { path: 'items.item', model: 'Items' },
    });
    const randomTierOhneBesitzer = await getRandomTier(tierart);
    if (randomTierOhneBesitzer.length === 0) {
      await interaction.update({
        content: 'Es gibt leider keine verfügbaren Tiere dieser Art!',
        components: [],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    const itemId = user.inventar.items.findIndex(
      (item) => item.item.name === 'Tier',
    );
    if (user.inventar.items[itemId].quantity > 1) {
      user.inventar.items[itemId].quantity -= 1;
    } else if (user.inventar.items[itemId].quantity === 1) {
      user.inventar.items.splice(itemId, 1);
    } else {
      await interaction.update({
        content: 'Du hast kein Tier in deinem Inventar!',
        components: [],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    await interaction.update({
      content: `Du hast erfolgreich ein Tier der Art **${tierart}** mit dem tollen namen **${randomTierOhneBesitzer[0].customName}** erhalten!`,
      files: [`./animals/${randomTierOhneBesitzer[0].pfad}.webp`],
      components: [],
      flags: MessageFlags.Ephemeral,
    });
    await Tiere.findByIdAndUpdate(randomTierOhneBesitzer[0]._id, {
      besitzer: user._id,
    });
    await user.inventar.save();
  } else if (interaction.customId.includes('other_uselect')) {
    const targetUser = interaction.values[0];
    const tierarten = await getTierarten();
    if (tierarten.length === 0 || tierarten[0].tierarten.length === 0) {
      await interaction.update({
        content: 'Es gibt leider keine verfügbaren Tiere!',
        components: [],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId(`useItem_tier_other_select_${targetUser}`)
      .setPlaceholder('Wähle ein Tier aus')
      .addOptions(
        tierarten[0].tierarten.map((tierart) => ({
          label: tierart,
          value: tierart,
        })),
      );
    const row = new ActionRowBuilder().addComponents(selectMenu);
    await interaction.update({
      content: 'Wähle ein Tier aus, das du besitzen möchtest:',
      components: [row],
      flags: MessageFlags.Ephemeral,
    });
  } else if (interaction.customId.includes('other_select')) {
    const tierart = interaction.values[0];
    const targetUserId = interaction.customId.split('_')[4];
    const yesButton = new ButtonBuilder()
      .setLabel('Ja')
      .setStyle(ButtonStyle.Primary)
      .setCustomId(`useItem_tier_other_yesname_${tierart}_${targetUserId}`);
    const noButton = new ButtonBuilder()
      .setLabel('Nein')
      .setStyle(ButtonStyle.Danger)
      .setCustomId(`useItem_tier_other_noname_${tierart}_${targetUserId}`);
    const row = new ActionRowBuilder().addComponents(yesButton, noButton);
    await interaction.update({
      content: 'Möchtest du dem Tier einen Namen geben?',
      components: [row],
      flags: MessageFlags.Ephemeral,
    });
  } else if (interaction.customId.includes('other_yesname')) {
    const tierart = interaction.customId.split('_')[4];
    const targetUserId = interaction.customId.split('_')[5];
    const modal = new ModalBuilder()
      .setTitle(`Umbenennen von ${tierart}`)
      .setCustomId(`useItem_tier_other_modal_${tierart}_${targetUserId}`);
    const textInput = new TextInputBuilder()
      .setCustomId('rename-input')
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setMaxLength(30);
    const textInputLabel = new LabelBuilder()
      .setLabel('Wie soll das Tier heißen?')
      .setTextInputComponent(textInput);
    modal.addLabelComponents(textInputLabel);
    await interaction.showModal(modal);
  } else if (
    interaction.customId.includes('other_modal') ||
    interaction.customId.includes('other_noname')
  ) {
    const tierart = interaction.customId.split('_')[4];
    const targetUserId = interaction.customId.split('_')[5];
    let customName = undefined;
    if (interaction.customId.includes('other_modal')) {
      customName = interaction.fields.getTextInputValue('rename-input');
    }
    const user = await GameUser.findOne({
      userId: interaction.user.id,
    }).populate({
      path: 'inventar',
      populate: { path: 'items.item', model: 'Items' },
    });
    const targetUser = await GameUser.findOne({ userId: targetUserId });
    const randomTierOhneBesitzer = await getRandomTier(tierart);
    if (randomTierOhneBesitzer.length === 0) {
      await interaction.update({
        content: 'Es gibt leider keine verfügbaren Tiere dieser Art!',
        components: [],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    const itemId = user.inventar.items.findIndex(
      (item) => item.item.name === 'Tier',
    );
    if (user.inventar.items[itemId].quantity > 1) {
      user.inventar.items[itemId].quantity -= 1;
    } else {
      user.inventar.items.splice(itemId, 1);
    }
    user.inventar.save();
    await interaction.update({
      content: `Du hast erfolgreich ein Tier der Art **${tierart}** mit dem tollen Namen **${customName}** an <@${targetUserId}> verschenkt!`,
      files: [`./animals/${randomTierOhneBesitzer[0].pfad}.webp`],
      components: [],
      flags: MessageFlags.Ephemeral,
    });
    await interaction.channel.send({
      content: `<@${targetUserId}> du hast ein Tier der Art **${tierart}** mit dem tollen Namen **${customName}** von <@${interaction.user.id}> erhalten!`,
      files: [`./animals/${randomTierOhneBesitzer[0].pfad}.webp`],
    });
    customName = customName || randomTierOhneBesitzer[0].customName;
    await Tiere.findByIdAndUpdate(randomTierOhneBesitzer[0]._id, {
      besitzer: targetUser._id,
      customName: customName,
    });
  } else if (interaction.customId.includes('self')) {
    const tierarten = await getTierarten();
    if (tierarten.length === 0 || tierarten[0].tierarten.length === 0) {
      await interaction.update({
        content: 'Es gibt leider keine verfügbaren Tiere!',
        components: [],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('useItem_tier_self_select')
      .setPlaceholder('Wähle ein Tier aus')
      .addOptions(
        tierarten[0].tierarten.map((tierart) => ({
          label: tierart,
          value: tierart,
        })),
      );
    const row = new ActionRowBuilder().addComponents(selectMenu);
    await interaction.update({
      content: 'Wähle ein Tier aus, das du besitzen möchtest:',
      components: [row],
      flags: MessageFlags.Ephemeral,
    });
  } else if (interaction.customId.includes('other')) {
    const selectMenu = new UserSelectMenuBuilder()
      .setCustomId('useItem_tier_other_uselect')
      .setPlaceholder(
        'Wähle einen Nutzer aus, dem du ein Tier schenken möchtest.',
      )
      .setMinValues(1)
      .setMaxValues(1);
    const row = new ActionRowBuilder().addComponents(selectMenu);
    await interaction.update({
      content: 'Wähle einen Nutzer aus, dem du ein Tier schenken möchtest:',
      components: [row],
      flags: MessageFlags.Ephemeral,
    });
  }
}

async function getTierarten() {
  return await Tiere.aggregate([
    {
      $match: {
        $or: [{ besitzer: { $exists: false } }, { besitzer: null }],
      },
    },
    {
      $group: {
        _id: '$tierart',
      },
    },
    {
      $project: {
        _id: 0,
        tierart: '$_id',
      },
    },
    {
      $group: {
        _id: null,
        tierarten: { $push: '$tierart' },
      },
    },
    {
      $project: {
        _id: 0,
        tierarten: 1,
      },
    },
  ]);
}

async function getRandomTier(tierartName) {
  return await Tiere.aggregate([
    {
      $match: {
        tierart: tierartName,
        $or: [{ besitzer: { $exists: false } }, { besitzer: null }],
      },
    },
    {
      $sample: { size: 1 },
    },
  ]);
}

async function useItemFarbrolle(interaction) {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });
  const user = await GameUser.findOne({ userId: interaction.user.id }).populate(
    { path: 'inventar', populate: { path: 'items.item', model: 'Items' } },
  );
  const itemId = user.inventar.items.findIndex(
    (item) => item.item.name === 'Farbrolle',
  );
  if (user.inventar.items[itemId].quantity > 1) {
    user.inventar.items[itemId].quantity -= 1;
  } else if (user.inventar.items[itemId].quantity === 1) {
    user.inventar.items.splice(itemId, 1);
  } else {
    await interaction.editReply({
      content: 'Du hast keine Farbrolle in deinem Inventar!',
      components: [],
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  await user.inventar.save();
  const color = interaction.fields.getTextInputValue('useItem_farbrolle_color');
  const rolename = interaction.fields.getTextInputValue(
    'useItem_farbrolle_name',
  );
  if (
    serverConfCache.get(interaction.guild.id) &&
    serverConfCache.get(interaction.guild.id).get('ADMIN_C_ID')
  ) {
    let targetChannel =
      interaction.guild.channels.cache.get(
        serverConfCache.get(interaction.guild.id).get('ADMIN_C_ID'),
      ) ||
      (await interaction.guild.channels.fetch(
        serverConfCache.get(interaction.guild.id).get('ADMIN_C_ID'),
      ));
    await targetChannel.send(
      `${interaction.member} hat die Farbrolle **${rolename}** mit der Farbe **${color}** gekauft! Bitte erstellen!`,
    );
  }
  await interaction.editReply({
    content: `Die Farbrolle **${rolename}** mit der Farbe **${color}** wurde erfolgreich an die Admins weitergeleitet!`,
    flags: MessageFlags.Ephemeral,
  });
}

async function useItemVoiceChannel(interaction, client) {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });
  const user = await GameUser.findOne({ userId: interaction.user.id }).populate(
    { path: 'inventar', populate: { path: 'items.item', model: 'Items' } },
  );
  const itemId = user.inventar.items.findIndex(
    (item) => item.item.name === 'Voicechannel',
  );
  if (user.inventar.items[itemId].quantity > 1) {
    user.inventar.items[itemId].quantity -= 1;
  } else if (user.inventar.items[itemId].quantity === 1) {
    user.inventar.items.splice(itemId, 1);
  } else {
    await interaction.editReply({
      content: 'Du hast keine Voicechannel in deinem Inventar!',
      components: [],
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  await user.inventar.save();
  const channelname = interaction.fields.getTextInputValue(
    'useItem_voicechannel_name',
  );
  if (
    serverConfCache.get(interaction.guild.id) &&
    serverConfCache.get(interaction.guild.id).get('PERMANENT_VOICE_ID')
  ) {
    const kategorie = await client.channels.fetch(
      serverConfCache.get(interaction.guild.id).get('PERMANENT_VOICE_ID'),
    );
    const channel = await kategorie.children.create({
      name: channelname,
      type: ChannelType.GuildVoice,
      permissionOverwrites: [
        {
          id: interaction.user.id,
          allow: [
            PermissionsBitField.Flags.ManageChannels,
            PermissionsBitField.Flags.ManageRoles,
          ],
        },
      ],
    });
    const newVoiceChannel = new VoiceChannel({
      name: channelname,
      permanent: true,
      guildId: interaction.guild.id,
      channelId: channel.id,
      creationTime: Date.now(),
      nutzer: 0,
      userId: interaction.user.id,
    });
    await newVoiceChannel.save().catch((e) => {
      console.log(`Error saving updated VoiceChannel ${e}`);
      return;
    });
  }
  await interaction.editReply({
    content: `Der Voicechannel **${channelname}** wurde erfolgreich erstellt.`,
    flags: MessageFlags.Ephemeral,
  });
}

async function useItemRolleNamensliste(interaction) {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });
  const user = await GameUser.findOne({ userId: interaction.user.id }).populate(
    { path: 'inventar', populate: { path: 'items.item', model: 'Items' } },
  );
  const itemId = user.inventar.items.findIndex(
    (item) => item.item.name === 'Rolle (Namensliste)',
  );
  if (user.inventar.items[itemId].quantity > 1) {
    user.inventar.items[itemId].quantity -= 1;
  } else if (user.inventar.items[itemId].quantity === 1) {
    user.inventar.items.splice(itemId, 1);
  } else {
    await interaction.editReply({
      content: 'Du hast keine Rolle (Namensliste) in deinem Inventar!',
      components: [],
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  await user.inventar.save();
  const channelname = interaction.fields.getTextInputValue(
    'useItem_rolleNamensliste_name',
  );
  if (
    serverConfCache.get(interaction.guild.id) &&
    serverConfCache.get(interaction.guild.id).get('ADMIN_C_ID')
  ) {
    let targetChannel =
      interaction.guild.channels.cache.get(
        serverConfCache.get(interaction.guild.id).get('ADMIN_C_ID'),
      ) ||
      (await interaction.guild.channels.fetch(
        serverConfCache.get(interaction.guild.id).get('ADMIN_C_ID'),
      ));
    await targetChannel.send(
      `${interaction.member} hat die Rolle (Namensliste) **${channelname}** gekauft! Bitte erstellen!`,
    );
  }
  await interaction.editReply({
    content: `Die Rolle (Namensliste) **${channelname}** wurde erfolgreich an die Admins weitergeleitet!`,
    flags: MessageFlags.Ephemeral,
  });
}

async function useItemDoppelteXp(interaction) {
  const user = await GameUser.findOne({ userId: interaction.user.id }).populate(
    { path: 'inventar', populate: { path: 'items.item', model: 'Items' } },
  );
  const itemId = user.inventar.items.findIndex(
    (item) => item.item.name === 'Doppelte XP',
  );
  if (user.inventar.items[itemId].quantity > 1) {
    user.inventar.items[itemId].quantity -= 1;
  } else if (user.inventar.items[itemId].quantity === 1) {
    user.inventar.items.splice(itemId, 1);
  } else {
    await interaction.update({
      content: 'Du hast kein Doppelte XP in deinem Inventar!',
      components: [],
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  await user.inventar.save();
  let alreadyActive = false;
  const xpMultiplier = await Config.findOne({
    key: 'xpMultiplier',
    guildId: interaction.guild.id,
  });
  if (!xpMultiplier) {
    await Config.create({
      name: 'key',
      value: 2,
      guildId: interaction.guild.id,
    });
  } else if (xpMultiplier.value != '2') {
    xpMultiplier.value = '2';
    await xpMultiplier.save();
  } else {
    alreadyActive = true;
  }
  await interaction.update({
    content:
      'Du hast erfolgreich Doppelte XP aktiviert! Alle erhalten nun doppelte XP für 3 Stunde.',
    components: [],
    flags: MessageFlags.Ephemeral,
  });
  const activeItem = await ActiveItems.findOne({
    guildId: interaction.guild.id,
    itemType: 'Doppelte XP',
  });
  if (activeItem) {
    if (activeItem.endTime) {
      activeItem.endTime = new Date(activeItem.endTime.getTime() + 10800000);
      await activeItem.save();
    } else {
      activeItem.endTime = new Date(Date.now() + 10800000);
      await activeItem.save();
    }
    alreadyActive = true;
  } else {
    await ActiveItems.create({
      guildId: interaction.guild.id,
      endTime: new Date(Date.now() + 10800000),
      itemType: 'Doppelte XP',
    });
  }
  if (
    serverConfCache.get(interaction.guild.id) &&
    serverConfCache.get(interaction.guild.id).get('ALLGEMEIN_ID')
  ) {
    const targetChannel =
      interaction.guild.channels.cache.get(
        serverConfCache.get(interaction.guild.id).get('ALLGEMEIN_ID'),
      ) ||
      (await interaction.guild.channels.fetch(
        serverConfCache.get(interaction.guild.id).get('ALLGEMEIN_ID'),
      ));
    if (alreadyActive) {
      await targetChannel.send(
        `${interaction.user} hat Doppelte XP um 3 Stunde verlängert!`,
      );
    } else {
      await targetChannel.send(
        `${interaction.user} hat Doppelte XP aktiviert! Alle erhalten nun doppelte XP für 3 Stunde.`,
      );
    }
  }
}

async function useItemObersterPlatz(interaction) {
  const role =
    interaction.guild.roles.cache.get('1387041004179296439') ||
    (await interaction.guild.roles.fetch('1387041004179296439'));
  if (!role) {
    await interaction.update({
      content: 'Die Rolle "Oberster Platz" konnte nicht gefunden werden!',
      components: [],
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  const user = await GameUser.findOne({ userId: interaction.user.id }).populate(
    { path: 'inventar', populate: { path: 'items.item', model: 'Items' } },
  );
  const itemId = user.inventar.items.findIndex(
    (item) => item.item.name === 'Oberster Platz',
  );
  if (user.inventar.items[itemId].quantity > 1) {
    user.inventar.items[itemId].quantity -= 1;
  } else if (user.inventar.items[itemId].quantity === 1) {
    user.inventar.items.splice(itemId, 1);
  } else {
    await interaction.update({
      content: 'Du hast kein Oberster Platz in deinem Inventar!',
      components: [],
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  await user.inventar.save();
  await interaction.member.roles.add(role);
  await interaction.update({
    content: `Du hast erfolgreich die Rolle **Oberster Platz** für 6h erhalten erhalten!`,
    components: [],
    flags: MessageFlags.Ephemeral,
  });
  const activeItem = await ActiveItems.findOne({
    guildId: interaction.guild.id,
    itemType: 'Oberster Platz',
    user: interaction.user.id,
  });
  if (activeItem) {
    if (activeItem.endTime) {
      activeItem.endTime = new Date(activeItem.endTime.getTime() + 21600000);
      await activeItem.save();
    } else {
      activeItem.endTime = new Date(Date.now() + 21600000);
      await activeItem.save();
    }
  } else {
    await ActiveItems.create({
      guildId: interaction.guild.id,
      endTime: new Date(Date.now() + 21600000),
      itemType: 'Oberster Platz',
      user: interaction.user.id,
    });
  }
}

async function useItemBankkontoUpgrade(interaction) {
  const user = await GameUser.findOne({ userId: interaction.user.id })
    .populate({
      path: 'inventar',
      populate: { path: 'items.item', model: 'Items' },
    })
    .populate('bankkonto');
  const itemId = user.inventar.items.findIndex(
    (item) => item.item.name === 'Bankkonto Upgrade',
  );
  if (user.inventar.items[itemId].quantity > 1) {
    user.inventar.items[itemId].quantity -= 1;
  } else if (user.inventar.items[itemId].quantity === 1) {
    user.inventar.items.splice(itemId, 1);
  } else {
    await interaction.update({
      content: 'Du hast kein Bankkonto Upgrade in deinem Inventar!',
      components: [],
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  await user.inventar.save();
  user.bankkonto.zinsProzent += 1;
  await user.bankkonto.save();
  await interaction.update({
    content: `Du hast erfolgreich dein Bankkonto auf **${user.bankkonto.zinsProzent}%** Zinsen pro Tag geupgradet!`,
    components: [],
    flags: MessageFlags.Ephemeral,
  });
}

function getRandom(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function useItemUmarmung(interaction) {
  const user = await GameUser.findOne({ userId: interaction.user.id })
    .populate({
      path: 'inventar',
      populate: { path: 'items.item', model: 'Items' },
    })
    .populate('bankkonto');
  const itemId = user.inventar.items.findIndex(
    (item) => item.item.name === 'Umarmung',
  );
  if (user.inventar.items[itemId].quantity > 1) {
    user.inventar.items[itemId].quantity -= 1;
  } else if (user.inventar.items[itemId].quantity === 1) {
    user.inventar.items.splice(itemId, 1);
  } else {
    await interaction.update({
      content: 'Du hast kein Umarmung in deinem Inventar!',
      components: [],
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  await user.inventar.save();
  const targetUserId = interaction.values[0];
  const response = await fetch('https://nekos.life/api/v2/img/hug');
  const data = await response.json();
  const hugGifUrl = data.url;
  const hugText = hugTexts[getRandom(0, hugTexts.length - 1)](
    `<@${interaction.user.id}>`,
    `<@${targetUserId}>`,
  );
  const channel = interaction.channel;
  await interaction.update({
    content: `Du hast erfolgreich eine Umarmung an <@${targetUserId}> geschickt!`,
    components: [],
    flags: MessageFlags.Ephemeral,
  });
  await channel.send({
    content: hugText,
    files: [hugGifUrl],
  });
}

async function useItemKuss(interaction) {
  const user = await GameUser.findOne({ userId: interaction.user.id })
    .populate({
      path: 'inventar',
      populate: { path: 'items.item', model: 'Items' },
    })
    .populate('bankkonto');
  const itemId = user.inventar.items.findIndex(
    (item) => item.item.name === 'Küsse',
  );
  if (user.inventar.items[itemId].quantity > 1) {
    user.inventar.items[itemId].quantity -= 1;
  } else if (user.inventar.items[itemId].quantity === 1) {
    user.inventar.items.splice(itemId, 1);
  } else {
    await interaction.update({
      content: 'Du hast kein Küsse in deinem Inventar!',
      components: [],
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  await user.inventar.save();
  const targetUserId = interaction.values[0];
  const response = await fetch('https://nekos.life/api/v2/img/kiss');
  const data = await response.json();
  const kissGifUrl = data.url;
  const kissText = kissTexts[getRandom(0, kissTexts.length - 1)](
    `<@${interaction.user.id}>`,
    `<@${targetUserId}>`,
  );
  const channel = interaction.channel;
  await interaction.update({
    content: `Du hast erfolgreich einen Kuss an <@${targetUserId}> geschickt!`,
    components: [],
    flags: MessageFlags.Ephemeral,
  });
  await channel.send({
    content: kissText,
    files: [kissGifUrl],
  });
}

async function useItemBombe(interaction) {
  if (interaction.customId.includes('bombe_uselect')) {
    const targetUserId = interaction.values[0];
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId(`useItem_bombe_select_draht_${targetUserId}`)
      .setPlaceholder('Wähle einen Draht aus')
      .addOptions([
        { label: 'Zufall', value: 'random' },
        { label: 'Rot', value: 'red' },
        { label: 'Gelb', value: 'yellow' },
        { label: 'Grün', value: 'green' },
        { label: 'Blau', value: 'blue' },
        { label: 'Pink', value: 'pink' },
      ]);
    const row = new ActionRowBuilder().addComponents(selectMenu);
    await interaction.update({
      content: 'Wähle einen Draht aus, welcher die Bombe entschärfen soll:',
      components: [row],
      flags: MessageFlags.Ephemeral,
    });
  } else if (interaction.customId.includes('bombe_select_draht')) {
    let selectedWire = interaction.values[0];
    if (selectedWire == 'random') {
      const wires = ['red', 'yellow', 'green', 'blue', 'pink'];
      selectedWire = wires[getRandom(0, 4)];
    }
    const targetUserId = interaction.customId.split('_')[4];
    const user = await GameUser.findOne({
      userId: interaction.user.id,
    }).populate({
      path: 'inventar',
      populate: { path: 'items.item', model: 'Items' },
    });
    const itemId = user.inventar.items.findIndex(
      (item) => item.item.name === 'Bombe',
    );
    if (user.inventar.items[itemId].quantity > 1) {
      user.inventar.items[itemId].quantity -= 1;
    } else if (user.inventar.items[itemId].quantity === 1) {
      user.inventar.items.splice(itemId, 1);
    } else {
      await interaction.update({
        content: 'Du hast keine Bombe in deinem Inventar!',
        components: [],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    await user.inventar.save();
    const channel = interaction.channel;
    const activeItem = await ActiveItems.create({
      guildId: interaction.guild.id,
      endTime: new Date(Date.now() + 43200000),
      itemType: 'Bombe',
      user: interaction.user.id,
      usedOn: targetUserId,
      extras: selectedWire,
    });
    await interaction.update({
      content: `Du hast erfolgreich eine Bombe an <@${targetUserId}> geschickt!`,
      components: [],
      flags: MessageFlags.Ephemeral,
    });
    const gifUrl = await getGifById('l0K4mVE5b5WZ1sctW');
    if (!gifUrl.includes('http')) {
      console.log('ERROR Bombe gif');
      return;
    }
    await channel.send({
      content: `<@${targetUserId}> du hast eine Bombe erhalten! Entschärfe sie, indem du den richtigen Draht auswählst!`,
      components: [
        new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId(`useItem_bombe_defuse_${activeItem._id}`)
            .setPlaceholder('Wähle einen Draht aus')
            .addOptions([
              { label: 'Rot', value: 'red' },
              { label: 'Gelb', value: 'yellow' },
              { label: 'Grün', value: 'green' },
              { label: 'Blau', value: 'blue' },
              { label: 'Pink', value: 'pink' },
            ]),
        ),
      ],
      files: [gifUrl],
    });
  } else if (interaction.customId.includes('bombe_defuse')) {
    const activeItemId = interaction.customId.split('_')[3];
    const activeItem = await ActiveItems.findById(activeItemId);
    if (
      !activeItem ||
      activeItem.usedOn !== interaction.user.id ||
      activeItem.endTime < new Date()
    ) {
      await interaction.reply({
        content:
          'Die Bombe ist entweder bereits entschärft, ist abgelaufen oder nicht für dich bestimmt!',
        components: [],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    const selectedWire = interaction.values[0];
    const correctWire = activeItem.extras;
    if (selectedWire === correctWire) {
      const durchsuchenButton = new ButtonBuilder()
        .setCustomId(`useItem_bombe_durchsuchen_${activeItem._id}`)
        .setLabel('Durchsuchen')
        .setStyle(ButtonStyle.Primary);
      const beweiseButton = new ButtonBuilder()
        .setCustomId(`useItem_bombe_beweise_${activeItem._id}`)
        .setLabel('Beweise sichern')
        .setStyle(ButtonStyle.Secondary);
      const row = new ActionRowBuilder().addComponents(
        durchsuchenButton,
        beweiseButton,
      );
      await interaction.update({
        content: `Die Bombe wurde erfolgreich entschärft! Du kannst nun entscheiden, ob du sie nach ${confCache.get(interaction.guild.id).get('MONEY_NAME')} durchsuchen oder Beweise sichern möchtest.`,
        components: [row],
      });
      activeItem.extras = 'defused';
      await activeItem.save();
      return;
    } else {
      const amount = getRandom(20000, 40000);
      await removeMoney(interaction.member, amount);
      const gifUrl = await getGifById('mZryFzM65MtpJ5fOMj');
      if (!gifUrl.includes('http')) {
        console.log('ERROR Bombe gif');
        return;
      }
      await interaction.update({
        content: `Bei <@${interaction.user.id}> ist eine Bombe explodiert! **${amount}** ${confCache.get(interaction.guild.id).get('MONEY_NAME')} sind verpufft!`,
        files: [gifUrl],
        components: [],
      });
      await ActiveItems.findByIdAndDelete(activeItemId);
      return;
    }
  } else if (interaction.customId.includes('bombe_durchsuchen')) {
    const activeItemId = interaction.customId.split('_')[3];
    const activeItem = await ActiveItems.findById(activeItemId);
    if (!activeItem) {
      await interaction.update({
        content: 'Die Bombe existiert nicht.',
        components: [],
        files: [],
      });
      return;
    }
    const amount = getRandom(10000, 20000);
    await giveMoney(interaction.member, amount);
    await interaction.update({
      content: `Du hast die Bombe durchsucht und **${amount}** ${confCache.get(interaction.guild.id).get('MONEY_NAME')} gefunden!`,
      components: [],
      files: [],
    });
    await ActiveItems.findByIdAndDelete(activeItemId);
  } else if (interaction.customId.includes('bombe_beweise')) {
    const activeItemId = interaction.customId.split('_')[3];
    const activeItem = await ActiveItems.findById(activeItemId);
    if (!activeItem) {
      await interaction.update({
        content: 'Die Bombe existiert nicht.',
        components: [],
        files: [],
      });
      return;
    }
    const userId = activeItem.user;
    await interaction.update({
      content: `Du hast Beweise gesichert! Die Bombe war von <@${userId}>! Eventuell solltest du dich rächen, oder ihn an die Polizei melden!`,
      components: [],
      files: [],
    });
    await ActiveItems.findByIdAndDelete(activeItemId);
  }
}

async function useItemBlattläuseKlauBanane(interaction) {
  const targetUserId = interaction.values[0];
  const targetMemberObject = await interaction.guild.members
    .fetch(targetUserId)
    .catch(() => null);
  if (!targetMemberObject) {
    await interaction.update({
      content:
        'Der Nutzer, auf dem du die Banane benutzen möchtest, konnte nicht gefunden werden!',
      components: [],
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  const user = await GameUser.findOne({ userId: interaction.user.id }).populate(
    { path: 'inventar', populate: { path: 'items.item', model: 'Items' } },
  );
  const itemId = user.inventar.items.findIndex(
    (item) => item.item.name === 'Klau-Banane',
  );
  if (user.inventar.items[itemId].quantity > 1) {
    user.inventar.items[itemId].quantity -= 1;
  } else if (user.inventar.items[itemId].quantity === 1) {
    user.inventar.items.splice(itemId, 1);
  } else {
    await interaction.update({
      content: `Du hast keine ${confCache.get(interaction.guild.id).get('MONEY_NAME')} Klau Banane in deinem Inventar!`,
      components: [],
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  await user.inventar.save();
  const channel = interaction.channel;
  const amout = getRandom(10000, 30000);
  await removeMoney(targetMemberObject, amout);
  await giveMoney(interaction.member, amout);
  await interaction.update({
    content: `Du hast erfolgreich **${amout}** von <@${targetUserId}> geklaut!`,
    components: [],
    flags: MessageFlags.Ephemeral,
  });
  await channel.send({
    content: `<@${interaction.user.id}> warf eine Klau-Banane auf <@${targetUserId}> und klaute **${amout}** ${confCache.get(interaction.guild.id).get('MONEY_NAME')}!`,
  });
}

async function useItemSchuldschein(interaction) {
  const targetUserId = interaction.values[0];
  const user = await GameUser.findOne({ userId: interaction.user.id }).populate(
    { path: 'inventar', populate: { path: 'items.item', model: 'Items' } },
  );
  const itemId = user.inventar.items.findIndex(
    (item) => item.item.name === 'Schuldschein',
  );
  if (user.inventar.items[itemId].quantity > 1) {
    user.inventar.items[itemId].quantity -= 1;
  } else if (user.inventar.items[itemId].quantity === 1) {
    user.inventar.items.splice(itemId, 1);
  } else {
    await interaction.update({
      content: 'Du hast keinen Schuldschein in deinem Inventar!',
      components: [],
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  await user.inventar.save();
  const channel = interaction.channel;
  await interaction.update({
    content: `Du hast erfolgreich einen Schuldschein an <@${targetUserId}> geschickt!`,
    components: [],
    flags: MessageFlags.Ephemeral,
  });
  await channel.send({
    content: `<@${targetUserId}> du hast einen Schuldschein von <@${interaction.user.id}> erhalten!`,
  });
  const schuldschein = await ActiveItems.findOne({
    guildId: interaction.guild.id,
    itemType: 'Schuldschein',
    user: interaction.user.id,
    usedOn: targetUserId,
  });
  if (schuldschein) {
    if (schuldschein.endTime) {
      schuldschein.endTime = new Date(
        schuldschein.endTime.getTime() + 604800000,
      );
      await schuldschein.save();
    } else {
      schuldschein.endTime = new Date(Date.now() + 604800000);
      await schuldschein.save();
    }
  } else {
    await ActiveItems.create({
      guildId: interaction.guild.id,
      endTime: new Date(Date.now() + 604800000),
      itemType: 'Schuldschein',
      user: interaction.user.id,
      usedOn: targetUserId,
      extras: new Date().toLocaleDateString(),
    });
  }
}

async function useItemKeks(interaction) {
  if (interaction.customId.includes('keks_select')) {
    const selectedAction = interaction.values[0];
    if (selectedAction == 'essen') {
      const user = await GameUser.findOne({
        userId: interaction.user.id,
      }).populate({
        path: 'inventar',
        populate: { path: 'items.item', model: 'Items' },
      });
      const itemId = user.inventar.items.findIndex(
        (item) => item.item.name === 'Keks',
      );
      const quantity = user.inventar.items[itemId].quantity;
      const options = [{ label: '1', value: '1' }];
      if (quantity > 1) {
        options.push({ label: 'alle', value: `${quantity}` });
        if (quantity > 10) {
          options.push({ label: '10', value: '10' });
          if (quantity > 100) {
            options.push({ label: '100', value: '100' });
            if (quantity > 1000) {
              options.push({ label: '1000', value: '1000' });
              if (quantity > 10000) {
                options.push({ label: '10000', value: '10000' });
              }
            }
          }
        }
      }
      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(`useItem_keks_essen`)
        .setPlaceholder('Wie viele Kekse möchtest du essen?')
        .addOptions(options)
        .setMinValues(1)
        .setMaxValues(1);
      const row = new ActionRowBuilder().addComponents(selectMenu);
      await interaction.update({
        content: 'Wähle aus, wie viele Kekse du essen möchtest:',
        components: [row],
        flags: MessageFlags.Ephemeral,
      });
    } else if (selectedAction == 'schenken') {
      const selectMenu = new UserSelectMenuBuilder()
        .setCustomId('useItem_keks_uselect')
        .setPlaceholder(
          'Wähle den Nutzer aus, dem du den Keks schenken möchtest.',
        )
        .setMinValues(1)
        .setMaxValues(1);
      const row = new ActionRowBuilder().addComponents(selectMenu);
      await interaction.update({
        content: 'Wähle den Nutzer aus, dem du den Keks schenken möchtest:',
        components: [row],
        flags: MessageFlags.Ephemeral,
      });
    }
  } else if (interaction.customId.includes('keks_uselect')) {
    const targetUserId = interaction.values[0];
    const user = await GameUser.findOne({
      userId: interaction.user.id,
    }).populate({
      path: 'inventar',
      populate: { path: 'items.item', model: 'Items' },
    });
    const itemId = user.inventar.items.findIndex(
      (item) => item.item.name === 'Keks',
    );
    const quantity = user.inventar.items[itemId].quantity;
    const options = [{ label: '1', value: '1' }];
    if (quantity > 1) {
      options.push({ label: 'alle', value: `${quantity}` });
      if (quantity > 10) {
        options.push({ label: '10', value: '10' });
        if (quantity > 100) {
          options.push({ label: '100', value: '100' });
          if (quantity > 1000) {
            options.push({ label: '1000', value: '1000' });
            if (quantity > 10000) {
              options.push({ label: '10000', value: '10000' });
            }
          }
        }
      }
    }
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId(`useItem_keks_amount_select_${targetUserId}`)
      .setPlaceholder('Wie viele Kekse möchtest du verschenken?')
      .addOptions(options)
      .setMinValues(1)
      .setMaxValues(1);
    const row = new ActionRowBuilder().addComponents(selectMenu);
    await interaction.update({
      content: 'Wähle aus, wie viele Kekse du verschenken möchtest:',
      components: [row],
      flags: MessageFlags.Ephemeral,
    });
  } else if (interaction.customId.includes('keks_amount_select')) {
    let amount = parseInt(interaction.values[0]);
    const targetUserId = interaction.customId.split('_')[4];
    const targetMemberObject = await interaction.guild.members
      .fetch(targetUserId)
      .catch(() => null);
    if (!targetMemberObject) {
      await interaction.update({
        content:
          'Der Nutzer, dem du den Keks schenken möchtest, konnte nicht gefunden werden!',
        components: [],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    const otheruser = await GameUser.findOne({ userId: targetUserId }).populate(
      { path: 'inventar', populate: { path: 'items.item', model: 'Items' } },
    );
    if (!otheruser || !otheruser.inventar) {
      await interaction.update({
        content:
          'Der Nutzer, dem du den Keks schenken möchtest, konnte nicht gefunden werden!',
        components: [],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    const user = await GameUser.findOne({
      userId: interaction.user.id,
    }).populate({
      path: 'inventar',
      populate: { path: 'items.item', model: 'Items' },
    });
    const itemId = user.inventar.items.findIndex(
      (item) => item.item.name === 'Keks',
    );
    if (user.inventar.items[itemId].quantity > amount) {
      user.inventar.items[itemId].quantity -= amount;
    } else if (user.inventar.items[itemId].quantity === amount) {
      user.inventar.items.splice(itemId, 1);
    } else {
      await interaction.update({
        content: 'Du hast nicht genug Kekse in deinem Inventar!',
        components: [],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    await user.inventar.save();
    const item = await Items.findOne({
      name: 'Keks',
      guildId: interaction.guild.id,
    });
    const itemIndex = otheruser.inventar.items.findIndex((inventarItem) =>
      inventarItem.item.equals(item._id),
    );
    if (itemIndex !== -1) {
      otheruser.inventar.items[itemIndex].quantity += amount;
      await otheruser.inventar.save();
    } else {
      otheruser.inventar.items.push({ item: item._id, quantity: amount });
      await otheruser.inventar.save();
    }
    await otheruser.inventar.save();
    await interaction.update({
      content: `Du hast ${amount} Kekse an <@${targetUserId}> geschenkt!`,
      components: [],
      flags: MessageFlags.Ephemeral,
    });
    const channel = interaction.channel;
    await channel.send({
      content: `<@${targetUserId}> du hast von <@${interaction.user.id}> ${amount} Kekse geschenkt bekommen!`,
    });
  } else if (interaction.customId.includes('keks_essen')) {
    const amount = parseInt(interaction.values[0]);
    const user = await GameUser.findOne({
      userId: interaction.user.id,
    }).populate({
      path: 'inventar',
      populate: { path: 'items.item', model: 'Items' },
    });
    const itemId = user.inventar.items.findIndex(
      (item) => item.item.name === 'Keks',
    );
    if (user.inventar.items[itemId].quantity > amount) {
      user.inventar.items[itemId].quantity -= amount;
    } else if (user.inventar.items[itemId].quantity === amount) {
      user.inventar.items.splice(itemId, 1);
    } else {
      await interaction.update({
        content: 'Du hast nicht genügend Kekse in deinem Inventar!',
        components: [],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    user.weight += 60 * amount;
    let keksmessage = `<@${interaction.user.id}> hat ${amount} Keks(e) gemampft und wiegt nun ${user.weight / 1000}kg!`;
    if (amount == 1) {
      keksmessage =
        `<@${interaction.user.id}>` +
        keksTexts[getRandom(0, keksTexts.length - 1)] +
        `\nDas Gewicht beträgt jetzt ${user.weight / 1000}kg!`;
    }
    await user.inventar.save();
    await user.save();
    await interaction.update({
      content: `Du hast erfolgreich Keks(e) verdrückt.`,
      components: [],
      flags: MessageFlags.Ephemeral,
    });
    const channel = interaction.channel;
    await channel.send(keksmessage);
  }
}

module.exports = useItems;
