"use server"
import styles1 from "../styles/Home.module.css";
// var fs = require('fs');
import { useState } from 'react';
import { getMerkleRoot } from "@metaplex-foundation/mpl-candy-machine";

export default function Merkle() {
  const [text, setText] = useState('');

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  const [merkleRoot, setMerkleRoot] = useState('');

  const calculateMerkleRoot = async () => {
    const whitelist_path = process.env.NEXT_PUBLIC_WHITELIST_PATH;
    const merkleRoot = getMerkleRoot(text.split("\n"));
    console.log(text);
    const res = await fetch('/api/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename: whitelist_path, content: JSON.stringify(text.split("\n")) }),
      });
  
      const result = await res.json();
    setMerkleRoot(merkleRoot.toString());
  };

  return (
    <div className={styles1.newContainer}>
        <div className={styles.navbar}>
        <div style={styles.container}>
      <div style={styles.header}>
        <h1>Merkle Root Calculator For Metaplex Candy Machine</h1>
      </div>
      <div style={styles.content}>
        <label>Wallets (One per line) *</label>
        <textarea 
          value={text} 
          onChange={(e) => setText(e.target.value)}
          rows="6"
          cols="50"
          style={styles.textarea}
        />
        <div>
          <h3>Merkle Root:</h3>
          <p>{merkleRoot ? JSON.stringify(merkleRoot) : ""}</p>
        </div>
        <button onClick={calculateMerkleRoot} style={styles.button}>
          CALCULATE MERKLE ROOT
        </button>
      </div>
    </div>
      </div>
    </div>
  );
}

const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      backgroundColor: '#000',
      color: '#fff',
      height: '100vh',
      justifyContent: 'center'
    },
    header: {
      marginBottom: '20px',
    },
    content: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    textarea: {
      marginBottom: '20px',
      padding: '10px',
      fontSize: '16px',
      backgroundColor: '#333',
    },
    button: {
      padding: '10px 20px',
      backgroundColor: '#fff',
      color: '#000',
      border: 'none',
      cursor: 'pointer',
      fontSize: '16px',
    },
    footer: {
      display: 'flex',
      alignItems: 'center',
    },
    image: {
      marginLeft: '10px',
      height: '60px'
    }
  };