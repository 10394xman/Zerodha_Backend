const { Schema } = require("mongoose");

const HoldingsSchema = new Schema({
//   userId: { type: Schema.Types.ObjectId, ref: "User" },
  name: { type: String, required: true },
  qty: { type: Number, required: true },
  avg: { type: Number, required: true },
  price: { type: Number, required: true },
  net: { type: String, required: true },
  day: { type: String, required: true },
  purchaseDate: { type: Date, default: Date.now },
});

// module.exports = mongoose.model("Holding", HoldingSchema);

module.exports = {HoldingsSchema};