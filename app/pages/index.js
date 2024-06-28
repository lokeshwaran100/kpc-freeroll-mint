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
import {
  WalletModalProvider,
} from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import { MetaplexProvider } from "../MetaplexProvider";
import { MintNFTs } from "./MintNFTs";
import "@solana/wallet-adapter-react-ui/styles.css";
import dynamic from 'next/dynamic';
import Image from 'next/image';

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
  };

  const [network, setNetwork] = useState(solana_network);
  const [quantity, setQuantity] = useState(1);
  const increaseQuantity = () => {
    setQuantity(prevQuantity => prevQuantity + 1);
  };
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prevQuantity => prevQuantity - 1);
    }
  };

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
    import('@solana/wallet-adapter-react-ui', { ssr: false }).then((mod) => mod.WalletMultiButton)
  );

  return (
    <div>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <MetaplexProvider>
              <div className={styles.newContainer}>
      <div className={styles.navbar}>
        <header className={styles.header}>
  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
    <img src="/fallbackImage.png" alt="Logo" style={{ height: '40px' }} />
  </div>
  <nav>
    <a href="#" style={{ margin: '0 10px' }}>Home</a>
    <a href="#" style={{ margin: '0 10px' }}>FAQ</a>
    <ButtonWrapper />
  </nav>
</header>
        <main style={{ display: 'flex' }}>
          <div style={{ flex: 1 }}>
            <Image
              src="/fallbackImage.jpg"
              alt="Random Image"
              width={300}
              height={300}
              style={{ borderRadius: '10px' }}
            />
          </div>
          <div style={{ flex: 2, marginLeft: '20px' }}>
            <h2 style={{ fontSize: '15px', fontStyle: 'italic' }}>Potoroid #312</h2>
            <p style={{ fontSize: '20px',  }}>
              Public Mint is <span style={{ backgroundColor: '#4caf50', padding: '5px 10px', borderRadius: '5px', display: 'inline-block' }}>Live</span>
            </p>
            <p>Ends in: <strong>72d:20h:43m:33s</strong></p>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ flex: 1 }}>
                <p>Price</p>
                <p><strong>2.69 SOL</strong></p>
              </div>
              <div style={{ flex: 1 }}>
                <p>Remaining</p>
                <p><strong>634/899</strong></p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
  <p style={{ marginRight: '10px' }}>Quantity </p>
  <button onClick={decreaseQuantity} className={styles.quantButton}>
    -
  </button>
  <span style={{fontWeight: "bold"}}><strong>{quantity}&nbsp; </strong></span>
  <button onClick={increaseQuantity} className={styles.quantButton}>
     +
  </button>
</div>
                <MintNFTs />
          </div>
        </main>
      </div>
    </div>
            </MetaplexProvider>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </div>
  );
}
