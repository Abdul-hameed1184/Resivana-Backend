import axios from 'axios'
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const COMMISSION_PERCENT = parseFloat(process.env.COMMISSION_PERCENT || "5");

const headers = {
  Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
  "Content-Type": "application/json",
};

export const initializePayment = async (req, res) => {
  try {
    const { email, amount, metadata } = req.body;

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: amount * 100, // in kobo
        metadata,
      },
      { headers }
    );

    res.json(response.data.data);
  } catch (error) {
    res.status(500).json({ error: error?.response?.data || error.message });
  }
};

export const verifyPayment = async (req, res) => {
  const { reference } = req.params;

  try {
    const { data } = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers,
      }
    );

    if (data?.status && data?.data?.status === "success") {
      res.json({ success: true, data: data.data });
    } else {
      res.status(400).json({ success: false, message: "Verification failed" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const transferToAgent = async (req, res) => {
  const { amount, account_number, bank_code, email } = req.body;

  if (!amount || !account_number || !bank_code || !email) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  const amountInKobo = amount * 100;
  const commission = (COMMISSION_PERCENT / 100) * amountInKobo;
  const amountToTransfer = amountInKobo - commission;

  try {
    const recipientRes = await axios.post(
      "https://api.paystack.co/transferrecipient",
      {
        type: "nuban",
        name: email,
        account_number,
        bank_code,
        currency: "NGN",
      },
      { headers }
    );

    if (!recipientRes.data || !recipientRes.data.data || !recipientRes.data.data.recipient_code) {
      return res.status(500).json({ success: false, message: "Failed to create transfer recipient" });
    }

    const recipientCode = recipientRes.data.data.recipient_code;

    const transferRes = await axios.post(
      "https://api.paystack.co/transfer",
      {
        source: "balance",
        amount: Math.floor(amountToTransfer),
        recipient: recipientCode,
        reason: "Property Payment Payout",
      },
      { headers }
    );

    if (!transferRes.data || !transferRes.data.data) {
      return res.status(500).json({ success: false, message: "Failed to initiate transfer" });
    }

    res.json({ success: true, data: transferRes.data.data });
  } catch (error) {
    res.status(500).json({ success: false, message: error?.response?.data?.message || error.message });
  }
};
