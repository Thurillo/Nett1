// frontend/src/main.jsx - 21/02/2026 - V 0.14
import React from 'react'
import ReactDOM from 'react-dom/client'
// Per il vero repository GitHub, queste righe sarebbero:
// import App from './App.jsx'
// import './index.css'

// NOTA: Nell'ambiente di anteprima del Canvas, il rendering viene gestito
// automaticamente dal contenitore principale React se il file esporta una funzione.
// Questo file è fornito solo per rispettare l'architettura reale del progetto Vite.
export default function Main() {
  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h2>Punto di ingresso Vite (main.jsx)</h2>
      <p>L'applicazione principale risiede in <b>frontend/src/App.jsx</b>.</p>
    </div>
  );
}