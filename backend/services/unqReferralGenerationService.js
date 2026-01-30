import { v4 as uuidv4 } from "uuid";

export const generateReferralUUID = () => {
  return `100CRCLUB${uuidv4().slice(0, 8).toUpperCase()}`;
};
