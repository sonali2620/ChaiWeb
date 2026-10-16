// testHash.js
import crypto from "crypto";



const hashPassword = (password) => {
  return crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");
};
console.log(
  crypto.createHash("sha256").update("sarswati123").digest("hex")
);
