import styles from "../styles/Home.module.css";
import { useMemo, useState } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  GlowWalletAdapter,
  PhantomWalletAdapter,
  SlopeWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import { MetaplexProvider } from "../MetaplexProvider";
import { MintNFTs } from "./MintNFTs";
import "@solana/wallet-adapter-react-ui/styles.css";
import dynamic from "next/dynamic";
import Image from "next/image";
export default function Home() {
  let solana_network = WalletAdapterNetwork.Devnet;
  switch (process.env.NEXT_PUBLIC_SOLANA_NETWORK) {
    case "devnet":
      solana_network = WalletAdapterNetwork.Devnet;
      break;
    case "mainnet":
      solana_network = WalletAdapterNetwork.Mainnet;
      break;
    case "testnet":
      solana_network = WalletAdapterNetwork.Testnet;
      break;
    default:
      solana_network = WalletAdapterNetwork.Devnet;
      break;
  }
  const [network, setNetwork] = useState(solana_network);
  
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new GlowWalletAdapter(),
      new SlopeWalletAdapter(),
      new SolflareWalletAdapter({ network }),
      new TorusWalletAdapter(),
    ],
    [network]
  );
  const ButtonWrapper = dynamic(() =>
    import("@solana/wallet-adapter-react-ui", { ssr: false }).then(
      (mod) => mod.WalletMultiButton
    )
  );
  return (
    <div className={styles.box}>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <MetaplexProvider>
                <div className={styles.navbar}>
                  <header className={styles.header}>
                    <div style={{ fontSize: "24px", fontWeight: "bold" }}>
                      <img
                        src="favicon.ico"
                        alt="Logo"
                        style={{ height: "40px" }}
                      />
                    </div>
                    <nav>
                      {/* <a href="#" style={{ margin: "0 10px" }}>
                        Home
                      </a>
                      <a href="#" style={{ margin: "0 10px" }}>
                        FAQ
                      </a> */}
                      <ButtonWrapper />
                    </nav>
                  </header>
                  <main 
                  // style={{ display: "flex" }}
                  className={styles.container1}
                  >
                    <div 
                    // style={{ flex: 1, display: "inline-block",
                    //               position: "relative",
                    //               overflow: "hidden" }}
                    className={styles.div1}
                                  >
                      <Image
                        src="/images/nft.gif"
                        alt="Random Image"
                        width={300}
                        height={300}
                        style={{ borderRadius: "10px", display: "block",
                          maxWidth: "100%",
                          height: "auto" }}
                      />
                    </div>
                    <MintNFTs />
                  </main>
                </div>
            </MetaplexProvider>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </div>
  );
}