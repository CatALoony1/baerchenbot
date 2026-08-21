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
  available: {
    type: Boolean,
    default: true,
  },
  guildIds: {
    type: [String],
    default: [],
  },
});

module.exports = model('Items', itemsSchema);
