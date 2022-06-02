import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useState } from "react";
import styles from "../styles/Home.module.css";
import * as ethers from "ethers";
import { alchemicaNames, spilloverExtractors } from "../functions";
import { CoinpathRes, Recipient, SmartContractRes } from "../types";
import { addressDictionary } from "../addressDictionary";

interface DataRes {
  inbound: CoinpathRes;
  outbound: CoinpathRes;
  receiveAmounts: Recipient;
  outboundAmounts: Recipient;
  craftAmounts: Recipient;
  smartContract: SmartContractRes;
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
  "9ff2a527": "craftTiles",
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

  const validAddress = async (address: string) => {
    try {
      await ethers.utils.getAddress(address);
      setValid(true);
    } catch (error) {
      setValid(false);
    }
  };

  const handler = async () => {
    const dataRes = await spilloverExtractors(inputAddress, false);
    setData(dataRes);
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

          <button onClick={() => handler()} className={styles.goButton}>
            Go
          </button>
        </div>

        {data &&
          alchemicaNames.map((name) => {
            console.log("amunts:", data.receiveAmounts);

            const address = inputAddress.toLowerCase();

            //@ts-ignore
            const receive =
              //@ts-ignore
              data.receiveAmounts[address][name];

            //@ts-ignore

            const sold = data.outboundAmounts[address]
              ? //@ts-ignore
                data.outboundAmounts[address][name]
              : 0;

            const extract =
              //@ts-ignore
              (data.outboundAmounts[address][name] /
                //@ts-ignore
                data.receiveAmounts[address][name]) *
              100;

            return (
              <div key={name}>
                <p>
                  {name.toUpperCase()}: Received {receive.toFixed(2)}, sold{" "}
                  {sold.toFixed(2)} extract rate: {extract.toFixed(2)}%
                </p>
              </div>
            );
          })}

        {data && (
          <div>
            <h2>Outbound</h2>
            {data.outbound.ethereum.coinpath.map((val, index) => {
              const receiver = addressDictionary[val.receiver.address]
                ? addressDictionary[val.receiver.address]
                : val.receiver.address;

              console.log("val:", val.transaction.hash);

              const foundContractCall =
                data.smartContract.ethereum.smartContractCalls.find((sc) => {
                  console.log(
                    "tx:",
                    sc.smartContractMethod.name,
                    sc.smartContractMethod.signatureHash
                  );

                  return (
                    sc.transaction.hash === val.transaction.hash &&
                    sigHashToName[sc.smartContractMethod.signatureHash]
                  );
                });

              //   console.log("txns:", val.transactions.length);

              console.log("found call:", foundContractCall);

              const sender = addressDictionary[val.sender.address]
                ? addressDictionary[val.sender.address]
                : val.sender.address;

              const humanName = foundContractCall
                ? sigHashToName[
                    foundContractCall.smartContractMethod.signatureHash
                  ]
                : "unknown";

              return (
                <p key={index}>
                  <strong>
                    {humanName}{" "}
                    {foundContractCall?.smartContractMethod.signatureHash}
                  </strong>
                  {foundContractCall ? <strong></strong> : ""} {sender} sent{" "}
                  {val.amount} {val.currency.name} to {receiver}{" "}
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
            <h2>Inbound</h2>
            {data.inbound.ethereum.coinpath.map((val, index) => {
              const sender = addressDictionary[val.sender.address]
                ? addressDictionary[val.sender.address]
                : val.sender.address;

              console.log("val:", val);

              return (
                <p key={index}>
                  {sender} sent {val.amount} {val.currency.name} in tx:{" "}
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
