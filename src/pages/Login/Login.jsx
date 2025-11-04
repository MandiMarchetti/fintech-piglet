import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import PigletLogo from "../../assets/Logo_piglet.svg";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            alert("Preencha todos os campos.");
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:8080/piglet/api/users?email=${encodeURIComponent(email)}&password=${encodeURIComponent(
                    password
                )}`
            );

            if (!response.ok) {
                // Trata erros de forma específica
                switch (response.status) {
                    case 404:
                        alert("Usuário não encontrado. Verifique o e-mail e a senha digitados.");
                        return;
                    case 401:
                        alert("Usuário não encontrado. Verifique o e-mail e a senha digitados.");
                        return;
                    default:
                        alert("Erro inesperado no servidor. Tente novamente mais tarde.");
                        return;
                }
            }

            const data = await response.json();

            if (data && data.id) {
                localStorage.setItem("userId", data.id);
                localStorage.setItem("userName", data.name);
                localStorage.setItem("userEmail", data.email);

                // ✅ Salvar senha usada no login
                localStorage.setItem("userPassword", password);

                alert(`Bem-vindo(a), ${data.name}!`);
                navigate("/Resources");
            } else {
                alert("E-mail ou senha incorretos.");
            }
        } catch (error) {
            console.error("Erro no login:", error);
            alert("Falha ao conectar ao servidor. Verifique sua conexão e tente novamente.");
        }
    };

    const handleRegisterClick = () => navigate("/register");

    return (
        <div className="login-container">
            <div className="login-card">
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

                    <button type="submit" className="login-button">
                        Entrar
                    </button>
                </form>

                <p className="login-footer-text">
                    Não tem uma conta?
                    <span onClick={handleRegisterClick} className="create-account-link">
                        {" "}
                        Criar conta{" "}
                    </span>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
