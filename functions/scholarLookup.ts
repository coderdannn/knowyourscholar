import request from "graphql-request";
import { recipientName } from "../helpers";
import {
  bitQueryURL,
  extractooorCoinpath,
  extractooorSells,
  queryHeaders,
  smartContractcalls,
} from "../queries";
import {
  CoinpathRes,
  Recipient,
  SenderCount,
  SenderRecipient,
  SmartContractCall,
  SmartContractRes,
} from "../types";
import { userGotchis } from "./assetsOwned";
import { dexTrades } from "./dexTrades";
import { gotchiverseStats } from "./gotchiAssets";

export const tokenNames = ["ghst", "fud", "fomo", "alpha", "kek"];
export const alchemicaNames = ["fud", "fomo", "alpha", "kek"];

export const craftAddresses = [
  "Pixelcraft",
  "AavegotchiDAO",
  "Gotchiverse Contract",
  "Polygon burn address",
  "Pixelcraft Gnosis",
];

export const gotchiTokens = [
  "0x385eeac5cb85a38a9a07a70c73e0a3271cfb54a7", //ghst
  "0x42e5e06ef5b90fe15f853f59299fc96259209c5c", //kek
  "0x6a3e7c3c6ef65ee26975b12293ca1aad7e1daed2", //alpha
  "0x403e967b044d4be25170310157cb1a4bf10bdd0f", //fud
  "0x44a6e0be76e1d9620a7f76588e4509fe4fa8e8c8", //fomo
];

const ghstSwapPairs = [
  "0xc765eca0ad3fd27779d36d18e32552bd7e26fd7b",
  "0xfec232cc6f0f3aeb2f81b2787a9bc9f6fc72ea5c",
  "0x641ca8d96b01db1e14a5fba16bc1e5e508a45f2b",
  "0xbfad162775ebfb9988db3f24ef28ca6bc2fb92f0",
  "0xb0e35478a389dd20050d66a67fb761678af99678",
];

export const otherAddresses = ["AavegotchiGBM", "Aavegotchi"];

