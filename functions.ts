import request from "graphql-request";
import { addressDictionary } from "./addressDictionary";
import {
  bitQueryURL,
  extractooorCoinpath,
  extractooorSells,
  queryHeaders,
  smartContractcalls,
} from "./queries";
import {
  CoinpathRes,
  GotchiLendingRes,
  Recipient,
  SenderCount,
  SenderRecipient,
  SmartContractCall,
  SmartContractRes,
} from "./types";

export const alchemicaNames = ["fud", "fomo", "alpha", "kek"];

export async function spilloverExtractors(address: string, output: boolean) {
  /* SCRIPT DESCRIPTION 
  
  This script pulls the last 10 Gotchi Lending borrowers and analyses their inbound and outbound transactions.
  
  Outbound transactions are classified into two types:
  
  SELL - txns which have a known dex as their destination
  CRAFT - txns which have a known crafting destination
  OTHER - unused (was previously used for GHST)
  
  */

  const alchemica = [
    "0x42e5e06ef5b90fe15f853f59299fc96259209c5c", //kek
    "0x6a3e7c3c6ef65ee26975b12293ca1aad7e1daed2", //alpha
    "0x403e967b044d4be25170310157cb1a4bf10bdd0f", //fud
    "0x44a6e0be76e1d9620a7f76588e4509fe4fa8e8c8", //fomo
  ];

  const senderCount: SenderCount = {};
  const senderRecipients: SenderRecipient = {};

  //   // //Then we fetch all the Gotchi Lendings to get the Gotchi IDs
  //   const lendingRes: GotchiLendingRes = await request(
  //     lendingURL,
  //     findLenders(10)
  //   );

  //   const owners = [
  //     ...new Set(lendingRes.gotchiLendings.map((val) => val.borrower)),
  //   ];

  const owners = [address];

  // console.log("owners:", owners);

  const res: CoinpathRes = await request(
    bitQueryURL,
    extractooorCoinpath,
    {
      checkTokens: alchemica,
      // addresses: addresses,
      addresses: owners,
    },

    //@ts-ignore
    queryHeaders
  );

  console.log(`${res.ethereum.coinpath.length} inbound transfers found!`);

  // const smartContractCallsRes =

  const allRecipients: Recipient = {};

  res.ethereum.coinpath.forEach((element) => {
    const sender = element.sender.address;
    const recipient = element.receiver.address;

    if (output) {
      // console.log(
      //   `Received ${element.amount} ${element.currency.name} from ${sender}`
      // );
    }

    const currency = element.currency.name.split(" ")[1].toLowerCase();

    // if (!addressDictionary[recipient] && !ignore.includes(recipient)) {
    if (!allRecipients[recipient]) {
      allRecipients[recipient] = {
        fud: 0,
        fomo: 0,
        alpha: 0,
        kek: 0,
      };
    }

    if (allRecipients[recipient]) {
      //@ts-expect-error
      allRecipients[recipient][currency] =
        //@ts-expect-error
        allRecipients[recipient][currency] + element.amount;
    } else {
      //@ts-expect-error
      allRecipients[recipient][currency] = element.amount;
    }
    // }

    //Initialize
    if (!senderCount[sender]) {
      senderCount[sender] = {
        txNumber: 0,
        txRecipients: 0,
        txAmounts: [],
      };
    }
    if (!senderRecipients[sender]) {
      senderRecipients[sender] = [];
    }

    senderCount[sender].txNumber++;
    senderCount[sender].txAmounts.push(element.amount);

    if (!senderRecipients[sender].includes(recipient)) {
      senderRecipients[sender].push(recipient);
      if (!senderCount[sender].txRecipients) {
        senderCount[sender].txRecipients = 1;
      } else {
        senderCount[sender].txRecipients++;
      }
    }
    //   }
  });

  //Now lets see how much they sell!

  const sellRes: CoinpathRes = await request(
    bitQueryURL,
    extractooorSells,
    {
      // ignore: ignore,
      // block: currentBlock - 1296000 * 4,
      checkTokens: alchemica,
      // addresses: addresses,
      addresses: owners,
    },

    //@ts-ignore
    queryHeaders
  );

  console.log(`${sellRes.ethereum.coinpath.length} outbound transfers found!`);

  const txHashes = sellRes.ethereum.coinpath
    .map((val) => val.transaction.hash)
    .slice(0, 100);

  const smartContractRes: SmartContractRes = await request(
    bitQueryURL,
    smartContractcalls,
    {
      txHashes: txHashes,
    },

    //@ts-ignore
    queryHeaders
  );

  console.log("smart contract:", smartContractRes.ethereum.smartContractCalls);

  const sellAmounts: Recipient = {};
  const craftAmounts: Recipient = {};
  // const otherAmounts: Recipient = {};

  sellRes.ethereum.coinpath.forEach((element) => {
    if (element.amount !== 0) {
      // console.log("element:", element);

      //not really interested in smart contracts
      //  if (element.sender.smartContract.contractType === null) {
      const sender = element.sender.address;
      const recipient = element.receiver.address;

      //All the smart contract txns
      // if (element.receiver.smartContract.contractType !== null) {
      // console.log(
      //   `${sender} sent ${element.amount} ${element.currency.name} to ${recipient}, ${element.transactions[0].txHash}. Contract type: ${element.receiver.smartContract.contractType}`
      // );
      // }

      const craftAddresses = [
        "Pixelcraft",
        "AavegotchiDAO",
        "Gotchiverse Contract",
        "Polygon burn address",
      ];

      // const otherAddresses = ["AavegotchiGBM", "Aavegotchi"];

      const currency = element.currency.name.split(" ")[1].toLowerCase();

      if (!sellAmounts[sender]) {
        sellAmounts[sender] = {
          fud: 0,
          fomo: 0,
          alpha: 0,
          kek: 0,
        };
      }

      // if (!otherAmounts[sender]) {
      //   otherAmounts[sender] = {
      //     fud: 0,
      //     fomo: 0,
      //     alpha: 0,
      //     kek: 0,
      //   };
      // }

      if (!craftAmounts[sender]) {
        craftAmounts[sender] = {
          fud: 0,
          fomo: 0,
          alpha: 0,
          kek: 0,
        };
      }

      //Crafting
      if (craftAddresses.includes(recipient)) {
        //@ts-expect-error
        craftAmounts[sender][currency] += element.amount;
      }
      //other
      // } else if (otherAddresses.includes(recipient)) {
      //   //@ts-expect-error
      //   otherAmounts[sender][currency] += element.amount;
      // }

      //selling
      else {
        //@ts-expect-error
        sellAmounts[sender][currency] += element.amount;
      }
    }
  });

  Object.entries(allRecipients).forEach((element) => {
    const received = element[1];

    console.log("Analysis of account:", element[0]);
    const sell = sellAmounts[element[0]];
    const craft = craftAmounts[element[0]];
    // const other = otherAmounts[element[0]];

    let fud = element[1].fud;
    let fomo = element[1].fomo;
    let alpha = element[1].alpha;
    let kek = element[1].kek;

    if (output) console.log("RECEIVED:", element[1]);

    if (sell) {
      if (output) console.log("SOLD:", sell);

      fud = element[1].fud - sell.fud;
      fomo = element[1].fomo - sell.fomo;
      alpha = element[1].alpha - sell.alpha;
      kek = element[1].kek - sell.kek;
    }

    if (craft) {
      if (output) console.log("CRAFTED:", craftAmounts[element[0]]);

      fud = element[1].fud - craft.fud;
      fomo = element[1].fomo - craft.fomo;
      alpha = element[1].alpha - craft.alpha;
      kek = element[1].kek - craft.kek;
    }

    // if (other) {
    //   if (output) console.log(" OTHER:", otherAmounts[element[0]]);

    //   fud = element[1].fud - craft.fud;
    //   fomo = element[1].fomo - craft.fomo;
    //   alpha = element[1].alpha - craft.alpha;
    //   kek = element[1].kek - craft.kek;
    // }

    // alchemicaNames.forEach((name) => {
    //   console.log("sell:", sell);

    //   //@ts-expect-error
    //   const sold = sell[name];

    //   //@ts-expect-error
    //   const earned = received[name];

    //   console.log(
    //     `${name.toUpperCase()}: Sold ${sold.toFixed(2)} of ${earned.toFixed(
    //       2
    //     )}. ${
    //       //@ts-expect-error
    //       ((sell[name] / element[1][name]) * 100).toFixed(2)
    //     }% extracted!`
    //   );
    // });
  });

  return {
    inbound: res,
    outbound: sellRes,
    receiveAmounts: allRecipients,
    outboundAmounts: sellAmounts,
    craftAmounts: craftAmounts,
    smartContract: smartContractRes,
  };

  // const finalCount: SenderCount = {};

  // Object.keys(senderCount).map((val) => {
  //   if (senderCount[val].txNumber >= 5) {
  //     finalCount[val] = senderCount[val];
  //   }
  // });

  // let entries = Object.entries(finalCount);
  // let sortedSenders = entries.sort((a, b) => b[1].txNumber - a[1].txNumber);

  // sortedSenders.forEach((el) => {
  //   if (el[1].txNumber === el[1].txRecipients) {
  //     console.log(
  //       `${el[0]} sent ${el[1].txNumber} GHST txns to ${el[1].txRecipients} recipients. Amounts: ${el[1].txAmounts}`
  //     );
  //   }
  // });

  // let sortedRecipients = Object.entries(allRecipients).sort(
  //   (a, b) => b[1] - a[1]
  // );

  // console.log("All recipients:", sortedRecipients);

  //Now lets take the top 100 and see how much they have transferred out.

  // const online = await currentOnline(180);

  // Object.entries(allRecipients).forEach((recipient) => {
  //   const row = online.raw.find(
  //     (val) => val.owner.toLowerCase() === recipient[0].toLowerCase()
  //   );

  //   if (row) {
  //     console.log(
  //       `${row.owner} found! ${row.captcha_score_avg} captcha, ${row.captcha_score_count} count, ${row.discord_score} discord score.`
  //     );
  //   }
  // });
}
