const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./src/routes/authRoutes");
const violationRoutes = require("./src/routes/violationRoutes");
const adminRoutes = require("./src/routes/adminRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Routes
app.use("/", authRoutes); // /login
app.use("/vipham", violationRoutes); // /vipham, /vipham/tra-cuu, etc
app.use("/admin", adminRoutes); // /admin/can-bo, /admin/stats

// Serve static files for root
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public/login.html"));
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server chạy tại: http://localhost:${PORT}`);
});