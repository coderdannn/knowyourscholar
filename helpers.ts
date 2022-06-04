import { addressDictionary } from "./addressDictionary";
import { Coinpath } from "./types";

export const recipientName = (val: Coinpath) => {
  return addressDictionary[val.receiver.address.toLowerCase()]
    ? addressDictionary[val.receiver.address.toLowerCase()]
    : val.receiver.address;
};
