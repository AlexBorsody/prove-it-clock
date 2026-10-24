/** Tip jar data: public Coinbase receive addresses (one per asset). */
export const TIPS: { label: string; network: string; address: string }[] = [
  {
    label: "BTC",
    network: "Bitcoin",
    address: "1PAgr3wz6pwPdagcM7ebY3VBcXtTQ1Q5z3",
  },
  {
    label: "BAT",
    network: "Ethereum",
    address: "0x13b438F5c7377E2f04D066365e44c92c37a1a6EE",
  },
  {
    label: "LTC",
    network: "Litecoin",
    address: "LYHNar5p93BRqMEGxpowDLo6nVXXwDtz1d",
  },
  {
    label: "SOL",
    network: "Solana",
    address: "GVAV2cBmJYiKaUtu7ubPjN2aVwEZaaAWfn8g2KeFa8r4",
  },
  {
    label: "DASH",
    network: "Dash",
    address: "Xcycby8KzEkqTSx3L1Y33pfF1VSaQrBDep",
  },
  {
    label: "ETH",
    network: "Ethereum",
    address: "0xED304FE2eF534D4773ee182C188d30A358D35d75",
  },
  {
    label: "LINK",
    network: "Ethereum",
    address: "0x5DF6DaB753Be058AAaaf55c47b569B4a6B1B0489",
  },
  {
    label: "ZRO",
    network: "Ethereum",
    address: "0x35876eab0959874dB8df9895dbaa46bE9643dBEc",
  },
];

const URI_SCHEMES: Record<string, string> = {
  Bitcoin: "bitcoin",
  Litecoin: "litecoin",
  Solana: "solana",
  Dash: "dash",
  Ethereum: "ethereum",
};

/** Wallet payment URI for QR codes, e.g. bitcoin:1PAg... */
export function tipUri(tip: { network: string; address: string }): string {
  const scheme = URI_SCHEMES[tip.network];
  return scheme ? `${scheme}:${tip.address}` : tip.address;
}
