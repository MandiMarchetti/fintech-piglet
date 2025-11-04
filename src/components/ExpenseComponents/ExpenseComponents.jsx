import React, { useState, useEffect } from "react";
import {
    ChevronDown,
    ShoppingCart,
    Car,
    Heart,
    Activity,
    Circle,
    Filter,
    Download,
    Plus,
    Trash2,
    Edit2,
} from "lucide-react";
import "./ExpenseComponents.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// --- DADOS INICIAIS VAZIOS ---
const initialExpenses = [];

// Mapas
const CategoryIcons = {
    Alimentação: { icon: ShoppingCart, color: "#e67e22" },
    Transporte: { icon: Car, color: "#2980b9" },
    Lazer: { icon: Heart, color: "#9b59b6" },
    Saúde: { icon: Activity, color: "#c0392b" },
    Outros: { icon: Circle, color: "#7f8c8d" },
};

const CATEGORY_NAME_TO_ID = {
    Alimentação: 6,
    Transporte: 7,
    Lazer: 8,
    Saúde: 9,
    Outros: 10,
};

const CATEGORY_ID_TO_NAME = {
    6: "Alimentação",
    7: "Transporte",
    8: "Lazer",
    9: "Saúde",
    10: "Outros",
};

const parseDate = (dateStr) => {
    if (!dateStr) return new Date(NaN);
    const normalized = dateStr.replace(/-/g, "/");
    return new Date(normalized);
};

// -------------------- COMPONENTES --------------------

// Gráfico de barras horizontais
const HorizontalBarChart = ({ data }) => (
    <div className="horizontal-chart-area">
        {data.map((item, index) => {
            const categoryColor = CategoryIcons[item.category]?.color || "#e74c3c";
            return (
                <div key={index} className="horizontal-bar-item">
                    <div className="category-label">{item.category}</div>
                    <div className="bar-wrapper">
                        <div
                            className="horizontal-bar"
                            style={{ width: `${item.percentage}%`, backgroundColor: categoryColor }}
                        />
                    </div>
                    <div className="percentage-label" style={{ color: categoryColor }}>
                        {item.percentage}%
                    </div>
                </div>
            );
        })}
    </div>
);