export async function spilloverExtractors(address: string, output: boolean) {
  address = address.toLowerCase();

  /* SCRIPT DESCRIPTION 
  
  This script pulls the last 10 Gotchi Lending borrowers and analyses their inbound and outbound transactions.
  
  Outbound transactions are classified into two types:
  
  SELL - txns which have a known dex as their destination
  CRAFT - txns which have a known crafting destination
  OTHER - unused (was previously used for GHST)
  
  */

  const senderCount: SenderCount = {};
  const senderRecipients: SenderRecipient = {};

  const owners = [address];

  try {
    const res: CoinpathRes = await request(
      bitQueryURL,
      extractooorCoinpath,
      {
        checkTokens: gotchiTokens,
        // addresses: addresses,
        addresses: owners,
      },

      //@ts-ignore
      queryHeaders
    );

    console.log(`${res.ethereum.coinpath.length} inbound transfers found!`);

    const allRecipients: Recipient = {};

    res.ethereum.coinpath.forEach((element) => {
      const sender = element.sender.address;
      const recipient = element.receiver.address;

      const currency = element.currency.name.split(" ")[1].toLowerCase();

      if (!allRecipients[recipient]) {
        // if (!addressDictionary[recipient] && !ignore.includes(recipient)) {
        allRecipients[recipient] = {
          fud: 0,
          fomo: 0,
          alpha: 0,
          kek: 0,
          ghst: 0,
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

    const dexTradesRes = await dexTrades(address);

    console.log("trades:", dexTradesRes.ethereum.dexTrades);

    const sellRes: CoinpathRes = await request(
      bitQueryURL,
      extractooorSells,
      {
        checkTokens: gotchiTokens,
        addresses: owners,
      },

      //@ts-ignore
      queryHeaders
    );

    const txHashes = sellRes.ethereum.coinpath
      .filter((val) => {
        return (
          !craftAddresses.includes(recipientName(val)) &&
          !otherAddresses.includes(recipientName(val))
        );
      })
      .map((val) => val.transaction.hash);
    // .slice(0, 100);

    let smartContractCalls: SmartContractCall[] = [];
    const batchSize = 100;
    const batches = Math.ceil(txHashes.length / batchSize);

    for (let index = 0; index < batches; index++) {
      console.log(`Looking up sc calls, batch ${index} of ${batches}`);
      const batch = txHashes.slice(index * batchSize, (index + 1) * batchSize);

      const smartContractRes: SmartContractRes = await request(
        bitQueryURL,
        smartContractcalls,
        {
          txHashes: batch,
        },

        //@ts-ignore
        queryHeaders
      );

      smartContractCalls = smartContractCalls.concat(
        smartContractRes.ethereum.smartContractCalls
      );
    }

    const sellAmounts: Recipient = {};
    const craftAmounts: Recipient = {};
    const transferAmounts: Recipient = {};
    const addLiquidityAmounts: Recipient = {};
    const convertToGhstAmounts: Recipient = {};
    const gotchiLendingAmounts: Recipient = {};
    const otherAmounts: Recipient = {};

    if (!sellAmounts[address]) {
      sellAmounts[address] = {
        fud: 0,
        fomo: 0,
        alpha: 0,
        kek: 0,
        ghst: 0,
      };
    }

    if (!transferAmounts[address]) {
      transferAmounts[address] = {
        fud: 0,
        fomo: 0,
        alpha: 0,
        kek: 0,
        ghst: 0,
      };
    }

    if (!otherAmounts[address]) {
      otherAmounts[address] = {
        fud: 0,
        fomo: 0,
        alpha: 0,
        kek: 0,
        ghst: 0,
      };
    }

    if (!craftAmounts[address]) {
      craftAmounts[address] = {
        fud: 0,
        fomo: 0,
        alpha: 0,
        kek: 0,
        ghst: 0,
      };
    }

    if (!addLiquidityAmounts[address]) {
      addLiquidityAmounts[address] = {
        fud: 0,
        fomo: 0,
        alpha: 0,
        kek: 0,
        ghst: 0,
      };
    }

    if (!gotchiLendingAmounts[address]) {
      gotchiLendingAmounts[address] = {
        fud: 0,
        fomo: 0,
        alpha: 0,
        kek: 0,
        ghst: 0,
      };
    }

    if (!convertToGhstAmounts[address]) {
      convertToGhstAmounts[address] = {
        fud: 0,
        fomo: 0,
        alpha: 0,
        kek: 0,
        ghst: 0,
      };
    }

    //handle swaps
    dexTradesRes.ethereum.dexTrades.forEach((val) => {
      // console.log("val:", val.buyCurrency.name, val.sellCurrency.name);

      const buyCurrency =
        val.buyCurrency.name.split(" ").length > 1
          ? val.buyCurrency.name.split(" ")[1].toLowerCase()
          : val.buyCurrency.name.toLowerCase();
      const sellCurrency =
        val.sellCurrency.name.split(" ").length > 1
          ? val.sellCurrency.name.split(" ")[1].toLowerCase()
          : val.sellCurrency.name.toLowerCase();

      //converting alchemica to ghst
      if (alchemicaNames.includes(buyCurrency) && sellCurrency === "ghst") {
        // console.log(
        //   `sell ${val.buyAmount} ${buyCurrency} for ${val.sellAmount} ${sellCurrency}`
        // );

        //@ts-expect-error
        convertToGhstAmounts[address][buyCurrency] += val.buyAmount;
      } else if (
        alchemicaNames.includes(buyCurrency) &&
        sellCurrency !== "ghst"
      ) {
        //@ts-expect-error
        sellAmounts[address][buyCurrency] += val.buyAmount;
      } else if (buyCurrency === "ghst") {
        const sameTxns = dexTradesRes.ethereum.dexTrades.filter(
          (dexTx) => dexTx.transaction.hash === val.transaction.hash
        );

        /*  console.log(
          `sell ${val.buyAmount} ${buyCurrency} for ${val.sellAmount} ${sellCurrency}`
        );
 */
        let isAlchemicaSwap = false;
        sameTxns.forEach((element) => {
          const buyC =
            element.buyCurrency.name.split(" ").length > 1
              ? element.buyCurrency.name.split(" ")[1].toLowerCase()
              : element.buyCurrency.name.toLowerCase();

          if (alchemicaNames.includes(buyC)) {
            isAlchemicaSwap = true;
          }
        });

        if (isAlchemicaSwap === false) {
          console.log("sold ghst", val.buyAmount);

          console.log("val:", val);
          sellAmounts[address][buyCurrency] += val.buyAmount;
        }
      }
    });

    sellRes.ethereum.coinpath.forEach((element) => {
      if (element.amount !== 0) {
        const sender = element.sender.address;

        const currency = element.currency.name.split(" ")[1].toLowerCase();

        //Crafting
        if (craftAddresses.includes(recipientName(element))) {
          //@ts-expect-error
          craftAmounts[sender][currency] += element.amount;

          // other
        } else if (otherAddresses.includes(recipientName(element))) {
          //@ts-expect-error
          otherAmounts[sender][currency] += element.amount;
        }

        //selling
        else {
          //Check the tx type
          const contractCalls = smartContractCalls.filter(
            (val) => val.transaction.hash === element.transaction.hash
          );

          const addLiquidity = contractCalls.find(
            (val) => val.smartContractMethod.name === "addLiquidity"
          );

          const agreeGotchiLending = contractCalls.find(
            (val) => val.smartContractMethod.signatureHash === "85c3c3cf"
          );

          const isSwap = contractCalls.find(
            (val) =>
              val.smartContractMethod.name !== null &&
              val.smartContractMethod.name.includes("swap")
          );

          // const isGhstSwap = ghstSwapPairs.includes(element.receiver.address);

          // console.log("is ghst swap:", isGhstSwap);

          if (isSwap) {
            //ignore
          } else if (agreeGotchiLending) {
            //@ts-expect-error
            gotchiLendingAmounts[sender][currency] += element.amount;
          } else if (addLiquidity) {
            //@ts-expect-error
            addLiquidityAmounts[sender][currency] += element.amount;
          } else {
            //probably a transfer
            //@ts-expect-error
            transferAmounts[sender][currency] += element.amount;
          }
        }
      }
    });

    Object.entries(allRecipients).forEach((element) => {
      const received = element[1];

      console.log("Analysis of account:", element[0]);
      const sell = sellAmounts[element[0]];
      const craft = craftAmounts[element[0]];
      const transfer = transferAmounts[element[0]];
      const addLiq = addLiquidityAmounts[element[0]];
      const swapForGhst = convertToGhstAmounts[element[0]];

      if (transferAmounts) {
        console.log("TRANSFER AMOUNTS:", transfer);
      }

      if (swapForGhst) console.log("SWAP FOR GHST:", convertToGhstAmounts);

      if (output) console.log("RECEIVED:", element[1]);

      if (sell) {
        if (output) console.log("SOLD:", sell);
      }

      if (craft) {
        if (output) console.log("CRAFTED:", craftAmounts[element[0]]);
      }

      if (addLiq) {
        if (output)
          console.log("ADD LIQUIDITY:", addLiquidityAmounts[element[0]]);
      }
    });

    const gotchiAssets = await gotchiverseStats([address]);

    const foundAssets = gotchiAssets.stats.find((val) =>
      val.id.toLowerCase().includes(address.toLowerCase())
    );

    const assetsOwned = await userGotchis([address.toLowerCase()]);

    console.log("assets:", assetsOwned);
    const userAssets = assetsOwned.users.find(
      (val) => val.id.toLowerCase() === address.toLowerCase()
    );

    console.log("gotchi lending:", gotchiLendingAmounts);

    return {
      inbound: res,
      outbound: sellRes,
      receiveAmounts: allRecipients,
      outboundAmounts: sellAmounts,
      craftAmounts: craftAmounts,
      gotchiLendingAmounts: gotchiLendingAmounts,
      convertToGhstAmounts: convertToGhstAmounts,
      transferAmounts: transferAmounts,
      smartContract: smartContractCalls,
      lpAmounts: addLiquidityAmounts,
      gotchiverseAssets: foundAssets,
      assetsOwned: userAssets,
      dexTrades: dexTradesRes,
    };
  } catch (error) {
    console.log("error:", error);
  }

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
