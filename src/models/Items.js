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
  guildId: {
    type: String,
    required: true,
  },
});

module.exports = model('Items', itemsSchema);
