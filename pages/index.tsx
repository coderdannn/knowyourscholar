import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useState } from "react";
import styles from "../styles/Home.module.css";
import * as ethers from "ethers";
import {
  alchemicaNames,
  craftAddresses,
  spilloverExtractors,
} from "../functions";
import { Coinpath, CoinpathRes, Recipient, SmartContractCall } from "../types";
import { addressDictionary } from "../addressDictionary";
import { recipientName } from "../helpers";

interface DataRes {
  inbound: CoinpathRes;
  outbound: CoinpathRes;
  receiveAmounts: Recipient;
  outboundAmounts: Recipient;
  craftAmounts: Recipient;
  lpAmounts: Recipient;
  smartContract: SmartContractCall[];
}

interface SighashToName {
  [tx: string]: string;
}

const sigHashToName: SighashToName = {
  a9059cbb: "transfer",

  "7c025200": "swap",
  ffa7802d: "claimGotchiLending",
  "85c3c3cf": "agreeGotchiLending",
  "095ea7b3": "approve",
  e449022e: "swap",
  fb3bdb41: "swap", //"swapETHForExactTokens",
  "18cbafe5": "swap", //"swapExactTokensForETH",
  "38ed1739": "swap", //"swapExactTokensForTokens",
  "5f575529": "swap",
  ae0c8bd8: "claimAndEndGotchiLending",
  "54e3f31b": "swap",
  abcffc26: "swap",
  "8027870e": "channelAlchemica",
  f7b4edda: "cancelGotchiLendingByToken",
  d6795a27: "addGotchiLending",
  ecf5f991: "updateWhitelist",
  "08642e24": "cancelERC1155Listing",
  "22c67519": "interact",
  "8ab03e31": "commitBid",
  "7ff36ab5": "swapExactETHForTokens",
  "5c11d795": "swapExactTokensForTokensSupportingFeeOnTransferTokens",

  // "23b872dd": "craftTiles",
  "9ff2a527": "craft",
  e8e33700: "addLiquidity",
  f5741bb8: "upgradeInstallation",
  "496e6d55": "finalizeUpgrades",
  // "9ff2a527":"craftInstallation"
};

