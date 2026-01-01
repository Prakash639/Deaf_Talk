const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/authRoutes");

dotenv.config();

const app = express();

// Middleware (must be before routes)
app.use(cors({
  origin: "http://localhost:5173", // React app URL
  methods: ["GET", "POST"],
}));
app.use(express.json()); // <-- handles JSON requests
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Routes

app.use('/api', authRoutes);




const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
