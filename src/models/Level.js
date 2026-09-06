const { Schema, model } = require('mongoose');

const levelSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  guildId: {
    type: String,
    required: true,
  },
  xp: {
    type: Number,
    default: 0,
  },
  level: {
    type: Number,
    default: 0,
  },
  color: {
    type: String,
    default: '#e824b3',
  },
  allxp: {
    type: Number,
    default: 0,
  },
  messages: {
    type: Number,
    default: 0,
  },
  lastMessage: {
    type: Date,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  voicexp: {
    type: Number,
    default: 0,
  },
  messagexp: {
    type: Number,
    default: 0,
  },
  voicetime: {
    type: Number,
    default: 0,
  },
  thismonth: {
    type: Number,
    default: 0,
  },
  lastmonth: {
    type: Number,
    default: 0,
  },
  lastBump: {
    type: Date,
  },
  geburtstag: {
    type: Date,
  },
  bumps: {
    type: Number,
    default: 0,
  },
});

module.exports = model('Level', levelSchema);
