// server/utils/telegramAuth.js
import crypto from "crypto";

export const verifyTelegramAuth = (data, botToken) => {
  const { hash: receivedHash } = data;
  const dataCopy = { ...data };
  delete dataCopy.hash;
  const dataCheckArr = Object.keys(dataCopy)
    .sort()
    .map((key) => `${key}=${dataCopy[key]}`);
  const dataCheckString = dataCheckArr.join("\n");
  const secretKey = crypto.createHash("sha256").update(botToken).digest();
  const calculatedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");
  return calculatedHash === receivedHash.toLowerCase();
};
