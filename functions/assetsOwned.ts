import request from "graphql-request";
import { coreMaticURL } from "../queries";

const query = (addresses: string[]) => {
  addresses = addresses.map((val) => `"${val}"`);

  return `
    {users(first:1000 where:{id_in:[${addresses}]}) {
        id
        parcelsOwned {
          id
        }
        gotchisOwned {
          id
        }
        gotchisLentOut {
          id
        }
        gotchisBorrowed {
          id
        }
      }}
    `;
};

export interface UserGotchisRes {
  users: UserGotchi[];
}

export interface UserGotchi {
  id: string;
  gotchisOwned: {
    id: string;
  }[];
  gotchisLentOut: {
    id: string;
  }[];
  gotchisBorrowed: {
    id: string;
  }[];
  parcelsOwned: {
    id: string;
  }[];
}

export async function userGotchis(addresses: string[]) {
  const res: UserGotchisRes = await request(coreMaticURL, query(addresses));
  return res;
}
