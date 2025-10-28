import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css'; // Mantenha o arquivo CSS global padrão do Vite

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Envolve o App com o roteador */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);