const Home: NextPage = () => {
  const [inputAddress, setInputAddress] = useState(
    "0xa69d198c6474fe2b41ec69f924f0ce600cc9bf61"
  );
  const [valid, setValid] = useState(false);

  const [data, setData] = useState<DataRes>();

  const [loading, setLoading] = useState(false);

  const [hideCrafting, setHideCrafting] = useState(false);

  const validAddress = async (address: string) => {
    try {
      await ethers.utils.getAddress(address);
      setValid(true);
    } catch (error) {
      setValid(false);
    }
  };

  const handler = async () => {
    setLoading(true);

    try {
      const dataRes = await spilloverExtractors(inputAddress, true);
      setData(dataRes);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const extractPerc = (data: DataRes) => {
    let extractScore = 0;

    alchemicaNames.map((name) => {
      const address = inputAddress.toLowerCase();

      //@ts-ignore
      const receive = data.receiveAmounts[address]
        ? //@ts-ignore
          data.receiveAmounts[address][name]
        : 0;

      //@ts-ignore
      const sold = data.outboundAmounts[address]
        ? //@ts-ignore
          data.outboundAmounts[address][name]
        : 0;

      const extract = receive > 0 ? (sold / receive) * 100 : 0;

      extractScore += extract / 4;
    });

    return extractScore;
  };

  const type = (data: DataRes) => {
    const extractScore = extractPerc(data);

    if (extractScore === 100) return "bot";
    if (extractScore >= 80) return "extractooor";
    if (extractScore >= 60) return "player";
    if (extractScore >= 40) return "model scholar";
    else return "investooor";
  };

  const playerType = (
    type: "extractooor" | "player" | "model scholar" | "investooor" | "bot"
  ) => {
    if (type === "bot") return "Selling 100%";
    if (type === "extractooor") return "Selling more than 80%";
    if (type === "player") return "Selling more than 60%";
    if (type === "model scholar") return "Keeping more than 40%";
    else return "Keeping more than 80%";
  };

  const humanName = (
    val: Coinpath,
    smartContract: SmartContractCall | undefined
  ) => {
    if (craftAddresses.includes(recipientName(val))) {
      return "Craft / Upgrade";
    }

    const name = smartContract
      ? sigHashToName[smartContract.smartContractMethod.signatureHash]
      : "unknown";

    return name;
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Know Your Scholar</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Know Your Scholar</h1>

        <p className={styles.description}>
          Input an address below to see what your scholar has been up to!
        </p>

        <div className={styles.inputContainer}>
          <input
            value={inputAddress}
            onChange={(event) => {
              setData(undefined);
              console.log("hey");
              validAddress(event.currentTarget.value);
              setInputAddress(event.currentTarget.value);
            }}
            placeholder="Enter address"
            style={{
              border: valid ? "solid 3px green" : "solid 3px rgba(0,0,0,0.3)",
            }}
            className={styles.input}
          ></input>

          <button
            disabled={loading}
            onClick={() => handler()}
            className={styles.goButton}
          >
            {loading ? "Loading..." : "Go"}
          </button>
        </div>

        {data && (
          <h3>
            Inbound: {data.inbound.ethereum.coinpath.length} | Outbound{" "}
            {data.outbound.ethereum.coinpath.length}
          </h3>
        )}

        {data && data.inbound.ethereum.coinpath.length === 10000 && (
          <h3 style={{ color: "red" }}>
            {" "}
            WARNING: This address has more than 10,000 inbound txns. Data is
            likely incorrect.
          </h3>
        )}

        {data &&
          alchemicaNames.map((name) => {
            const address = inputAddress.toLowerCase();

            //@ts-ignore
            const receive = data.receiveAmounts[address]
              ? //@ts-ignore
                data.receiveAmounts[address][name]
              : 0;

            //@ts-ignore

            const sold = data.outboundAmounts[address]
              ? //@ts-ignore
                data.outboundAmounts[address][name]
              : 0;

            const lp = data.lpAmounts[address]
              ? //@ts-ignore
                data.lpAmounts[address][name]
              : 0;

            const extract = receive > 0 ? (sold / receive) * 100 : 0;

            return (
              <div key={name}>
                <p>
                  {name.toUpperCase()}: Received {receive.toFixed(2)} | LPd{" "}
                  {lp.toFixed(2)} | Sold {sold.toFixed(2)} extract rate:{" "}
                  {extract.toFixed(2)}%
                </p>
              </div>
            );
          })}

        {data && (
          <div>
            <hr />
            <h3>
              {`Your Scholar Type: ${type(data).toUpperCase()}`} (
              {extractPerc(data).toFixed(2)}
              %)
            </h3>

            <p style={{ marginTop: -10 }}>
              {`This Scholar is ${playerType(type(data))}`} of their earnings.
            </p>
          </div>
        )}

        {data && (
          <div>
            <hr />
            <h2>Outbound Txns</h2>

            <button onClick={() => setHideCrafting(!hideCrafting)}>
              {hideCrafting ? "Show Crafting" : "Hide Crafting"}
            </button>

            {data.outbound.ethereum.coinpath.map((val, index) => {
              const receiver = addressDictionary[val.receiver.address]
                ? addressDictionary[val.receiver.address]
                : val.receiver.address;

              // console.log("val:", val.transaction.hash);

              const foundContractCall = data.smartContract.find((sc) => {
                // console.log(
                //   "tx:",
                //   sc.smartContractMethod.name,
                //   sc.smartContractMethod.signatureHash
                // );

                return (
                  sc.transaction.hash === val.transaction.hash &&
                  sigHashToName[sc.smartContractMethod.signatureHash]
                );
              });

              const name = humanName(val, foundContractCall);

              if (val.amount === 0) return null;

              if (hideCrafting && name === "Craft / Upgrade") return null;

              return (
                <p key={index}>
                  <strong>[{humanName(val, foundContractCall)}] </strong>
                  {foundContractCall ? <strong></strong> : ""}{" "}
                  {val.amount.toFixed(2)} {val.currency.name} to {receiver}{" "}
                  <a
                    target="_blank noreferrer"
                    style={{ color: "blue" }}
                    href={`https://polygonscan.com/tx/${val.transaction.hash}`}
                  >
                    View Tx
                  </a>
                </p>
              );
            })}
          </div>
        )}

        {data && (
          <div>
            <h2>Inbound Txns</h2>
            {data.inbound.ethereum.coinpath.map((val, index) => {
              const sender = addressDictionary[val.sender.address]
                ? addressDictionary[val.sender.address]
                : val.sender.address;

              const isContract = val.sender.smartContract.contractType;

              return (
                <p key={index}>
                  {isContract !== null && <strong>[Contract]</strong>} {sender}{" "}
                  sent {val.amount} {val.currency.name}{" "}
                  <a
                    target="_blank noreferrer"
                    style={{ color: "blue" }}
                    href={`https://polygonscan.com/tx/${val.transaction.hash}`}
                  >
                    View Tx
                  </a>
                </p>
              );
            })}
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank noreferrer"
          rel="noopener noreferrer"
        >
          Powered by{" "}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  );
};

export default Home;
