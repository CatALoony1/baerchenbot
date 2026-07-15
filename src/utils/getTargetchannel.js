const ServerConfig = require('../models/ServerConfig');
async function getTargetChannels(channelName) {
  const channels = await ServerConfig.find({ variableName: channelName });
  if (channels.length === 0) {
    const admins = await ServerConfig.find({ variableName: 'ADMIN_ID' });
    if (admins.length > 0) {
      return admins.map((admin) => admin.objectId);
    }
    return [];
  }
  return channels.map((channel) => channel.objectId);
}
