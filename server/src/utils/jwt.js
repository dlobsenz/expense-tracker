import jwt from "jsonwebtoken";

export const generateAccessToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "15m" });

export const generateRefreshToken = (payload) =>
  jwt.sign(payload, process.env.REFRESH_SECRET, { expiresIn: "7d" });

export const verifyToken = (token, secret) =>
  jwt.verify(token, secret);
