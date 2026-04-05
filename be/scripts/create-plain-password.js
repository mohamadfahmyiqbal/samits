// Create user with plain password (let hook handle hashing)
import { initializeDB, db } from "../models/index.js";
import bcrypt from "bcryptjs";

async function createWithPlainPassword() {
  try {
    await initializeDB();
    const User = db.User;

    // Delete existing user
    await User.destroy({ where: { nik: "123456" } });

    // Create user with plain password (hook will hash it)
    const user = await User.create({
      nik: "123456",
      nama: "Test User",
      password: "123456", // Plain password - hook will hash this
      email: "test@example.com",
      position: "Admin",
    });

    console.log("User created with plain password");
    console.log("Stored hash:", user.password);

    // Test authentication
    const authResult = await User.findOne({ where: { nik: "123456" } });
    if (authResult) {
      const match = await bcrypt.compare("123456", authResult.password);
      console.log("Password match test:", match);
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

createWithPlainPassword();
