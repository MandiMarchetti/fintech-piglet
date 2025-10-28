import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Register.css'; 
// Para a tela de detalhes, podemos adicionar um botão de voltar
import { ArrowLeft } from 'lucide-react'; 
// Assumindo que este caminho está correto.
import PigletLogo from '../../assets/Logo_piglet.svg'; 

// Este é o novo componente de continuação
const RegisterContinuationPage = () => {
    // Recebe o state da página anterior (email e password)
    const location = useLocation();
    const navigate = useNavigate();
    
    // Verifica se os dados da etapa 1 estão presentes
    const initialData = location.state || {};
    const { email, password } = initialData;

    // Campos da segunda etapa
    const [name, setName] = useState('');
    const [cpf, setCpf] = useState('');
    const [birthDate, setBirthDate] = useState('');

    // Função para voltar para a primeira etapa
    const handleBack = () => {
        navigate(-1); 
    };

    // Função para simular o cadastro final
    const handleCreateAccount = (e) => {
        e.preventDefault();

        // 1. Validar se os dados da etapa 1 vieram (evita acesso direto à URL)
        if (!email || !password) {
            alert('Erro: Dados da primeira etapa ausentes. Redirecionando para o início.');
            navigate('/register');
            return;
        }

        // 2. Coleta todos os dados para o log (Simulação de envio ao backend)
        const finalRegistrationData = {
            email: email,
            password: password, // Em um cenário real, o backend receberia o password hash
            name: name,
            cpf: cpf,
            birthDate: birthDate
        };

        console.log('--- CADASTRO FINALIZADO ---');
        console.log('Dados completos para envio:', finalRegistrationData);
        console.log('---------------------------');


        // Simulação de sucesso
        alert('Conta criada com sucesso! Seja bem-vindo(a), ' + name + '!');
        
        // Redireciona para o login ou painel
        navigate('/login');
    };

    return (
        <div className="register-container">
            
            {/* Botão de Voltar para a Etapa 1 */}
            <button className="back-button" onClick={handleBack} aria-label="Voltar para a etapa anterior">
                <ArrowLeft size={24} />
            </button>

            <div className="register-card">

                <div className="register-header">
                    <img src={PigletLogo} alt="Logo Piglet" className="piglet-logo-img" />
                    <h1 className="register-title">PIGLET</h1>
                </div>

                <form onSubmit={handleCreateAccount} className="register-form">

                    {/* Input de Nome Completo */}
                    <input
                        type="text"
                        placeholder="Nome Completo"
                        className="register-input"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />

                    {/* Input de CPF */}
                    <input
                        type="text"
                        placeholder="Número de CPF"
                        className="register-input"
                        value={cpf}
                        onChange={(e) => setCpf(e.target.value)}
                        // Adicionar lógica de máscara/validação aqui em um projeto real
                        maxLength="14" 
                        required
                    />

                    {/* Input de Data de Nascimento */}
                    <label htmlFor="birthDate" className="register-label">Data de Nascimento:</label>
                    <input
                        id="birthDate"
                        type="date"
                        placeholder="Data de Nascimento"
                        className="register-input"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        required
                    />

                    {/* Botão para a próxima etapa */}
                    <button type="submit" className="register-button">
                        Criar Conta
                    </button>
                </form>

            </div>
        </div>
    );
};

export default RegisterContinuationPage;