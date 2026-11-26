const { Schema, model } = require('mongoose');

const quoteCounterSchema = new Schema({
  guildId: {
    type: String,
    required: true,
  },
  counter: {
    required: true,
    type: Number,
  },
});

module.exports = model('QuoteCounter', quoteCounterSchema);
