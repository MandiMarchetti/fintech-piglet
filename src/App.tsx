import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/Login/Login.jsx';
import RegisterPage from './pages/Register/Register.jsx';
import RegisterContinuationPage from './pages/Register/RegisterContinuationPage.jsx';
import Resources from './pages/Resources/Resources.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      {/* 2. Nova Rota de Cadastro */}
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/register/details" element={<RegisterContinuationPage />} /> 
      <Route path="/Resources" element={<Resources />} />
      
      {/* Rota 404 */}
      <Route path="*" element={<h1>404 | Página não encontrada</h1>} />
    </Routes>
  );
}

export default App;