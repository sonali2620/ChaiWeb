import jwt from "jsonwebtoken";
import env from "../config/env.js";
import result from "./result.js";

// AUTH USER 
export const authUser = (req, res, next) => {
  try {
    // ✅ get Authorization header
    const authHeader = req.headers.authorization;

    // ❌ if missing
    if (!authHeader) {
      return res.send(
        result.createResult("Token is missing")
      );
    }

    // ✅ extract token from Bearer
    const token = authHeader.split(" ")[1];

    // ❌ if token missing
    if (!token) {
      return res.send(
        result.createResult("Token is missing")
      );
    }

    // ✅ verify token
    const payload = jwt.verify(token, env.jwtSecret);

    // attach user
    req.user = {
      email: payload.email,
      role: payload.role
    };

    next();

  } catch (error) {
    return res.send(
      result.createResult("Invalid or expired token")
    );
  }
};


// ADMIN AUTHORIZATION
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "ADMIN") {
    return next();
  }

  return res.send(
    result.createResult("Unauthorized access")
  );
};