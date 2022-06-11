import request from "graphql-request";
import { bitQueryURL, queryHeaders } from "../queries";

export interface DexTradesRes {
  ethereum: {
    dexTrades: DexTrade[];
  };
}

export interface DexTrade {
  sellCurrency: {
    //the currency being bought
    name: string;
  };
  sellAmount: number;
  buyCurrency: {
    //the currency being sold to buy
    name: string;
  };
  count: number;
  buyAmount: number;
  transaction: {
    hash: string;
  };
}

export const gotchiverseUrl =
  "https://api.thegraph.com/subgraphs/name/aavegotchi/gotchiverse-matic";

const query = `
 query DexTradeQuery($address:String!) {
        ethereum(network: matic) {
          dexTrades(
            options: {limit: 10000, desc: "count"}
            txSender: {is: $address}
          ) {
            sellCurrency {
              name
            }
            sellAmount
            buyCurrency {
              name
            }
            count
            buyAmount
           
          }
        }
      }
    
    `;

export async function dexTrades(address: string) {
  const res: DexTradesRes = await request(
    bitQueryURL,
    query,
    {
      address: address,
    },

    //@ts-ignore
    queryHeaders
  );

  console.log("res:", res);

  return res;
}
