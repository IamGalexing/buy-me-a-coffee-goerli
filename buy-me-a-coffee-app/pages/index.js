import React, { useEffect, useState } from "react";
import Head from "next/head";
import { ethers } from "ethers";
import { ABI, CONTRACT_ADDRESS } from "../utils";
import styles from "../styles/Home.module.css";

export default function Home() {
  // Component state
  const [currentAccount, setCurrentAccount] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [memos, setMemos] = useState([]);
  const [tip, setTip] = useState(0.001);

  const onNameChange = (event) => {
    setName(event.target.value);
  };

  const onMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const incrementTip = () => {
    setTip((prevTip) => +(Math.round(prevTip + 0.001 + "e+3") + "e-3"));
  };

  const decrementTip = () => {
    setTip((prevTip) =>
      prevTip - 0.001 >= 0.001
        ? +(Math.round(prevTip - 0.001 + "e+3") + "e-3")
        : 0.001
    );
  };

  // Wallet connection logic
  const isWalletConnected = async () => {
    try {
      const { ethereum } = window;

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length < 1) {
        alert("Make sure MetaMask is connected");
      }
    } catch (error) {
      console.log("error: ", error);
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const accounts = await ethereum.request({
          method: "eth_requestAccounts",
        });
        setCurrentAccount(accounts[0]);
      } else {
        alert("Please install MetaMask to make a tip");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const buyCoffee = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum, "any");
        const signer = provider.getSigner();
        const buyMeACoffee = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

        const coffeeTxn = await buyMeACoffee.buyCoffee(
          name ? name : "anon",
          message ? message : "Enjoy your coffee!",
          { value: ethers.utils.parseEther(tip.toString()) }
        );

        await coffeeTxn.wait();

        console.log("mined ", coffeeTxn.hash);

        console.log("coffee purchased!");

        setName("");
        setMessage("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getMemos = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const buyMeACoffee = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
        const memos = await buyMeACoffee.getMemos();
        setMemos(memos);
      } else {
        console.log("Metamask is not connected");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const { ethereum } = window;
    let buyMeACoffee;
    isWalletConnected();
    getMemos();

    const onNewMemo = (from, timestamp, name, message) => {
      setMemos((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message,
          name,
        },
      ]);
    };

    // Listen for new memo events.
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum, "any");
      const signer = provider.getSigner();
      buyMeACoffee = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      buyMeACoffee.on("NewMemo", onNewMemo);
    }

    return () => {
      if (buyMeACoffee) {
        buyMeACoffee.off("NewMemo", onNewMemo);
      }
    };
  }, []);

  return (
    <>
      <Head>
        <title>Buy Galexing a Coffee!</title>
        <meta name='description' content='Tipping site' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <div className={styles.container}>
        <main className={styles.main}>
          <h1 className={styles.title}>Buy Galexing a Coffee!</h1>

          {currentAccount ? (
            <form className={styles.form}>
              <div className={styles.inputSet}>
                <label className={styles.inputlabel}>Name:</label>
                <br />
                <input
                  id='name'
                  type='text'
                  placeholder='anon'
                  onChange={onNameChange}
                  className={styles.input}
                />
              </div>
              <div className={styles.inputSet}>
                <label className={styles.inputlabel}>Send a message:</label>
                <br />

                <textarea
                  rows={3}
                  placeholder='Enjoy your coffee!'
                  id='message'
                  onChange={onMessageChange}
                  className={styles.input}
                ></textarea>
              </div>
              <div className={styles.sendButtonSet}>
                <button
                  type='button'
                  onClick={buyCoffee}
                  className={styles.sendButton}
                >
                  Send 1 Coffee for (ETH):
                </button>
                <button
                  type='button'
                  onClick={decrementTip}
                  className={styles.changeValueButton}
                >
                  -
                </button>
                {tip}
                <button
                  type='button'
                  onClick={incrementTip}
                  className={styles.changeValueButton}
                >
                  +
                </button>
              </div>
            </form>
          ) : (
            <button onClick={connectWallet} className={styles.connectButton}>
              Connect your wallet
            </button>
          )}

          {currentAccount && <h1>Memos received</h1>}

          {currentAccount &&
            memos.map((memo, idx) => {
              return (
                <div key={idx} className={styles.message}>
                  <p>
                    <b>From:</b> {memo.name}
                  </p>
                  <p>
                    <b>Message:</b> {memo.message}
                  </p>
                  <p>
                    <b>Time: </b>
                    {new Intl.DateTimeFormat("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    }).format(memos.timestamp)}
                  </p>
                </div>
              );
            })}
        </main>

        <footer className={styles.footer}>
          <a href='https://alchemy.com/?a=roadtoweb3weektwo' target='_blank'>
            Created by IamGalexing for Alchemy's Road to Web3 lesson two!
          </a>
        </footer>
      </div>
    </>
  );
}
