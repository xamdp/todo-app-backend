import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../db.js";

const router = express.Router();

// Register a new user endpoint /auth/register
router.post("/register", (req, res) => {
  const { username, password } = req.body;
  // do not save plain text passwords, but encrypt them using bcrypt package

  const hashedPassword = bcrypt.hashSync(password, 8);
  console.log(hashedPassword);
  res.sendStatus(201);
});

// Login a user /auth/login
router.post("/login", (req, res) => {
  const { username, password } = req.body;
  // upon login, we encrypt the password in req.body, and compare it with encrypted registered password of the user
  console.log(username, password);
  sendStatus(200);
});
export default router;
