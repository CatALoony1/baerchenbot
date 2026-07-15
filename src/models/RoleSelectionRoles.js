const { Schema, model } = require('mongoose');

const roleSelectionRolesSchema = new Schema({
  guildId: {
    type: String,
    required: true,
  },
  roleId: {
    type: String,
    required: true,
  },
  roleEmoji: {
    type: String,
    required: false,
  },
  selectMenu: {
    type: String,
    required: true,
  },
});

module.exports = model('RoleSelectionRoles', roleSelectionRolesSchema);
