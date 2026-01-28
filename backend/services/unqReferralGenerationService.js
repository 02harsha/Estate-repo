const { v4: uuidv4 } = require("uuid");

export function generateReferralUUID() {
  return "REF"+uuidv4().slice(0, 8).toUpperCase();
}

