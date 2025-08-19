require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const { HoldingsModel } = require("./model/HoldingsModel");
const { PositionsModel } = require("./model/PositionsModel");
const { OrdersModel } = require("./model/OrdersModel");

const PORT = process.env.PORT || 3000;
const URL = process.env.MONGO_URL;

const app = express();

app.use(cors());
app.use(bodyParser.json());

mongoose
  .connect(URL)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

//For first time data insertion in DB
// app.get("/addPositions", async (req, res) => {
//   const positions = [
//     {
//       product: "CNC",
//       name: "EVEREADY",
//       qty: 2,
//       avg: 316.27,
//       price: 312.35,
//       net: "+0.58%",
//       day: "-1.24%",
//       isLoss: true,
//     },
//     {
//       product: "CNC",
//       name: "JUBLFOOD",
//       qty: 1,
//       avg: 3124.75,
//       price: 3082.65,
//       net: "+10.04%",
//       day: "-1.35%",
//       isLoss: true,
//     },
//   ];

//   positions.forEach((item) => {
//     let newPosition = new PositionsModel({
//       product: item.product,
//       name: item.name,
//       qty: item.qty,
//       avg: item.avg,
//       price: item.price,
//       net: item.net,
//       day: item.day,
//       isLoss: item.isLoss,
//     });

//     newPosition
//       .save()
//       .then(() => {
//         console.log("New holding saved:", newPosition);
//       })
//       .catch((err) => {
//         console.error("Error saving holding:", err);
//       });
//   });
// });

app.get("/allHoldings", async (req, res) => {
  try {
    const allHoldings = await HoldingsModel.find({});
    res.json(allHoldings);
  } catch (error) {
    console.error("Error fetching holdings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/allPositions", async (req, res) => {
  try {
    const allPositions = await PositionsModel.find({});
    res.json(allPositions);
  } catch (error) {
    console.error("Error fetching positions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/allOrders", async (req, res) => {
  try {
    const allOrders = await OrdersModel.find({});
    res.json(allOrders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/newOrder", async (req, res) => {
  let newOrder = new OrdersModel({
    name: req.body.name,
    qty: req.body.qty,
    price: req.body.price,
    mode: req.body.mode,
  });

  try {
    await newOrder.save();
    console.log("New order placed:", newOrder);
    
    // Try to fetch avg, net, day from Holdings
    let existingHolding = await HoldingsModel.findOne({ name: req.body.name });
    let avg = req.body.price;
    let net = "+0.00%";
    let day = "+0.00%";

    if (existingHolding) {
      avg = existingHolding.avg;
      net = existingHolding.net;
      day = existingHolding.day;
    }
    
    // Save a copy to Holdings
    let newHolding = new HoldingsModel({
      name: req.body.name,
      qty: req.body.qty,
      avg: avg,
      price: req.body.price,
      net: net, // set default or calculate as needed
      day: day, // set default or calculate as needed
    });

    await newHolding.save();
    console.log("New holding saved:", newHolding);

    res.status(201).json({ message: "Order and holding saved" });
  } catch (err) {
    console.error("Error saving order or holding:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
