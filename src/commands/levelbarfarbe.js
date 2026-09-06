//Dateien im commands Ordner werden automatisch versucht als Befehle zu registrieren (in utils/registerCommands)

//importieren der von Discord genutzen Objekte
const {
  SlashCommandBuilder, //zum erzeugen eines befehls
  InteractionContextType, //zum festlegen, wo der Befehl erlaubt ist
  MessageFlags, //zum setzen von "privaten" Nachrichten
} = require('discord.js');
//importieren des Datenbankobjektes um Abfragen darauf zu machen.
const Level = require('../models/Level');

//exportieren, damit registerCommands drauf zugreifen kann
module.exports = {
  //erzeugen des Befehls
  data: new SlashCommandBuilder()
    .setName('levelbarfarbe') //setzen des Namens (Dateiname und Befehl-Name parallöl halten)
    .setDescription('Wahle die Farbe deiner Levelfortschrittsleiste aus.')
    .addStringOption(
      (option) =>
        //Text eingabeparameter hinzufügen
        option
          .setName('farbe')
          .setDescription('Hashcode der Farbe(mit #).')
          .setMinLength(7) //minimale länge des eingabeparameters
          .setMaxLength(7) //maximale länge des eingabeparameters
          .setRequired(true), //ob dieser zwingend erforderlich ist
    )
    .setContexts([
      InteractionContextType.Guild, //Befehl auf Server erlaubt
      InteractionContextType.PrivateChannel, //Befehö in DM erlaubt
    ]),
  /**
   *
   * @param {Object} param0
   * @param {import('discord.js').ChatInputCommandInteraction} param0.interaction
   */
  //Die Funktion die beim ausführen des Befehls ausgeführt ist. Interaction ist der Eingabeparameter ber beim ausführen von Befehlen immer mitgeliefert wird
  run: async ({ interaction }) => {
    //Logging welcher Befehl ausgeführt wurde und von welchem user (tag ist der benutzername, nicht der anzeigename, z.b. bei mir jonas0905)
    console.log(
      `SlashCommand ${interaction.commandName} was executed by user ${interaction.member.user.tag}`,
    );
    //Die Antwort auf den Befehl vorbereiten. Wenn verarbeitung länger dauert kommt ein Timeout, deshalb macht man am anfang ein deferReply, um sozusagen zu sagen "antwort kommt noch". Ephemeral sagt, dass die Antwort nur für den ausführenden Nutzer sichtbar ist
    // await, weil es hier eine Rückmeldung an Discord gibt, es wird was versendet, also warten wir hier, bis es komplett gesendet wurde (ebenfalls bei allen folgenden editReply)
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    //Laden des eingabeparameters mit dem namen 'farbe' und speichern in der constante farbe
    const farbe = interaction.options.get('farbe').value;
    /* Festlegen der Reguläre Expression, nach welchem der eingabeparameter validiert werden soll. 
    / -> beginn regex
    ^ -> Anfang der Zeile
    [a-fA-F0-9]{6} -> 6 Zeichen a-f, A-F oder 0-9
    $ -> ende der Zeile
    / .> ende regex
    */
    const hexregex = /^#(?:[0-9a-fA-F]{6})$/;
    //vergleichen der variable farbe mit der regex, wenn passt, dann weiter im if, ansonsten in else
    if (farbe.match(hexregex)) {
      // erzeugen eines Objektes, welches die Parameter enthält, die man bei der Datenbank abfragen will. Vor dem Doppelpunkt ist der exakte spaltenname aus dem model (models Ordner), dahinter was in der Spalte sein soll
      const query = {
        userId: interaction.user.id,
        guildId: interaction.guild.id,
      };
      //Bei Datenbankabfragen kann es zu unerwarteten Fehlern kommen, deshalb try, bei Fehler geht's in catch
      try {
        /*Datenbank nach der query abfragen. Wir fragen die Tabelle Level ab und wollen ein ergebnis haben (sollten mehrere Einträge der Query entsprechen, bekommen wir hier das erste)
        wird in ein Objekt namens level gespeichert.
        await, da Datenbankabfrage und das kann dauern */
        const level = await Level.findOne(query);
        //überprüfen, ob ein Eintrag gefunden wurde (wenn kein Eintrag gefunden wurde wäre level hier undefined). Ist kein Eintrag vorhanden geht's im else weiter
        if (level) {
          /*
          Wenn wir hier sind ist das level Objekt gefüllt.
          Dieses hat alle variablen aus dem Model (siehe Model Ordner)
          Auf diese kann mit einem punkt zugegriffen werden, z.b. level.userId, level.guildId, etc. und liefern dann den bereits hinterlegten wert zurück

          Die Farbe wird hier geändert. Egal ob was drin ist oder nicht, wir schreiben in level.color einfach die neue farbe rein.
          Diese Änderung ist an dieser stelle erstmal nur lokal und noch nicht in der Datenbank
          */
          level.color = farbe;
          /*das level Objekt wird jetzt wieder in die Datenbank gespeichert
          await, da datenbankkommunikation
          .catch funktioniert wie try/catch, kommt es zu einem Fehler, wird das in der klammer hinter dem Catch ausgeführt
          */
          await level.save().catch((e) => {
            //Fehler in das Log schreiben
            console.log(`Error saving updated level ${e}`);
            //verlassen der Funktion
            return;
          });
          //Rückmeldung an den Nutzer geben, dass die Farbe erfolgreich gesetzt wird
          await interaction.editReply(`Farbe erfolgreich geaendert.`);
        } else {
          //Rückmeldung an den Nutzer, dass er noch keinen Eintrag in Level hat (heißt er hat bisher nicht 1 nachricht geschrieben)
          await interaction.editReply(
            `Du bist noch nicht in der DB, chatte mal bisschen.`,
          );
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      //die vorbereitete antwort bearbeiten und den text hinterlegen, das der eingegebene Wert kein valider farbcode ist
      await interaction.editReply(
        `Der eingegebene Wert muss ein Hex-Farbcde sein Bsp.: #1f7da2`,
      );
    }
  },
};
