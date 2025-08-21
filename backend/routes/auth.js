// En backend/routes.js o authRoutes.js
const express = require("express");
const router = express.Router();
const { login } = require("./controllers/authController");

router.post("/login", login);

module.exports = router;
