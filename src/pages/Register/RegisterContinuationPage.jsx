import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Register.css';
import { ArrowLeft } from 'lucide-react';
import PigletLogo from '../../assets/Logo_piglet.svg';

const RegisterContinuationPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const initialData = location.state || {};
    const { email, password } = initialData;

    const [name, setName] = useState('');
    const [cpf, setCpf] = useState('');
    const [birthDate, setBirthDate] = useState('');

    const handleBack = () => navigate(-1);

    const handleCreateAccount = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            alert('Erro: dados da primeira etapa ausentes.');
            navigate('/register');
            return;
        }

        if (cpf.length !== 11) {
            alert('O CPF deve conter exatamente 11 dígitos.');
            return;
        }

        const newUser = {
            name,
            email,
            cpf,
            birthDate,
            password,
        };

        try {
            const response = await fetch('http://localhost:8080/piglet/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser),
            });

            if (!response.ok) {
                throw new Error('Erro ao criar usuário: ' + response.status);
            }

            alert(`Conta criada com sucesso! Bem-vindo(a), ${name}!`);
            navigate('/login');
        } catch (error) {
            console.error('Erro no cadastro:', error);
            alert('Falha ao criar conta. Verifique os dados e tente novamente.');
        }
    };

    // 🔹 Garante que o CPF só receba números
    const handleCpfChange = (e) => {
        const value = e.target.value.replace(/\D/g, ''); // Remove qualquer caractere não numérico
        if (value.length <= 11) setCpf(value); // Limita a 11 dígitos
    };

    return (
        <div className="register-container">
            <button className="back-button" onClick={handleBack}>
                <ArrowLeft size={24} />
            </button>

            <div className="register-card">
                <div className="register-header">
                    <img src={PigletLogo} alt="Logo Piglet" className="piglet-logo-img" />
                    <h1 className="register-title">PIGLET</h1>
                </div>

                <form onSubmit={handleCreateAccount} className="register-form">
                    <input
                        type="text"
                        placeholder="Nome Completo"
                        className="register-input"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />

                    <input
                        type="text"
                        placeholder="CPF (somente números, ex: 12345678900)"
                        className="register-input"
                        value={cpf}
                        onChange={handleCpfChange}
                        maxLength={11}
                        required
                    />

                    <label htmlFor="birthDate" className="register-label">
                        Data de Nascimento:
                    </label>
                    <input
                        id="birthDate"
                        type="date"
                        className="register-input"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        required
                    />

                    <button type="submit" className="register-button">
                        Criar Conta
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegisterContinuationPage;
