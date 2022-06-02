export interface TimeStamp {
  time: string;
}

export interface Block {
  timestamp: TimeStamp;
  height: number;
}

export interface Currency {
  name: string;
}

export interface SmartContract {
  contractType: null | "Generic" | "DEX" | "Token" | "Multisig";
}

export interface Address {
  address: string;
  smartContract: SmartContract;
}

export interface TransactionRes {
  block: Block;
  success: boolean;
  currency: Currency;
  amount: number;
  address: Address;
  hash: string;
}

export interface TransactionsRes {
  transactions: TransactionRes[];
}

export interface TransferObjectSender {
  sender: Address;
  amount: number;
  receiver: Address;
  currency: Currency;
  success: boolean;
  block: Block;
  transaction: {
    hash: string;
  };
}

export interface TransferRes {
  transfers: TransferObject[];
}

export interface DisperseQueryRes {
  ethereum: TransferRes;
}

export interface TransfersSenderQuery {
  ethereum: TransferResSender;
}

export interface LendingObject {
  id: string;
  borrower: string;
  timeCreated: string;
  gotchiTokenId: string;
}

export interface GotchiLendingRes {
  gotchiLendings: LendingObject[];
}

export interface AavegotchiObject {
  id: string;
  name: string;
  owner: {
    id: string;
  };
}

export interface NamesRes {
  aavegotchis: AavegotchiObject[];
}

export interface TransferObject {
  receiver: Address;
  sender: Address;
  amount: number;
  currency: Currency;
  success: boolean;
  block: Block;
  transaction: {
    hash: string;
    txFrom: Address;
  };
}

export interface TransferRes {
  transfers: TransferObject[];
}

export interface TransferResSender {
  transfers: TransferObjectSender[];
}

//Coinpath

export interface Coinpath {
  transaction: {
    hash: string;
  };
  amount: number;
  currency: {
    name: string;
  };
  sender: Address;
  receiver: Address;
  block: Block;
}

export interface CoinpathReceiver {
  transaction: {
    hash: string;
  };
  currency: {
    name: string;
  };
  receiver: Address;
  sender: Address;
}

export interface CoinpathRes {
  ethereum: {
    coinpath: Coinpath[];
  };
}

export interface SmartContractCall {
  transaction: {
    hash: string;
  };
  smartContractMethod: {
    name: string;
    signature: string;
    signatureHash: string;
  };

  smartContract: {
    address: {
      address: string;
    };
  };
}

export interface SmartContractRes {
  ethereum: {
    smartContractCalls: SmartContractCall[];
  };
}

export interface SenderCount {
  [address: string]: {
    txNumber: number;
    txRecipients: number;
    txAmounts: number[];
  };
}

export interface SenderRecipient {
  [address: string]: string[];
}

export interface Recipient {
  [address: string]: {
    fud: number;
    fomo: number;
    alpha: number;
    kek: number;
  };
}
