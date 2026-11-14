const { Schema, model } = require('mongoose');

const vorstellungSchema = new Schema({
  guildId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  messageId: {
    type: String,
    required: true,
  },
});

module.exports = model('Vorstellung', vorstellungSchema);
