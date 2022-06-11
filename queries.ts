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
