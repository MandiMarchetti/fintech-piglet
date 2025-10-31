import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Register.css";
import { ArrowLeft } from "lucide-react";
import PigletLogo from "../../assets/Logo_piglet.svg";
import { registerUser } from "../../services/userApi"; //

const RegisterContinuationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const initialData = location.state || {};
  const { email, password } = initialData;

  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleBack = () => {
    navigate(-1);
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Erro: Dados da primeira etapa ausentes. Redirecionando para o início.");
      navigate("/register");
      return;
    }

    const finalRegistrationData = {
      name: name.trim(),
      email: email.trim(),
      cpf: Number(cpf),
      birthDate,
      password: password.trim(),
    };

    try {
      setLoading(true);
      console.log("Enviando dados para API:", finalRegistrationData);

      // Chamada real ao backend
      const response = await registerUser(finalRegistrationData);
      console.log("Usuário cadastrado com sucesso:", response);

      alert(`Conta criada com sucesso! Seja bem-vindo(a), ${name}!`);
      navigate("/login");
    } catch (error) {
      console.error("Erro ao cadastrar usuário:", error);
      if (error.response) {
        alert(`Erro ${error.response.status}: ${error.response.data.message || "Não foi possível criar a conta."}`);
      } else {
        alert("Erro ao conectar com o servidor. Verifique se o backend está rodando.");
      }
    } finally {
      setLoading(false);
    }
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
            maxLength="14"
            required
          />
            {/* Input de Data de Nascimento */}
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

        {/* Botão para a próxima etapa */}
          <button type="submit" className="register-button" disabled={loading}>
            {loading ? "Criando conta..." : "Criar Conta"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterContinuationPage;
