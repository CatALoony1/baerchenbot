const { Schema, model } = require('mongoose');
const itemsSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  beschreibung: {
    type: String,
    required: true,
  },
  preis: {
    type: Number,
    required: true,
  },
  boostOnly: {
    type: Boolean,
    default: false,
  },
  guildId: {
    type: String,
    required: true,
  },
});

module.exports = model('Items', itemsSchema);
