const { Schema, model } = require('mongoose');
const itemsSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    beschreibung: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

itemsSchema.virtual('shoppableitems', {
  ref: 'ShoppableItems',
  localField: '_id',
  foreignField: 'item',
  justOne: false,
});

itemsSchema.pre(
  'deleteOne',
  { document: true, query: false },
  async function (next) {
    console.log(
      `[User-Hook] Lösche zugehörige ShoppableItems für Item ID: ${this._id}`,
    );
    try {
      const ShoppableItems = mongoose.model('ShoppableItems');
      await ShoppableItems.deleteMany({ item: this._id });
      console.log(`[User-Hook] ShoppableItems für Item ${this._id} gelöscht.`);
      next();
    } catch (error) {
      console.error(
        `[User-Hook] Fehler beim kaskadierenden Löschen für Item ${this._id}:`,
        error,
      );
      next(error);
    }
  },
);

module.exports = model('Items', itemsSchema);
