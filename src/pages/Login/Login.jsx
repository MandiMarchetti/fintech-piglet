import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import PigletLogo from '../../assets/Logo_piglet.svg';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        console.log('Tentativa de Login:', { email, password });
        alert('Login realizado (Simulado)!');
        navigate('/Resources');
    };

    const handleRegisterClick = () => {
        navigate('/register');
    };

    const handleForgotPassword = () => {
        alert('Redirecionando para a recuperação de senha...');
    };

    return (
        <div className="login-container">
            <div className="login-card">

                {/* Logo e Título */}
                <div className="login-header">
                    <img src={PigletLogo} alt="Logo Piglet" className="piglet-logo-img" />
                    <h1 className="login-title">PIGLET</h1>
                </div>

                <form onSubmit={handleLogin} className="login-form">
                    <input
                        type="email"
                        placeholder="Endereço de E-mail"
                        className="login-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <input
                        type="password"
                        placeholder="Senha"
                        className="login-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <a onClick={handleForgotPassword} className="forgot-password-link">
                        Esqueceu sua senha?
                    </a>

                    <button type="submit" className="login-button">
                        Entrar
                    </button>
                </form>

                {/* Não tem uma conta? Criar conta */}
                <p className="login-footer-text">
                    Não tem uma conta?
                    <span onClick={handleRegisterClick} className="create-account-link">
                        Criar conta
                    </span>
                </p>

                {/* A seção "Outros métodos" e ícones sociais FORAM REMOVIDOS daqui */}

            </div>
        </div>
    );
};

export default LoginPage;