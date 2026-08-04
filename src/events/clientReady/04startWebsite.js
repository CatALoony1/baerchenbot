const { startWebsite } = require('../../web/website');

module.exports = {
  once: true,

  run: async (client) => {
    startWebsite(client);
    console.log(`Website started`);
  },
};
