import { Transaction } from "../types";

// Enhanced Regex patterns for Indian financial SMS
const PATTERNS = {
  // Matches: Rs. 123, INR 123, 123.00, Rs 123
  AMOUNT: /(?:Rs\.?|INR|₹)\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
  
  // Matches keywords indicating spending
  DEBIT: /(?:debited|spent|paid|sent|txn|withdrawn|purchased|transfer)/i,
  
  // Matches keywords indicating income
  CREDIT: /(?:credited|received|deposited|added|refunded)/i,
  
  // Matches Merchant/Entity
  // 1. Matches "at Zomato", "to Ramesh"
  MERCHANT_AT: /(?:at|to|info)\s+([A-Za-z0-9\s\.\-_&]+?)(?:\s+on|\s+ref|\s+txn|\.$|$)/i,
  // 2. Matches UPI IDs
  MERCHANT_VPA: /(?:VPA|UPI|ref)\s*[:\-]?\s*([a-zA-Z0-9\.\@]+)/i,
  // 3. Matches specific bank formats "Info: <Merchant>"
  MERCHANT_INFO: /(?:Info|Msg)\s*[:\-]\s*([A-Za-z0-9\s]+)/i
};

const IGNORE_KEYWORDS = ['otp', 'verification', 'code', 'expire', 'loan', 'offer', 'approve'];

export const parseSMS = (sms: { body: string; receivedAt: string; _id: string; from: string }): Transaction | null => {
  const body = sms.body;
  const lowerBody = body.toLowerCase();

  // 0. Filter Spam/OTPs
  if (IGNORE_KEYWORDS.some(k => lowerBody.includes(k))) return null;

  // 1. Check for Amount (Crucial)
  const amountMatch = body.match(PATTERNS.AMOUNT);
  if (!amountMatch) return null; 

  const amountString = amountMatch[1].replace(/,/g, '');
  const amount = parseFloat(amountString);
  if (isNaN(amount)) return null;

  // 2. Determine Type (Debit vs Credit)
  const isDebit = PATTERNS.DEBIT.test(body);
  const isCredit = PATTERNS.CREDIT.test(body);

  if (!isDebit && !isCredit) return null; // Ambiguous message

  // 3. Extract Merchant / Description
  let description = "Unknown Transaction";
  
  const merchantVpa = body.match(PATTERNS.MERCHANT_VPA);
  const merchantAt = body.match(PATTERNS.MERCHANT_AT);
  const merchantInfo = body.match(PATTERNS.MERCHANT_INFO);

  if (merchantVpa) {
    description = `UPI: ${merchantVpa[1]}`;
  } else if (merchantAt) {
    description = merchantAt[1].trim();
  } else if (merchantInfo) {
    description = merchantInfo[1].trim();
  } else {
    // Fallback: Use the sender name/number (e.g., AD-HDFC)
    description = `Txn via ${sms.from || 'Bank'}`;
  }

  // Cleanup description
  description = description.replace(/[.,]*$/, '').trim();

  // 4. Categorize (Simple Rule-based)
  let category = "Uncategorized";
  const lowerDesc = description.toLowerCase();
  
  if (lowerDesc.includes('zomato') || lowerDesc.includes('swiggy') || lowerDesc.includes('food') || lowerDesc.includes('burger') || lowerDesc.includes('pizza')) category = 'Food & Dining';
  else if (lowerDesc.includes('uber') || lowerDesc.includes('ola') || lowerDesc.includes('petrol') || lowerDesc.includes('fuel') || lowerDesc.includes('shell')) category = 'Transportation';
  else if (lowerDesc.includes('netflix') || lowerDesc.includes('spotify') || lowerDesc.includes('movie') || lowerDesc.includes('cinema') || lowerDesc.includes('prime')) category = 'Entertainment';
  else if (lowerDesc.includes('amazon') || lowerDesc.includes('flipkart') || lowerDesc.includes('myntra') || lowerDesc.includes('zara') || lowerDesc.includes('uniqlo')) category = 'Shopping';
  else if (lowerDesc.includes('bill') || lowerDesc.includes('electricity') || lowerDesc.includes('recharge') || lowerDesc.includes('jio') || lowerDesc.includes('airtel')) category = 'Utilities';
  else if (lowerDesc.includes('upi') && amount > 2000) category = 'Transfer/Rent'; // Heuristic

  // 5. Construct Transaction
  return {
    id: sms._id || Date.now().toString() + Math.random(),
    amount: amount,
    category: category,
    description: description,
    date: new Date(sms.receivedAt).toISOString().split('T')[0],
    firewallDecision: 'ALLOW', 
    firewallReason: 'Imported from SMS'
  };
};