import api from "./axiosConfig";

// POST - cadastra novo usuário
export const registerUser = async (userData) => {
    const response = await api.post("/users", userData);
    return response.data;
};

// GET - busca usuário por email e senha (usando query params)
export const getUsers = async (email, password) => {
    const response = await api.get("/users", {
        params: {
            email: email,
            password: password,
        },
    });
    return response.data;
};
