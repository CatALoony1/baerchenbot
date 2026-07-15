const { Schema, model } = require('mongoose');

const serverConfigSchema = new Schema({
  guildId: {
    type: String,
    required: true,
  },
  variableName: {
    type: String,
    required: true,
  },
  objectId: {
    type: String,
    required: true,
  },
});

module.exports = model('ServerConfig', serverConfigSchema);
