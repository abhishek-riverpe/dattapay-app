export type WalletAccount = {
  id: string;
  walletId: number;
  address: string;
  curve: string;
  pathFormat: string;
  path: string;
  addressFormat: string;
  created_at: string;
  updated_at: string;
};

export type Wallet = {
  id: string;
  userId: string;
  zynkWalletId: string;
  walletName: string;
  chain: string;
  status: string;
  account: WalletAccount | null;
  created_at: string;
  updated_at: string;
};

export type PreparePayload = {
  payloadId: string;
  payloadToSign: string;
};

export type Transaction = {
  hash: string;
  type: string;
  status: string;
  timestamp: string;
  from: string;
  to: string;
  amount: string;
  tokenSymbol: string;
  fee: string;
};

export type WalletTransactions = {
  wallet: {
    id: string;
    walletName: string;
    address: string;
  };
  transactions: Transaction[];
  total: number;
};
