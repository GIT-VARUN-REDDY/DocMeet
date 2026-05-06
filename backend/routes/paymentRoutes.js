const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const { protect, authorize } = require("../middleware/authMiddleware");

// POST /api/payment/create-order
router.post("/create-order", protect, authorize("user"), async (req, res) => {
  try {
    console.log("💳 Payment request received");
    console.log("   KEY_ID:", process.env.RAZORPAY_KEY_ID);
    console.log("   SECRET set:", !!process.env.RAZORPAY_KEY_SECRET);
    console.log("   Amount:", req.body.amount);

    const { amount, doctorName } = req.body;
    if (!amount || amount <= 0)
      return res.status(400).json({ message: "Invalid amount" });

    const razorpay = new Razorpay({
      key_id:     process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    console.log("   Creating Razorpay order...");

    const order = await razorpay.orders.create({
      amount:   Math.round(amount * 100),
      currency: "INR",
      receipt:  `rcpt_${Date.now()}`,
    });

    console.log("   ✅ Order created:", order.id);

    res.json({
      orderId:  order.id,
      amount:   order.amount,
      currency: order.currency,
      keyId:    process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("❌ Razorpay order error FULL:", JSON.stringify(err, null, 2));
    console.error("❌ Error message:", err.message);
    console.error("❌ Error error:", err.error);
    res.status(500).json({
      message: "Payment initiation failed: " + (err.error?.description || err.message || JSON.stringify(err)),
    });
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