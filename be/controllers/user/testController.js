// Test endpoint
import { initializeDB, db } from "../../models/index.js";
import * as userService from "../../services/user.service.js";

export const testAuth = async (req, res) => {
  try {
    console.log("=== TEST AUTH ENDPOINT ===");

    await initializeDB();
    console.log("Database initialized");

    const result = await userService.authenticateUser("123456", "123456");
    console.log("Auth result:", result);

    res.status(200).json({
      message: "Test endpoint",
      authResult: result,
    });
  } catch (error) {
    console.error("Test endpoint error:", error);
    res.status(500).json({ message: "Test endpoint error" });
  }
};
