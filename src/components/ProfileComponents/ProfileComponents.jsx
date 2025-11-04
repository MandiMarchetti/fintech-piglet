import React, { useEffect, useState } from "react";
import "./ProfileComponents.css";
import { LogOut, Trash2, Edit3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProfileComponents = () => {
    const navigate = useNavigate();

    const email = localStorage.getItem("userEmail");
    const password = localStorage.getItem("userPassword");

    const [user, setUser] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editData, setEditData] = useState({
        name: "",
        email: "",
        cpf: "",
        birthDate: "",
        password: ""
    });

    // ✅ Buscar dados do usuário com email + senha
    useEffect(() => {
        if (!email || !password) {
            navigate("/login");
            return;
        }

        const fetchUser = async () => {
            try {
                const res = await fetch(
                    `http://localhost:8080/piglet/api/users?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
                );

                if (!res.ok) throw new Error("Erro ao buscar usuário");

                const data = await res.json();
                setUser(data);
            } catch (err) {
                console.error(err);
                alert("Erro ao carregar dados do usuário");
            }
        };

        fetchUser();
    }, [email, password, navigate]);

    // ✅ Abrir modal com dados preenchidos
    const handleOpenEdit = () => {
        setEditData({
            name: user.name,
            email: user.email,
            cpf: user.cpf,
            birthDate: user.birthDate,
            password: "" // senha opcional
        });
        setIsEditModalOpen(true);
    };

    // ✅ Salvar alterações
    const handleSaveEdit = async (e) => {
        e.preventDefault();

        // Pega a senha atual do localStorage se o usuário não preencher o campo
        const newPassword = editData.password ? editData.password : localStorage.getItem("userPassword");

        // Valida a nova senha apenas se ela for diferente da atual
        if (editData.password) {
            if (editData.password.length < 6) {
                alert("A nova senha deve ter pelo menos 6 caracteres.");
                return;
            }
            if (editData.password === localStorage.getItem("userPassword")) {
                alert("A nova senha não pode ser igual à senha atual.");
                return;
            }
        }

        const body = {
            id: user.id,
            name: editData.name,
            email: editData.email,
            cpf: Number(editData.cpf),
            birthDate: editData.birthDate,
            password: newPassword, // sempre envia a senha
        };

        try {
            const res = await fetch(`http://localhost:8080/piglet/api/users/${user.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!res.ok) throw new Error("Erro ao atualizar");

            const updated = await res.json();
            setUser(updated);
            setIsEditModalOpen(false);

            // Atualiza localStorage caso email ou senha mudem
            localStorage.setItem("userEmail", updated.email);
            localStorage.setItem("userPassword", newPassword);

            alert("Dados atualizados com sucesso!");
        } catch (err) {
            console.error(err);
            alert("Erro ao salvar alterações, verifique se inseriu uma data valida e cpf com exatamente 11 dígitos");
        }
    };


    // ✅ Logout
    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    // ✅ Excluir usuário
    const handleDelete = async () => {
        if (!window.confirm("Tem certeza que deseja excluir sua conta? Essa ação é irreversível.")) return;

        try {
            const res = await fetch(`http://localhost:8080/piglet/api/users/${user.id}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Erro ao excluir conta");

            alert("Conta deletada com sucesso.");
            localStorage.clear();
            navigate("/register");
        } catch (err) {
            console.error(err);
            alert("Erro ao excluir conta.");
        }
    };

    if (!user) return <div className="profile-loading">Carregando...</div>;

    return (
        <div className="profile-container">
            <h1>Meu Perfil</h1>

            <div className="profile-card">
                <p><strong>Nome:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>CPF:</strong> {user.cpf}</p>
                <p><strong>Nascimento:</strong> {user.birthDate}</p>
            </div>

            <div className="profile-buttons">
                <button className="edit-btn" onClick={handleOpenEdit}>
                    <Edit3 size={20} /> Editar Perfil
                </button>

                <button className="logout-btn" onClick={handleLogout}>
                    <LogOut size={20} /> Logout
                </button>

                <button className="delete-btn" onClick={handleDelete}>
                    <Trash2 size={20} /> Deletar Conta
                </button>
            </div>

            {/* ✅ MODAL DE EDIÇÃO */}
            {isEditModalOpen && (
                <div className="profile-modal-overlay" onClick={() => setIsEditModalOpen(false)}>
                    <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
                        <h2>Editar Perfil</h2>

                        <form onSubmit={handleSaveEdit} className="profile-modal-form">
                            <input
                                type="text"
                                required
                                placeholder="Nome"
                                value={editData.name}
                                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                            />

                            <input
                                type="email"
                                required
                                placeholder="Email"
                                value={editData.email}
                                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                            />

                            <input
                                type="text"
                                required
                                placeholder="CPF"
                                value={editData.cpf}
                                maxLength={11} // opcional, garante no input
                                minLength={11}
                                onChange={(e) => {
                                    // Remove qualquer caractere que não seja número
                                    const onlyNumbers = e.target.value.replace(/\D/g, "");
                                    setEditData({ ...editData, cpf: onlyNumbers });
                                }}
                            />

                            <input
                                type="date"
                                required
                                value={editData.birthDate}
                                onChange={(e) => setEditData({ ...editData, birthDate: e.target.value })}
                            />

                            <input
                                type="password"
                                placeholder="Nova senha (opcional)"
                                value={editData.password}
                                onChange={(e) => setEditData({ ...editData, password: e.target.value })}
                            />

                            <button type="submit" className="save-edit-btn">Salvar</button>
                        </form>

                        <button className="close-modal-btn" onClick={() => setIsEditModalOpen(false)}>Fechar</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileComponents;
