// Run: node testRoutes.js
require("dotenv").config();
const http = require("http");

const options = {
  hostname: "localhost",
  port: 5000,
  path: "/api/auth/register",
  method: "POST",
  headers: { "Content-Type": "application/json" },
};

const body = JSON.stringify({
  name: "Test User",
  email: "test@test.com",
  password: "Test123",
  role: "user",
});

console.log("Testing POST http://localhost:5000/api/auth/register ...");

const req = http.request(options, (res) => {
  let data = "";
  res.on("data", (chunk) => (data += chunk));
  res.on("end", () => {
    console.log("Status:", res.statusCode);
    console.log("Response:", data);
    if (res.statusCode === 404) {
      console.log("\n❌ Route not found — authRoutes.js is not being loaded correctly in server.js");
    } else {
      console.log("\n✅ Route is working!");
    }
    process.exit();
  });
});

req.on("error", (e) => {
  console.error("❌ Cannot connect to backend:", e.message);
  console.log("Make sure backend is running: npm run dev");
  process.exit();
});

req.write(body);
req.end();