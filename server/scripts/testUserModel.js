require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/User");

const testUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const user = await User.create({
      name: "Test Admin",
      email: "testadmin@bughunter.com",
      password: "test123",
      role: "admin",
    });

    console.log("User created successfully:");
    console.log(user);

    await mongoose.connection.close();
  } catch (error) {
    console.error("User creation failed:", error.message);
    process.exit(1);
  }
};

testUser();