// ExpenseSummary
export const ExpenseSummary = ({ expenses }) => {
    const [period, setPeriod] = useState("Último mês");
    const [filteredExpenses, setFilteredExpenses] = useState([]);

    useEffect(() => {
        const now = new Date();
        let startDate;
        if (period === "Último mês") startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        else if (period === "Semestre") startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        else startDate = new Date(now.getFullYear(), 0, 1);

        const filtered = expenses.filter((i) => parseDate(i.date) >= startDate);
        setFilteredExpenses(filtered);
    }, [period, expenses]);

    const totalExpense = filteredExpenses.reduce((sum, item) => sum + item.value, 0);

    const summaryData = Object.values(
        filteredExpenses.reduce((acc, curr) => {
            if (!acc[curr.category]) acc[curr.category] = { category: curr.category, total: 0 };
            acc[curr.category].total += curr.value;
            return acc;
        }, {})
    ).map((item) => ({
        ...item,
        percentage: totalExpense === 0 ? 0 : ((item.total / totalExpense) * 100).toFixed(1),
    }));

    return (
        <div className="expense-summary-card">
            <header className="summary-header">
                <h3>Despesas</h3>
                <select className="filter-dropdown" value={period} onChange={(e) => setPeriod(e.target.value)}>
                    <option>Último mês</option>
                    <option>Semestre</option>
                    <option>Ano</option>
                </select>
            </header>
            <div className="total-expense-value">
                <p>Valor total em Despesas (R$)</p>
                <strong className="red-text">
                    {totalExpense.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </strong>
            </div>
            <HorizontalBarChart data={summaryData} />
        </div>
    );
};

// FilterModal
const FilterModal = ({ isOpen, onClose, onFilter }) => {
    const [minValue, setMinValue] = useState("");
    const [maxValue, setMaxValue] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [category, setCategory] = useState("");

    if (!isOpen) return null;

    const handleFilter = () => {
        onFilter({ minValue, maxValue, dateFrom, dateTo, category });
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3 className="modal-title">Filtrar Despesas</h3>
                <div className="modal-form">
                    <input type="number" placeholder="Valor mínimo" value={minValue} onChange={(e) => setMinValue(e.target.value)} />
                    <input type="number" placeholder="Valor máximo" value={maxValue} onChange={(e) => setMaxValue(e.target.value)} />
                    <div className="date-range-fields">
                        <label>De:</label>
                        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                        <label>Até:</label>
                        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                    </div>
                    <select value={category} onChange={(e) => setCategory(e.target.value)}>
                        <option value="">Todas as categorias</option>
                        {Object.keys(CategoryIcons).map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
                <div className="modal-button-row">
                    <button type="button" className="modal-submit-button" onClick={handleFilter}>
                        Aplicar Filtro
                    </button>
                </div>
                <button className="modal-close-button" onClick={onClose}>Fechar</button>
            </div>
        </div>
    );
};

// ExpenseModal (Adicionar/Editar)
const ExpenseModal = ({ isOpen, onClose, onSubmit, initialData, mode }) => {
    const emptyForm = { description: "", value: "", date: "", category: "" };
    const [formData, setFormData] = useState(emptyForm);

    useEffect(() => {
        // Quando abre o modal:
        if (isOpen) {
            if (mode === "edit" && initialData) {
                setFormData(initialData);
            } else {
                // Se for modo "adicionar", reseta os campos
                setFormData(emptyForm);
            }
        }
    }, [isOpen, mode, initialData]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.description || !formData.value || !formData.date || !formData.category) return;
        await onSubmit({ ...formData, value: parseFloat(formData.value) });
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3 className="modal-title">
                    {mode === "edit" ? "Editar Despesa" : "Adicionar Nova Despesa"}
                </h3>
                <form className="modal-form" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Descrição"
                        value={formData.description}
                        onChange={(e) =>
                            setFormData({ ...formData, description: e.target.value })
                        }
                        required
                    />
                    <input
                        type="number"
                        placeholder="Valor (R$)"
                        value={formData.value}
                        onChange={(e) =>
                            setFormData({ ...formData, value: e.target.value })
                        }
                        required
                    />
                    <input
                        type="date"
                        value={formData.date}
                        onChange={(e) =>
                            setFormData({ ...formData, date: e.target.value })
                        }
                        required
                    />
                    <select
                        value={formData.category}
                        onChange={(e) =>
                            setFormData({ ...formData, category: e.target.value })
                        }
                        required
                    >
                        <option value="">Selecione a Categoria</option>
                        {Object.keys(CategoryIcons).map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
                    <div className="modal-button-row">
                        <button type="submit" className="modal-submit-button">
                            {mode === "edit" ? "Salvar mudanças" : "Salvar Despesa"}
                        </button>
                    </div>
                </form>
                <button className="modal-close-button" onClick={onClose}>
                    Fechar
                </button>
            </div>
        </div>
    );
};


// RecentExpenses
export const RecentExpenses = ({ expenses, onAddExpense, onDeleteSelected, onEditExpense }) => {
    const [selectedItems, setSelectedItems] = useState([]);
    const [displayExpenses, setDisplayExpenses] = useState(expenses);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    useEffect(() => setDisplayExpenses(expenses), [expenses]);

    const handleSelectItem = (id) =>
        setSelectedItems((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));

    const handleSelectAll = (checked) => setSelectedItems(checked ? displayExpenses.map((i) => i.id) : []);

    const handleDeleteSelected = async () => {
        await onDeleteSelected(selectedItems);
        setSelectedItems([]);
    };

    const handleExportPDF = () => {
        if (!selectedItems.length) return;
        const doc = new jsPDF();
        doc.text("Despesas Selecionadas", 14, 20);
        const head = [["Descrição", "Categoria", "Valor (R$)", "Data"]];
        const body = selectedItems.map((id) => {
            const expense = displayExpenses.find((i) => i.id === id) || expenses.find((i) => i.id === id);
            const dateObj = parseDate(expense.date);
            const dateStr = isNaN(dateObj) ? expense.date : dateObj.toLocaleDateString("pt-BR");
            return [expense.description, expense.category, expense.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 }), dateStr];
        });
        autoTable(doc, { startY: 30, head, body });
        doc.save(`despesas_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.pdf`);
        setSelectedItems([]);
    };

    // 💡 Função que aplica o filtro
    const handleFilter = (filters) => {
        const { minValue, maxValue, dateFrom, dateTo, category } = filters;

        const filtered = expenses.filter((exp) => {
            const valueOk =
                (!minValue || exp.value >= parseFloat(minValue)) &&
                (!maxValue || exp.value <= parseFloat(maxValue));
            const dateObj = parseDate(exp.date);
            const dateOk =
                (!dateFrom || dateObj >= new Date(dateFrom)) &&
                (!dateTo || dateObj <= new Date(dateTo));
            const categoryOk = !category || exp.category === category;
            return valueOk && dateOk && categoryOk;
        });

        setDisplayExpenses(filtered);
    };

    const selectedExpense = selectedItems.length === 1 ? displayExpenses.find((i) => i.id === selectedItems[0]) : null;

    return (
        <div className="recent-expenses-card">
            <header className="expenses-header">
                <div className="header-left">
                    {displayExpenses.length > 0 && (
                        <input
                            type="checkbox"
                            checked={selectedItems.length === displayExpenses.length && displayExpenses.length > 0}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                        />
                    )}
                    <h3>Histórico</h3>
                </div>
                <button className="filter-button" onClick={() => setIsFilterModalOpen(true)}>
                    <Filter size={16} /> Filtro Detalhado
                </button>
            </header>

            <div className="expenses-list-container">
                <div className="list-header">
                    <span></span>
                    <span className="col-value">Valor</span>
                    <span className="col-date">Data</span>
                    <span className="col-category">Categoria</span>
                    <span className="col-description">Descrição</span>
                </div>
                <div className="list-body">
                    {displayExpenses.map((item) => {
                        const isSelected = selectedItems.includes(item.id);
                        const { icon: Icon, color } = CategoryIcons[item.category] || { icon: Circle, color: "#e74c3c" };
                        return (
                            <div key={item.id} className={`list-item ${isSelected ? "selected" : ""}`}>
                                <div className="col-checkbox">
                                    <input type="checkbox" checked={isSelected} onChange={() => handleSelectItem(item.id)} />
                                </div>
                                <div className="col-value value-expense">- R${" "}{item.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
                                <div className="col-date">
                                    {(() => {
                                        const d = parseDate(item.date);
                                        return isNaN(d) ? item.date : d.toLocaleDateString("pt-BR");
                                    })()}
                                </div>
                                <div className="col-category">
                                    <Icon size={18} color={color} className="category-icon" />
                                    <span className="category-name">{item.category}</span>
                                </div>
                                <div className="col-description">{item.description}</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {selectedItems.length > 0 && (
                <div className="export-action-bar">
                    <button className="export-button" onClick={handleExportPDF}>
                        <Download size={18} /> Exportar PDF ({selectedItems.length})
                    </button>
                    <button className="delete-button" onClick={handleDeleteSelected}>
                        <Trash2 size={18} /> Excluir ({selectedItems.length})
                    </button>
                    {selectedItems.length === 1 && (
                        <button className="edit-button" onClick={() => setIsEditModalOpen(true)}>
                            <Edit2 size={18} /> Editar
                        </button>
                    )}
                </div>
            )}

            <button
                className={`add-expense-fab ${expenses.length === 0 ? "bouncing" : ""}`}
                onClick={() => setIsAddModalOpen(true)}
            >
                <Plus size={24} color="white" />
            </button>


            <ExpenseModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                mode="add"
                onSubmit={onAddExpense}
            />
            <ExpenseModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                mode="edit"
                initialData={selectedExpense}
                onSubmit={async (data) => await onEditExpense({ ...selectedExpense, ...data })}
            />
            {/* 👇 Aqui passamos a função handleFilter corrigida */}
            <FilterModal
                isOpen={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                onFilter={handleFilter}
            />
        </div>
    );
};


// ExpenseContainer
export const ExpenseContainer = () => {
    const [expenses, setExpenses] = useState(initialExpenses);
    const userId = localStorage.getItem("userId");

    const mapApiExpenseToLocal = (item) => ({
        id: item.id,
        value: parseFloat(item.value),
        isExpense: true,
        date: item.expenseDate || item.date || "",
        category: CATEGORY_ID_TO_NAME[item.categoryId] || "Outros",
        description: item.description || "",
    });

    const fetchExpensesFromApi = async () => {
        if (!userId) return;
        try {
            const res = await fetch(`http://localhost:8080/piglet/api/users/${userId}/expenses`);
            if (!res.ok) return;
            const data = await res.json();
            if (!Array.isArray(data)) return;
            setExpenses(data.map(mapApiExpenseToLocal));
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchExpensesFromApi();
    }, []);

    const handleAddExpense = async (newExpense) => {
        const payload = {
            userId: Number(userId) || 0,
            categoryId: CATEGORY_NAME_TO_ID[newExpense.category] || 10,
            description: newExpense.description,
            value: newExpense.value,
            expenseDate: newExpense.date,
        };
        try {
            const res = await fetch(`http://localhost:8080/piglet/api/users/all/expenses`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const created = await res.json();
            setExpenses((prev) => [mapApiExpenseToLocal(created), ...prev]);
        } catch (err) {
            setExpenses((prev) => [{ ...newExpense, id: Date.now() }, ...prev]);
        }
    };

    const handleDeleteSelected = async (ids) => {
        if (!ids.length || !window.confirm("Deseja realmente deletar as despesas selecionadas?")) return;
        for (const id of ids) {
            try {
                await fetch(`http://localhost:8080/piglet/api/users/all/expenses/${id}`, { method: "DELETE" });
            } catch (err) {
                console.error(err);
            }
        }
        setExpenses((prev) => prev.filter((i) => !ids.includes(i.id)));
    };

    const handleEditExpense = async (expense) => {
        const payload = {
            id: expense.id,
            userId: Number(userId),
            categoryId: CATEGORY_NAME_TO_ID[expense.category] || 10,
            description: expense.description,
            value: expense.value,
            expenseDate: expense.date,
        };
        try {
            const res = await fetch(`http://localhost:8080/piglet/api/users/all/expenses/${expense.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error("Erro ao atualizar despesa");
            const updated = await res.json();
            setExpenses((prev) =>
                prev.map((i) => (i.id === expense.id ? mapApiExpenseToLocal(updated) : i))
            );
        } catch (err) {
            console.error(err);
            setExpenses((prev) => prev.map((i) => (i.id === expense.id ? expense : i)));
        }
    };

    return (
        <div className="expenses-layout">
            <ExpenseSummary expenses={expenses} />
            <RecentExpenses
                expenses={expenses}
                onAddExpense={handleAddExpense}
                onDeleteSelected={handleDeleteSelected}
                onEditExpense={handleEditExpense}
            />
        </div>
    );
};
