const { Schema, model } = require('mongoose');

const roleSelectionRolesSchema = new Schema({
  guildId: {
    type: String,
    required: true,
  },
  roleIds: {
    type: [String],
    required: true,
  },
  selectDescription: {
    type: String,
    required: true,
  },
  selectMenu: {
    type: String,
    required: true,
  },
  messageId: {
    type: String,
    required: false,
  },
  multiSelect: {
    type: Boolean,
    required: true,
  },
});

module.exports = model('RoleSelectionRoles', roleSelectionRolesSchema);
