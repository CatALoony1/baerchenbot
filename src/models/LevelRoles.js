const { Schema, model } = require('mongoose');

const levelRolesSchema = new Schema({
  guildId: {
    type: String,
    required: true,
  },
  roleId: {
    type: String,
    required: true,
  },
  levelNumer: {
    type: Number,
    required: true,
  },
});

module.exports = model('LevelRoles', levelRolesSchema);
