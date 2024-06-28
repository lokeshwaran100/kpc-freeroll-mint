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
import keyStrokes from '../public/images/Key Strokes.jpeg'
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
      <div className={styles.keystrokesContainer}>
        <div className={styles.inlineContainer}>
          <div className={styles.simpleContainer}>
          </div>
        </div>
      </div>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <MetaplexProvider>
              <div className={styles.App}>
                <ButtonWrapper />
                <MintNFTs />
              </div>
              {/* <div style={{
      backgroundColor: '#ff5722',
      minHeight: '100vh',
      padding: '5% 2.5%',
      boxSizing: 'border-box'
    }}>
      <div style={{
        backgroundColor: '#333',
        borderRadius: '10px',
        margin: '0 auto',
        padding: '20px',
        color: '#FFF',
        minHeight: '80vh'
      }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>Scott.</div>
          <nav>
            <a href="#" style={{ margin: '0 10px' }}>Home</a>
            <a href="#" style={{ margin: '0 10px' }}>About</a>
            <a href="#" style={{ margin: '0 10px' }}>Discover</a>
            <a href="#" style={{ margin: '0 10px' }}>Collection</a>
            <a href="#" style={{ margin: '0 10px' }}>FAQ</a>
            <button style={{ margin: '0 10px' }}>Connect</button>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5%' }}>
              <div style={{ flex: 1 }}>
                <p>Price</p>
                <p><strong>2.69 ETH</strong></p>
              </div>
              <div style={{ flex: 1 }}>
                <p>Remaining</p>
                <p><strong>634/899</strong></p>
              </div>
            </div>
            <p>Quantity: <strong>{quantity}</strong></p>
            <div>
              <button onClick={decreaseQuantity} style={{
                backgroundColor: '#ff5722',
                padding: '5px 10px',
                border: 'none',
                borderRadius: '5px',
                color: '#FFF',
                cursor: 'pointer',
                marginRight: '10px'
              }}>
                -
              </button>
              <button onClick={increaseQuantity} style={{
                backgroundColor: '#ff5722',
                padding: '5px 10px',
                border: 'none',
                borderRadius: '5px',
                color: '#FFF',
                cursor: 'pointer'
              }}>
                +
              </button>
            </div>
             <button style={{
              backgroundColor: '#ff5722',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              color: '#FFF',
              cursor: 'pointer',
              marginTop: '20px'
            }}> 
              <MintNFTs />
             </button> 
          </div>
        </main>
      </div>
    </div> */}
            </MetaplexProvider>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </div>
  );
}
