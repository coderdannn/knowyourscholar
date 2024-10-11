export const queryHeaders = {
  "Content-Type": "application/json",
  "X-API-KEY": process.env.BITQUERY_API_KEY,
};

export const coreMaticURL =
  "https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic";

export const lendingURL =
  "https://api.thegraph.com/subgraphs/name/froid1911/aavegotchi-lending";

export const bitQueryURL = "https://graphql.bitquery.io/";

export const extractooorCoinpath = `
query ExtractoorCoinpath($addresses: [String!]!, $checkTokens: [String!]!) {
  ethereum(network: matic) {
    coinpath(
      receiver: {in: $addresses}
      options: {desc: "block.timestamp.time", limit:10000}
      currency:{in: $checkTokens} 
      
    ) {
      amount
      currency {
        name
      }
      sender {
        address
        smartContract {
          contractType
        }
      }
      transaction {
        hash
      }
      receiver {
        address
        smartContract {
          contractType
        }
      }
     
      block {
        timestamp {
          time
        }
      }
    }
  }
}

`;

export const extractooorSells = `
query ExtractoorCoinpath($addresses: [String!]!, $checkTokens: [String!]!) {
  ethereum(network: matic) {
    coinpath(
      sender: {in: $addresses}
      options: {desc: "block.timestamp.time", limit:10000}
      currency:{in: $checkTokens} 
      
    ) {
      amount
      currency {
        name
      }
      sender {
        address
        smartContract {
          contractType
        
        }
      }
      receiver {
        address
        smartContract {
          contractType
          currency {
            tokenType
            symbol

          }
        }
      }
      transaction {
        hash
      }
     
      block {
        timestamp {
          time
        }
      }
    }
  }
}

`;

export const findLenders = (limit: number) => {
  const query = `
    {gotchiLendings(first: ${limit} orderBy:timeCreated, orderDirection:desc where:{timeAgreed_gt:0}) {
    id
    borrower
    gotchiTokenId
    timeCreated
  }}
    `;

  return query;
};

export const smartContractcalls = `
query SmartContractCalls($txHashes: [String!]!) {
  ethereum(network: matic) {
    smartContractCalls(
      options: {limit: 10000}
      txHash: {in: $txHashes}
    ) {
      smartContractMethod {
        name
        signature
        signatureHash
      }
      transaction {
        hash
      }
    }
  }
}
`;

export const gotchiverseSinks = `
{installationTypes(first:1000) {
  id
  amount
  alchemicaCost
  name
}
tileTypes(first:1000) {
  id
  amount
  alchemicaCost
  name
}
bounceGateEvents(first:1000) {
  id
  priority
}
}
`;

export const gotchiverseSinkEvents = (timestamp: string) => {
  return `
{mintInstallationEvents(first:1000, where:{timestamp_gt:${timestamp}}) {
  id
  installationType {
    id
    name
    alchemicaCost
  }
}

bounceGateEvents(first:1000, where:{lastTimeUpdated_gt:${timestamp}}) {
  id
  priority
}
}
`;
};

export const gotchiverseSources = (
  timestamp: string,
  alchemicaType: string
) => {
  return `
{
  channelAlchemicaEvents(first:1000 orderBy:timestamp, orderDirection:desc, where:{timestamp_gt: ${timestamp}}) {
  id
  parcel {
    id
    owner
  }
  spilloverRate
  alchemica
}
alc1: alchemicaClaimedEvents(first:1000, orderBy:timestamp, orderDirection:desc, where:{alchemicaType:"${alchemicaType}", timestamp_gt:${timestamp}}) {
${claimedEvent}
}
alc2: alchemicaClaimedEvents(skip: 1000, first:1000, orderBy:timestamp, orderDirection:desc, where:{alchemicaType:"${alchemicaType}", timestamp_gt:${timestamp}}) {
  ${claimedEvent}
  }
  alc3: alchemicaClaimedEvents(skip: 2000, first:1000, orderBy:timestamp, orderDirection:desc, where:{alchemicaType:"${alchemicaType}", timestamp_gt:${timestamp}}) {
    ${claimedEvent}
    }
    alc4: alchemicaClaimedEvents(skip: 3000, first:1000, orderBy:timestamp, orderDirection:desc, where:{alchemicaType:"${alchemicaType}", timestamp_gt:${timestamp}}) {
      ${claimedEvent}
      }
      alc5: alchemicaClaimedEvents(skip: 4000 first:1000, orderBy:timestamp, orderDirection:desc, where:{alchemicaType:"${alchemicaType}", timestamp_gt:${timestamp}}) {
        ${claimedEvent}
        }
}
`;
};

const claimedEvent = `
id
amount
spilloverRate
spilloverRadius
alchemicaType
parcel {
  id
  owner
}`;
