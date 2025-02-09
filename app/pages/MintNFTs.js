import styles from "../styles/Home.module.css";
import { useMetaplex } from "../useMetaplex";
import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { getMerkleProof } from '@metaplex-foundation/js';
import Link from "next/link";
import { Router, useRouter } from "next/router";

const DEFAULT_GUARD_NAME = null;
export const MintNFTs = () => {
  const whitelisted_wallets = require("../../asset/whitelist-wallets.json")
  const allowList = [
    {
      groupName: "WL",
      wallets: whitelisted_wallets,
    },
  ];

  const { metaplex } = useMetaplex();
  const wallet = useWallet();

  const [nft, setNft] = useState(null);

  const [quantity, setQuantity] = useState(1);

  const [isLive, setIsLive] = useState(true)
  const [hasEnded, setHasEnded] = useState(false)
  const [addressGateAllowedToMint, setAddressGateAllowedToMint] = useState(true)
  const [mintLimitReached, setMintLimitReached] = useState(false)
  const [hasEnoughSol, setHasEnoughSol] = useState(true)
  const [hasEnoughSolForFreeze, setHasEnoughSolForFreeze] = useState(true)
  const [nftGatePass, setNftGatePass] = useState(true)
  const [missingNftBurnForPayment, setMissingNftBurnForPayment] = useState(false)
  const [missingNftForPayment, setMissingNftForPayment] = useState(false)
  const [isSoldOut, setIsSoldOut] = useState(false)
  const [noSplTokenToBurn, setNoSplTokenToBurn] = useState(false)
  const [splTokenGatePass, setSplTokenGatePass] = useState(true)
  const [noSplTokenToPay, setNoSplTokenToPay] = useState(false)
  const [noSplTokenForFreeze, setNoSplTokenForFreeze] = useState(false)
  const [disableMint, setDisableMint] = useState(true);
  const [isMaxRedeemed, setIsMaxRedeemed] = useState(false);
  const [mintingInProgress, setMintingInProgress] = useState(false);

  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("public");
  const [candyMachineLoaded, setCandyMachineLoaded] = useState(false);

  const [price, setPrice] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [nftMinted, setNftMinted] = useState(0)

  const [isWhitelisted, setIsWhitelisted] = useState(false);
  const [candyMachine, setCandyMachine] = useState();

  const candyMachineAddress = new PublicKey(
    process.env.NEXT_PUBLIC_CANDY_MACHINE_ID
  );
  // let candyMachine;
  let walletBalance;

  // useEffect(() => {
  //   if (wallet.publicKey && wallet.publicKey.toString() == process.env.NEXT_PUBLIC_OWNER_ID) {
  //     router.push("/merkle");
  //   }
  // }, [wallet])

  useEffect(() => {
    const fetchCandyMachine = async () => {
      let candy_machine = await metaplex
        .candyMachines()
        .findByAddress({ address: candyMachineAddress });
      setCandyMachine(candy_machine)
    }
    if (wallet.publicKey && whitelisted_wallets.includes(wallet.publicKey.toString())) {
      setIsWhitelisted(true);
      setSelectedGroup("WL");
    } else {
      setIsWhitelisted(false);
      setSelectedGroup("public");
    }
    if (wallet.publicKey) {
      fetchCandyMachine();
    }

  }, [wallet])

  // useEffect(() => {
  //   if (wallet) {
  //     const fetchCandyMachine = async () => {
  //       // read candy machine state from chain
  //       let candyMachine = await metaplex
  //         .candyMachines()
  //         .findByAddress({ address: candyMachineAddress });

  //       setCandyMachine(candyMachine);
  //       setCandyMachineLoaded(true);
  //     }
  //     fetchCandyMachine()
  //   }
  // }, [wallet, metaplex])


  const getGuard = (selectedGroup, candyMachine) => {
    if (selectedGroup == DEFAULT_GUARD_NAME) {
      return candyMachine.candyGuard.guards;
    }

    const group = candyMachine.candyGuard.groups.find((group) => {
      return group.label == selectedGroup;
    });

    if (!group) {
      console.error(selectedGroup + " group not found. Defaulting to public");
      return candyMachine.candyGuard.guards;
    }

    return group.guards;
  };

  useEffect(() => {
    if (mintingInProgress) {
      return;
    }
    console.log(candyMachine)
    if (candyMachine) {
      console.log("checkEligibility on selectedGroup, mintingInProgress, candyMachine")
      checkEligibility();
    }
  }, [selectedGroup, mintingInProgress, candyMachine])

  // useEffect(() => {
  //   if (candyMachine === undefined) {
  //     const checkE = async () => {
  //       // read candy machine data to get the candy guards address
  //       console.log("checkEligibility undefined")
  //       await checkEligibility();
  //       // Add listeners to refresh CM data to reevaluate if minting is allowed after the candy guard updates or startDate is reached
  //       // addListener();
  //     }
  //     checkE()
  //   }
  // }, [candyMachine, wallet])

  // useEffect(() => {
  //   console.log("checkEligibility on page refresh")
  //   const fetchCandyMachine = async () => {
  //     // read candy machine state from chain
  //     let candyMachine = await metaplex
  //       .candyMachines()
  //       .findByAddress({ address: candyMachineAddress });

  //     setCandyMachine(candyMachine);
  //     setCandyMachineLoaded(true);
  //   }
  //   fetchCandyMachine();
  //   setTimeout(() => { }, 1000)
  //   checkEligibility();
  // }, [])

  const formatTime = (time) => {
    const days = Math.floor(time / 86400);
    const hours = Math.floor((time % 86400) / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };


  const addListener = async () => {
    // The below listeners were getting too noisy, and resulting in 429's from Solana endpoints.
    // Turning them off for now as a workaround until a more stable release is out from Metaplex

    // add a listener to monitor changes to the candy guard
    // metaplex.connection.onAccountChange(candyMachine.candyGuard.address,
    //   () => checkEligibility()
    // );

    // add a listener to monitor changes to the user's wallet
    // metaplex.connection.onAccountChange(metaplex.identity().publicKey,
    //   () => checkEligibility()
    // );

    // add a listener to reevaluate if the user is allowed to mint if startDate is reached
    const slot = await metaplex.connection.getSlot();
    const solanaTime = await metaplex.connection.getBlockTime(slot);
    const startDateGuard = getGuard(selectedGroup, candyMachine).startDate;
    if (startDateGuard != null) {
      const candyStartDate = startDateGuard.date.toString(10);
      const refreshTime = candyStartDate - solanaTime.toString(10);
      if (refreshTime > 0) {
        setTimeout(() => checkEligibility(), refreshTime * 1000);
      }
    }

    // also reevaluate eligibility after endDate is reached
    const endDateGuard = getGuard(selectedGroup, candyMachine).endDate;

    if (endDateGuard != null) {
      const candyEndDate = endDateGuard.date.toString(10);
      const refreshTime = solanaTime.toString(10) - candyEndDate;
      if (refreshTime > 0) {
        setTimeout(() => checkEligibility(), refreshTime * 1000);
      }
    }
  };

  const checkEligibility = async () => {
    //wallet not connected?
    if (!wallet.connected) {
      setDisableMint(true);
      return;
    }

    // // read candy machine state from chain
    // if (candyMachine === undefined) {
    //   candyMachine = await metaplex
    //     .candyMachines()
    //     .findByAddress({ address: candyMachineAddress });
    //   setCandyMachine(candyMachine)
    //   console.log("setCandyMachine(candy_machine)")
    //   // candyMachine = await metaplex
    //   //   .candyMachines()
    //   //   .findByAddress({ address: candyMachineAddress });

    //   if (candyMachine === undefined) {
    //     return;
    //   }
    // }

    setCandyMachineLoaded(true);

    const guardGroups = candyMachine.candyGuard.groups.map((group) => {
      return group.label;
    });
    if (groups.join(",") != guardGroups.join(",")) {
      setGroups(guardGroups);
      if (selectedGroup === DEFAULT_GUARD_NAME) {
        setSelectedGroup(guardGroups[0]);
      }
    }
    setNftMinted(candyMachine.itemsMinted.toString())
    // enough items available?
    if (
      candyMachine.itemsMinted.toString(10) -
      candyMachine.itemsAvailable.toString(10) >=
      0
    ) {
      console.error("not enough items available");
      setDisableMint(true);
      setIsSoldOut(true);
      return;
    }

    // guard checks have to be done for the relevant guard group! Example is for the default groups defined in Part 1 of the CM guide
    const guard = getGuard(selectedGroup, candyMachine);

    // Calculate current time based on Solana BlockTime which the on chain program is using - startTime and endTime guards will need that
    const slot = await metaplex.connection.getSlot();
    const solanaTime = await metaplex.connection.getBlockTime(slot);

    if (guard.startDate != null) {
      const candyStartDate = guard.startDate.date.toString(10);
      if (solanaTime < candyStartDate) {
        console.error("startDate: CM not live yet");
        setDisableMint(true);
        setIsLive(false);
        return;
      }
    }

    if (guard.endDate != null) {
      const candyEndDate = guard.endDate.date.toString(10);
      if (solanaTime > candyEndDate) {
        console.error("endDate: CM not live anymore");
        setDisableMint(true);
        setHasEnded(true);
        return;
      }
      const time = formatTime((candyEndDate - solanaTime))
      setEndTime(time);
    }

    if (guard.addressGate != null) {
      if (metaplex.identity().publicKey.toBase58() != guard.addressGate.address.toBase58()) {
        console.error("addressGate: You are not allowed to mint");
        setDisableMint(true);
        setAddressGateAllowedToMint(false)
        return;
      }
    }

    if (guard.mintLimit != null) {
      const mitLimitCounter = metaplex.candyMachines().pdas().mintLimitCounter({
        id: guard.mintLimit.id,
        user: metaplex.identity().publicKey,
        candyMachine: candyMachine.address,
        candyGuard: candyMachine.candyGuard.address,
      });
      //Read Data from chain
      const mintedAmountBuffer = await metaplex.connection.getAccountInfo(mitLimitCounter, "processed");
      let mintedAmount;
      if (mintedAmountBuffer != null) {
        mintedAmount = mintedAmountBuffer.data.readUintLE(0, 1);
      }
      if (mintedAmount != null && mintedAmount >= guard.mintLimit.limit) {
        console.error("mintLimit: mintLimit reached!");
        setDisableMint(true);
        setMintLimitReached(true);
        return;
      }
    }

    if (guard.solPayment != null) {
      walletBalance = await metaplex.connection.getBalance(
        metaplex.identity().publicKey
      );

      const costInLamports = guard.solPayment.amount.basisPoints.toString(10);
      setPrice(costInLamports / 1000000000);

      if (costInLamports > walletBalance) {
        console.error("solPayment: Not enough SOL!");
        setDisableMint(true);
        setHasEnoughSol(false);
        return;
      }
    }

    if (guard.freezeSolPayment != null) {
      walletBalance = await metaplex.connection.getBalance(
        metaplex.identity().publicKey
      );

      const costInLamports = guard.freezeSolPayment.amount.basisPoints.toString(10);

      if (costInLamports > walletBalance) {
        console.error("freezeSolPayment: Not enough SOL!");
        setDisableMint(true);
        setHasEnoughSolForFreeze(false);
        return;
      }
    }

    if (guard.nftGate != null) {
      const ownedNfts = await metaplex.nfts().findAllByOwner({ owner: metaplex.identity().publicKey });
      const nftsInCollection = ownedNfts.filter(obj => {
        return (obj.collection?.address.toBase58() === guard.nftGate.requiredCollection.toBase58()) && (obj.collection?.verified === true);
      });
      if (nftsInCollection.length < 1) {
        console.error("nftGate: The user has no NFT to pay with!");
        setDisableMint(true);
        setNftGatePass(false);
        return;
      }
    }

    if (guard.nftBurn != null) {
      const ownedNfts = await metaplex.nfts().findAllByOwner({ owner: metaplex.identity().publicKey });
      const nftsInCollection = ownedNfts.filter(obj => {
        return (obj.collection?.address.toBase58() === guard.nftBurn.requiredCollection.toBase58()) && (obj.collection?.verified === true);
      });
      if (nftsInCollection.length < 1) {
        console.error("nftBurn: The user has no NFT to pay with!");
        setDisableMint(true);
        setMissingNftBurnForPayment(true);
        return;
      }
    }

    if (guard.nftPayment != null) {
      const ownedNfts = await metaplex.nfts().findAllByOwner({ owner: metaplex.identity().publicKey });
      const nftsInCollection = ownedNfts.filter(obj => {
        return (obj.collection?.address.toBase58() === guard.nftPayment.requiredCollection.toBase58()) && (obj.collection?.verified === true);
      });
      if (nftsInCollection.length < 1) {
        console.error("nftPayment: The user has no NFT to pay with!");
        setDisableMint(true);
        setMissingNftForPayment(true);
        return;
      }
    }

    if (guard.redeemedAmount != null) {
      if (guard.redeemedAmount.maximum.toString(10) <= candyMachine.itemsMinted.toString(10)) {
        console.error("redeemedAmount: Too many NFTs have already been minted!");
        setDisableMint(true);
        setIsMaxRedeemed(true);
        return;
      }
    }

    if (guard.tokenBurn != null) {
      const ata = await metaplex.tokens().pdas().associatedTokenAccount({ mint: guard.tokenBurn.mint, owner: metaplex.identity().publicKey });
      const balance = await metaplex.connection.getTokenAccountBalance(ata);
      if (balance < guard.tokenBurn.amount.basisPoints.toNumber()) {
        console.error("tokenBurn: Not enough SPL tokens to burn!");
        setDisableMint(true);
        setNoSplTokenToBurn(true);
        return;
      }
    }

    if (guard.tokenGate != null) {
      const ata = await metaplex.tokens().pdas().associatedTokenAccount({ mint: guard.tokenGate.mint, owner: metaplex.identity().publicKey });
      const balance = await metaplex.connection.getTokenAccountBalance(ata);
      if (balance < guard.tokenGate.amount.basisPoints.toNumber()) {
        console.error("tokenGate: Not enough SPL tokens!");
        setDisableMint(true);
        setSplTokenGatePass(false);
        return;
      }
    }

    if (guard.tokenPayment != null) {
      const ata = await metaplex.tokens().pdas().associatedTokenAccount({ mint: guard.tokenPayment.mint, owner: metaplex.identity().publicKey });
      const balance = await metaplex.connection.getTokenAccountBalance(ata);
      if (balance < guard.tokenPayment.amount.basisPoints.toNumber()) {
        console.error("tokenPayment: Not enough SPL tokens to pay!");
        setDisableMint(true);
        setNoSplTokenToPay(true);
        return;
      }
      if (guard.freezeTokenPayment != null) {
        const ata = await metaplex.tokens().pdas().associatedTokenAccount({ mint: guard.freezeTokenPayment.mint, owner: metaplex.identity().publicKey });
        const balance = await metaplex.connection.getTokenAccountBalance(ata);
        if (balance < guard.tokenPayment.amount.basisPoints.toNumber()) {
          console.error("freezeTokenPayment: Not enough SPL tokens to pay!");
          setDisableMint(true);
          setNoSplTokenForFreeze(true);
          return;
        }
      }
    }

    //good to go! Allow them to mint
    setDisableMint(false);
    setIsLive(true)
    setHasEnded(false)
    setAddressGateAllowedToMint(true)
    setMintLimitReached(false)
    setHasEnoughSol(true)
    setHasEnoughSolForFreeze(true)
    setNftGatePass(true)
    setMissingNftBurnForPayment(false)
    setMissingNftForPayment(false)
    setIsSoldOut(false)
    setNoSplTokenToBurn(false)
    setSplTokenGatePass(true)
    setNoSplTokenToPay(false)
    setNoSplTokenForFreeze(false)
    setIsMaxRedeemed(false);
  };

  // show and do nothing if no wallet is connected
  if (!wallet.connected) {
    return null;
  }

  // if it's the first time we are processing this function with a connected wallet we read the CM data and add Listeners
  // if (candyMachine === undefined) {
  //   (async () => {
  //     // read candy machine data to get the candy guards address
  //     console.log("checkEligibility undefined")
  //     await checkEligibility();
  //     // Add listeners to refresh CM data to reevaluate if minting is allowed after the candy guard updates or startDate is reached
  //     addListener();
  //   }
  //   )();
  // }

  const onClick = async () => {
    setMintingInProgress(true);

    try {
      // Here the actual mint happens. Depending on the guards that you are using you have to run some pre validation beforehand 
      // Read more: https://docs.metaplex.com/programs/candy-machine/minting#minting-with-pre-validation
      await mintingGroupAllowlistCheck();

      const group = selectedGroup == DEFAULT_GUARD_NAME ? undefined : selectedGroup;
      const { nft } = await metaplex.candyMachines().mint({
        candyMachine,
        collectionUpdateAuthority: candyMachine.authorityAddress,
        ...group && { group },
      });

      setNft(nft);
    } catch (e) {
      throw e;
    } finally {
      setMintingInProgress(false);
    }
  };

  const mintingGroupAllowlistCheck = async () => {
    const group = selectedGroup == DEFAULT_GUARD_NAME ? undefined : selectedGroup;

    const guard = getGuard(selectedGroup, candyMachine);
    if (!guard.allowList) {
      return;
    }

    const groupDetails = allowList.find((group) => {
      return group.groupName == selectedGroup;
    });

    if (!groupDetails) {
      throw new Error(`Cannot mint, as no list of accounts provided for group ${selectedGroup} with allowlist settings enabled`)
    }

    const mintingWallet = metaplex.identity().publicKey.toBase58();

    try {
      await metaplex.candyMachines().callGuardRoute({
        candyMachine,
        guard: 'allowList',
        settings: {
          path: 'proof',
          merkleProof: getMerkleProof(groupDetails.wallets, mintingWallet),
        },
        ...group && { group },
      });
    } catch (e) {
      console.error(`MerkleTreeProofMismatch: Wallet ${mintingWallet} is not allowlisted for minting in the group ${selectedGroup}`);
      throw e;
    }
  }

  const onGroupChanged = (event) => {
    setSelectedGroup(event.target.value);
  };

  // const router = useRouter();

  // const goToMarkel = () => {
  //   const owner = "B6UndiJx8MPchLfacaJu1RT5CfnFajqvTrB26cNhiV1H"
  //   if (owner == "B6UndiJx8MPchLfacaJu1RT5CfnFajqvTrB26cNhiV1H") {
  //     router.push("/merkle");
  //   }
  // }
  const increaseQuantity = () => {
    setQuantity((prevQuantity) => prevQuantity + 1);
  };
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prevQuantity) => prevQuantity - 1);
    }
  };
  // const status = candyMachineLoaded && (
  //   <div className={styles.container}>
  //     {/* {(isLive && !hasEnded) && <h1 className={styles.title}>Minting Live!</h1>}
  //     {(isLive && hasEnded) && <h1 className={styles.title}>Minting End!</h1>}
  //     {!isLive && <h1 className={styles.title}>Minting Not Live!</h1>} */}
  //     {!addressGateAllowedToMint && <h1 className={styles.title}>Wallet address not allowed to mint</h1>}
  //     {mintLimitReached && <h1 className={styles.title}>Minting limit reached</h1>}
  //     {(!hasEnoughSol || !hasEnoughSolForFreeze) && <h1 className={styles.title} style={{ marginLeft: "15%" }}>Insufficient SOL balance</h1>}
  //     {(!nftGatePass || missingNftBurnForPayment || missingNftForPayment) && <h1 className={styles.title}>Missing required NFT for minting</h1>}
  //     {isSoldOut && <h1 className={styles.title}>Sold out!</h1>}
  //     {isMaxRedeemed && <h1 className={styles.title}>Maximum amount of NFTs allowed to be minted has already been minted!</h1>}
  //     {(!splTokenGatePass || noSplTokenToBurn || noSplTokenToPay || noSplTokenForFreeze) && <h1 className={styles.title}>Missing required SPL token for minting</h1>}
  //   </div>
  // );

  return (
    <div
      // style={{ flex: 2, marginLeft: "5px"  }}
      className={styles.div2}
    >
      {/* <h2style={{ textAlign: "center" }}>
          Your wallet is {!isWhitelisted ? " not " : ""} whitelisted
        </h2> */}
      {/* <span>
        
</span> */}
      {true &&
        <span >
          <h2 style={{ fontSize: "15px", fontStyle: "italic", padding: "5px", border: "3px solid rgb(134, 113, 52" }}>
            KryptoPoker.io Freeroll Season 1
          </h2>
          <div style={{ fontSize: "20px" }}>
            Minting{" "}
            <span>
              {(isLive && !hasEnded) && <span>is <h1 className={styles.greenBox}> Live!</h1></span>}
              {(isLive && hasEnded) && <span>has <h1 className={styles.redBox}> Ended!</h1></span>}
              {!isLive && <h1 className={styles.orangeBox}> Not Live!</h1>}
            </span>
          </div>
          <p>
            Ends in: <strong>{endTime}</strong> &nbsp;
            {isWhitelisted && <button style={{
              backgroundColor: '#edb62b',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              color: '#FFF',
              cursor: 'pointer',
            }} onClick={onClick} >
              Whitelisted
            </button>}
          </p>
          <div
            style={{
              display: "flex",
              // justifyContent: "center",
            }}
          >
            <div style={{ flex: 1 }}>
              <p>Price</p>
              <p>
                <strong>{price} SOL</strong>
              </p>
            </div>
            <div style={{ flex: 1 }}>
              <p>Total Minted&nbsp;&nbsp;</p>
              <p>
                <strong>{nftMinted} (1 max per wallet)</strong>
              </p>
            </div>
          </div>
          {/* <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginTop: "10px",
                        }}
                      >
                        <p style={{ marginRight: "10px" }}>Quantity </p>
                        <button
                          onClick={decreaseQuantity}
                          className={styles.quantButton}
                        >
                          -
                        </button>
                        <span style={{ fontWeight: "bold" }}>
                          <strong>{quantity}&nbsp; </strong>
                        </span>
                        <button
                          onClick={increaseQuantity}
                          className={styles.quantButton}
                        >
                          +
                        </button>
                      </div> */}
          {/*<div className={styles.container}>
        <div className={styles.inlineContainer}>
          <h1 className={styles.title}>Network: </h1>
          <select onChange={onClusterChange} className={styles.dropdown}>
            <option value="devnet">Devnet</option>
            <option value="mainnet">Mainnet</option>
            <option value="testnet">Testnet</option>
          </select>
        </div>
        {
          groups.length > 0 &&
          (
            <div className={styles.inlineContainer}>
              <h1 className={styles.title}>Minting Group: </h1>
              <select onChange={onGroupChanged} className={styles.dropdown} defaultValue={selectedGroup}>
                {
                  groups.map(group => {
                    return (
                      <option key={group} value={group}>{group}</option>
                    );
                  })
                }
              </select>
            </div>
          )
        } 
      </div>*/}
          <div>

            <div className={styles.container}>
              <h1 className={styles.title}>NFT Mint Address: {nft ? nft.mint.address.toBase58() : "Nothing Minted yet"}</h1>
              {disableMint}
              {mintingInProgress && <h1 className={styles.title}>Minting In Progress!</h1>}
              <div className={styles.nftForm}>
                {
                  (
                    <button style={{
                      backgroundColor: (disableMint || mintingInProgress) ? "#514929" : '#edb62b',
                      padding: '10px 20px',
                      border: 'none',
                      borderRadius: '5px',
                      color: '#FFF',
                      cursor: 'pointer',
                    }} onClick={onClick} disabled={mintingInProgress}>
                      Mint NFT
                    </button>
                  )
                }
              </div>
              {nft && (
                <div className={styles.nftPreview}>
                  <p>Mint is successful</p>
                  <h1>{nft.name}</h1>
                  {/* <img
                    src={nft?.json?.image || "/fallbackImage.jpg"}
                    alt="The downloaded illustration of the provided NFT address."
                  /> */}
                </div>
              )}
            </div>
          </div>
          {/* <button onClick={goToMarkel}><a>Go to merkle</a></button> */}
        </span>}
    </div>
  );
};

export default MintNFTs;