const { Schema, model } = require('mongoose');
const mongoose = require('mongoose');

const gameUserSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    guildId: {
      type: String,
      default: null,
    },
    quizadded: {
      type: Number,
      default: 0,
    },
    daily: {
      type: Date,
    },
    weight: {
      type: Number,
      default: 0,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

gameUserSchema.index({ userId: 1, guildId: 1 }, { unique: true });

gameUserSchema.virtual('bankkonto', {
  ref: 'Bankkonten',
  localField: '_id',
  foreignField: 'besitzer',
  justOne: true,
});

gameUserSchema.virtual('inventar', {
  ref: 'Inventar',
  localField: '_id',
  foreignField: 'besitzer',
  justOne: true,
});

gameUserSchema.virtual('tiere', {
  ref: 'Tiere',
  localField: '_id',
  foreignField: 'besitzer',
  justOne: false,
});

gameUserSchema.pre(
  'deleteOne',
  { document: true, query: false },
  async function (next) {
    console.log(
      `[User-Hook] Lösche zugehöriges Bankkonto und Inventar für User ID: ${this._id}`,
    );
    try {
      const Bankkonten = mongoose.model('Bankkonten');
      const Inventar = mongoose.model('Inventar');
      await Bankkonten.deleteOne({ owner: this._id });
      console.log(`[User-Hook] Bankkonto für User ${this._id} gelöscht.`);
      await Inventar.deleteOne({ owner: this._id });
      console.log(`[User-Hook] Inventar für User ${this._id} gelöscht.`);
      next();
    } catch (error) {
      console.error(
        `[User-Hook] Fehler beim kaskadierenden Löschen für User ${this._id}:`,
        error,
      );
      next(error);
    }
  },
);

module.exports = model('GameUser', gameUserSchema);
