import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css'; 
// Assumindo que este caminho está correto. Para testes, se não tiver o SVG, substitua pela função PigletLogo placeholder.
import PigletLogo from '../../assets/Logo_piglet.svg'; 

const RegisterPage = () => {
    // Apenas os campos da primeira etapa
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const navigate = useNavigate();

    // Função para avançar para a próxima etapa, passando os dados
    const handleContinue = (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            // Em produção, use um modal ou feedback na tela, não alert()
            alert('A senha e a confirmação de senha não coincidem!');
            return;
        }
        
        if (password.length < 6) {
            alert('A senha deve ter no mínimo 6 caracteres.');
            return;
        }

        // Navega para a próxima página, levando email e password no state
        navigate('/register/details', { 
            state: { email, password } 
        });
    };

    const handleLoginClick = () => {
        navigate('/login');
    };

    return (
        <div className="register-container">
            <div className="register-card">

                {/* Header e Logo */}
                <div className="register-header">
                    <img src={PigletLogo} alt="Logo Piglet" className="piglet-logo-img" />
                    <h1 className="register-title">PIGLET</h1>
                </div>

                {/* Formulário - E-mail e Senha */}
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
                        minLength="6"
                        required
                    />

                    <input
                        type="password"
                        placeholder="Confirmar Senha"
                        className="register-input"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        minLength="6"
                        required
                    />

                    {/* Botão para a próxima etapa */}
                    <button type="submit" className="register-button">
                        Continuar
                    </button>
                </form>

                {/* Footer */}
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