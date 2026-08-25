const { Schema, model } = require('mongoose');
const shoppableItemsSchema = new Schema({
  preis: {
    type: Number,
    required: true,
  },
  boostOnly: {
    type: Boolean,
    default: false,
  },
  guildId: {
    type: String,
    required: true,
  },
  item: {
    type: Schema.Types.ObjectId,
    ref: 'Items',
    required: true,
  },
});

module.exports = model('ShoppableItems', shoppableItemsSchema);
