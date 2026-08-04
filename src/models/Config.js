const { Schema, model } = require('mongoose');

const configSchema = new Schema({
  guildId: {
    type: String,
    required: true,
  },
  key: {
    type: String,
    required: true,
  },
  value: {
    type: String,
  },
});

module.exports = model('Config', configSchema);
