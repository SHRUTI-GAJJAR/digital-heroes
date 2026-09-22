const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Routes
const testRoutes = require("./routes/testRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const charityRoutes = require("./routes/charityRoutes");
const scoreRoutes = require("./routes/scoreRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const drawRoutes = require("./routes/drawRoutes");
const drawEntryRoutes = require("./routes/drawEntryRoutes");
const winnerRoutes = require("./routes/winnerRoutes");
const donationRoutes = require("./routes/donationRoutes");
const reportRoutes = require("./routes/reportRoutes");
const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/test", testRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/charities", charityRoutes);
app.use("/api/scores", scoreRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/draws", drawRoutes);
app.use("/api/draw-entries", drawEntryRoutes);
app.use("/api/winners", winnerRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/reports", reportRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Digital Heroes API is running"
  });
});

app.listen(PORT, () => {
  console.log(`Digital Heroes server running on port ${PORT}`);
});