const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const { protect, authorize } = require("../middleware/authMiddleware");

// ✅ Initialize Razorpay inside the handler so it reads env vars AFTER dotenv loads
const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay keys not set in .env");
  }
  return new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// POST /api/payment/create-order
router.post("/create-order", protect, authorize("user"), async (req, res) => {
  try {
    const { amount, doctorName } = req.body;
    if (!amount || amount <= 0)
      return res.status(400).json({ message: "Invalid amount" });

    const razorpay = getRazorpay();

    const order = await razorpay.orders.create({
      amount:   amount * 100, // paise
      currency: "INR",
      receipt:  `receipt_${Date.now()}`,
      notes:    { doctorName, patientEmail: req.user.email },
    });

    res.json({
      orderId:  order.id,
      amount:   order.amount,
      currency: order.currency,
      keyId:    process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("Razorpay order error:", err.message);
    res.status(500).json({ message: "Payment initiation failed: " + err.message });
  }
});

// POST /api/payment/verify
router.post("/verify", protect, authorize("user"), async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature)
      return res.status(400).json({ message: "Payment verification failed." });

    res.json({ success: true, paymentId: razorpay_payment_id, message: "Payment verified!" });
  } catch (err) {
    console.error("Razorpay verify error:", err.message);
    res.status(500).json({ message: "Payment verification failed" });
  }
});

module.exports = router;