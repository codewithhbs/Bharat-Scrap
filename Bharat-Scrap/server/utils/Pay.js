const crypto = require('crypto');
const axios = require('axios');
// const Ordermodel = require('../models/Order.model')
// const Settings = require('../models/Setting');
const Razorpay = require('razorpay');
// const meetingModel = require('../models/meeting.model');

// async function initiatePayment(req, res, order) {
//     try {
//         const { totalAmount } = req.body;
//         const SettingsFind = await Settings.findOne()
//         const transactionId = crypto.randomBytes(9).toString('hex');
//         const merchantUserId = crypto.randomBytes(12).toString('hex');

//         const merchantId = process.env.PHONEPE_MERCHANT_ID || SettingsFind?.paymentGateway?.key;
//         const apiKey = process.env.PHONEPE_MERCHANT_KEY || SettingsFind?.paymentGateway?.secret;


//         const data = {
//             merchantId: merchantId,
//             merchantTransactionId: transactionId,
//             merchantUserId: merchantUserId,
//             name: "User",
//             amount: totalAmount * 100,
//             callbackUrl: 'https://api.grandmasala.in/payment-failed',
//             redirectUrl: `https://api.grandmasala.in/api/v1/verify-payment/${transactionId}`,
//             redirectMode: 'POST',
//             paymentInstrument: {
//                 type: 'PAY_PAGE',
//             },
//         };


//         const payload = JSON.stringify(data);
//         const payloadMain = Buffer.from(payload).toString('base64');
//         const keyIndex = 1;


//         const string = payloadMain + '/pg/v1/pay' + apiKey;
//         const sha256 = crypto.createHash('sha256').update(string).digest('hex');
//         const checksum = sha256 + '###' + keyIndex;


//         const prod_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay";



//         const options = {
//             method: 'POST',
//             url: prod_URL,
//             headers: {
//                 accept: 'application/json',
//                 'Content-Type': 'application/json',
//                 'X-VERIFY': checksum,
//             },
//             data: {
//                 request: payloadMain,
//             },
//         };

//         // Make the Axios request
//         const response = await axios.request(options);
//         // console.log("response.data.data.orderId", response.data.data.merchantTransactionId)
//         const date = new Date()
//         // console.log(date)
//         if (response.status) {
//             const findOrder = await Order.findById(order?._id)
//             if (findOrder) {
//                 findOrder.payment = {
//                     method: 'PAY_PAGE',
//                     paymentInital: date,
//                     phonepeOrderId: response.data.data.merchantTransactionId,
//                     status: "pending",
//                 };
//             }
//             await findOrder.save();
//         }
//         // console.log(response.data.data.instrumentResponse.redirectInfo.url)
//         res.status(201).json({
//             success: true,
//             msg: "Payment initiated successfully",
//             amount: totalAmount,
//             phonepeOrderId: response.data.data?.merchantTransactionId,
//             order: order,
//             success: true,
//             url: response.data.data.instrumentResponse.redirectInfo.url,
//         });
//     } catch (error) {
//         console.error("Error initiating payment:", error);
//         res.status(501).json({
//             success: false,
//             msg: "Payment initiation failed",
//         });
//     }
// }

async function initiateRazorpay(req, res, order) {
  console.log("🔔 initiateRazorpay FUNCTION HIT");

  try {
    console.log("📦 Incoming Order:", {
      orderId: order?._id,
      amount: order?.amount,
      userId: order?.userId,
    });

    // 1️⃣ Amount validation
    const totalAmount = order?.amount;

    if (!totalAmount) {
      console.warn("⚠️ Total amount missing in order");

      return res.status(400).json({
        success: false,
        msg: "Total amount is required",
      });
    }

    console.log("💰 Total Amount (₹):", totalAmount);
    console.log("💰 Amount in Paise:", Math.round(totalAmount * 100));

    // 2️⃣ Env variables
    const razorpayKey = process.env.RAZORPAY_KEY_ID;
    const razorpaySecret = process.env.RAZORPAY_SECRET;

    console.log("🔑 Razorpay Key Exists:", !!razorpayKey);
    console.log("🔐 Razorpay Secret Exists:", !!razorpaySecret);

    if (!razorpayKey || !razorpaySecret) {
      console.error("❌ Razorpay ENV variables missing");

      return res.status(500).json({
        success: false,
        msg: "Payment gateway is not configured",
      });
    }

    // 3️⃣ Razorpay instance
    console.log("⚙️ Initializing Razorpay instance");

    const razorpay = new Razorpay({
      key_id: razorpayKey,
      key_secret: razorpaySecret,
    });

    // 4️⃣ Order create options
    const options = {
      amount: Math.round(totalAmount * 100), // paise
      currency: order?.currency || "INR",
      receipt: crypto.randomBytes(10).toString("hex"),
      payment_capture: 1,
    };

    console.log("🧾 Razorpay Order Options:", options);

    // 5️⃣ Create Razorpay order
    console.log("🚀 Creating Razorpay order...");

    const response = await razorpay.orders.create(options);

    console.log("✅ Razorpay Order Created:", {
      id: response.id,
      amount: response.amount,
      currency: response.currency,
      status: response.status,
    });

    // 6️⃣ Save payment info in DB
    let updatedOrder = order;

    if (response?.id) {
      console.log("💾 Updating order with Razorpay details in DB");

      const findOrder = await meetingModel.findById(order?._id);

      console.log("📄 Order Found For Update:", findOrder);

      if (findOrder) {
        findOrder.payment = {
          method: "RAZORPAY",
          paymentInital: new Date(),
          razorpayOrderId: response.id,
          status: "pending",
          isPaid: false,
        };

        // optional top-level flags (recommended)
        findOrder.isPaid = false;
        findOrder.updatedAt = new Date();

        await findOrder.save();

        console.log("✅ Payment object saved in DB");
        updatedOrder = findOrder;
      }
      else {
        console.warn("⚠️ Order not found while updating payment info");
      }
    }

    // 7️⃣ Response to frontend
    console.log("➡️ Sending response to frontend");

    return res.status(201).json({
      success: true,
      msg: "Payment initiated successfully",
      amount: totalAmount,            // rupees
      razorpayOrderId: response.id,   // frontend needs this
      order: updatedOrder,
      currency: response.currency,
      razorPayKey: razorpayKey,
    });

  } catch (error) {
    console.error("🔥 ERROR in initiateRazorpay:", {
      message: error.message,
      error,
      stack: error.stack,
    });

    return res.status(500).json({
      success: false,
      msg: "Payment initiation failed",
      error: error?.error || error?.message || error,
    });
  }
}

module.exports = { initiateRazorpay };
