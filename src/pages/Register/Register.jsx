import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';
import PigletLogo from '../../assets/Logo_piglet.svg';

const RegisterPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const navigate = useNavigate();

    const handleContinue = (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert('As senhas não coincidem.');
            return;
        }

        if (password.length < 6) {
            alert('A senha deve ter no mínimo 6 caracteres.');
            return;
        }

        navigate('/register/details', {
            state: { email, password },
        });
    };

    const handleLoginClick = () => {
        navigate('/login');
    };

    return (
        <div className="register-container">
            <div className="register-card">
                <div className="register-header">
                    <img src={PigletLogo} alt="Logo Piglet" className="piglet-logo-img" />
                    <h1 className="register-title">PIGLET</h1>
                </div>

                <form onSubmit={handleContinue} className="register-form">
                    <input
                        type="email"
                        placeholder="Endereço de E-mail"
                        className="register-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <input
                        type="password"
                        placeholder="Senha (Mínimo 6 caracteres)"
                        className="register-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <input
                        type="password"
                        placeholder="Confirmar Senha"
                        className="register-input"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />

                    <button type="submit" className="register-button">
                        Continuar
                    </button>
                </form>

                <p className="register-footer-text">
                    Já tem uma conta?
                    <span onClick={handleLoginClick} className="register-link">
                        Entrar
                    </span>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;