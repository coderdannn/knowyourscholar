import request from "graphql-request";

export const gotchiverseUrl =
  "https://api.thegraph.com/subgraphs/name/aavegotchi/gotchiverse-matic";

const query = (addresses: string[]) => {
  addresses = addresses.map((val) => `"user-${val}"`);

  return `
  {stats(first:1000, where:{id_in:[${addresses}]}) {
    id
    tilesMinted
    installationsUpgradedTotal
    installationsMintedTotal
  }}
    `;
};

export interface GotchiverseStatsRes {
  stats: GotchiverseStats[];
}

export interface GotchiverseStats {
  id: string;
  tilesMinted: string;
  installationsUpgradedTotal: string;
  installationsMintedTotal: string;
}

export async function gotchiverseStats(addresses: string[]) {
  const res: GotchiverseStatsRes = await request(
    gotchiverseUrl,
    query(addresses)
  );
  return res;
}
