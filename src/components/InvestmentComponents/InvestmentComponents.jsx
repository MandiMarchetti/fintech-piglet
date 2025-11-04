import React, { useState, useEffect } from "react";
import {
    ChevronDown,
    Briefcase,
    DollarSign,
    Filter,
    Download,
    Plus,
    Trash2,
    Edit2,
} from "lucide-react";
import "./InvestmentComponents.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// --- DADOS INICIAIS VAZIOS ---
const initialInvestments = [];

// util parseDate (mesma do expenses)
const parseDate = (dateStr) => {
    if (!dateStr) return new Date(NaN);
    const normalized = dateStr.replace(/-/g, "/");
    return new Date(normalized);
};

// -------------------- COMPONENTES --------------------

// Gráfico horizontal (agrupa por name)
const HorizontalBarChart = ({ data }) => (
    <div className="horizontal-chart-area">
        {data.map((item, index) => (
            <div key={index} className="horizontal-bar-item">
                <div className="category-label">{item.name}</div>
                <div className="bar-wrapper">
                    <div
                        className="horizontal-bar"
                        style={{ width: `${item.percentage}%` }}
                    />
                </div>
                <div className="percentage-label">{item.percentage}%</div>
            </div>
        ))}
    </div>
);

// InvestmentSummary (estrutura idêntica ao ExpenseSummary, adaptada)
export const InvestmentSummary = ({ investments }) => {
    const [period, setPeriod] = useState("Últimos 30 dias");
    const [filteredInvestments, setFilteredInvestments] = useState([]);

    useEffect(() => {
        const now = new Date();
        let startDate;
        if (period === "Últimos 30 dias") startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        else if (period === "Semestre") startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        else startDate = new Date(now.getFullYear(), 0, 1);

        const filtered = investments.filter((i) => parseDate(i.investmentDate) >= startDate);
        setFilteredInvestments(filtered);
    }, [period, investments]);

    const totalInvestment = filteredInvestments.reduce((sum, item) => sum + (item.investmentValue || 0), 0);

    const summaryData = Object.values(
        filteredInvestments.reduce((acc, curr) => {
            if (!acc[curr.name]) acc[curr.name] = { name: curr.name, total: 0 };
            acc[curr.name].total += curr.investmentValue || 0;
            return acc;
        }, {})
    ).map((item) => ({
        ...item,
        percentage: totalInvestment === 0 ? 0 : ((item.total / totalInvestment) * 100).toFixed(1),
    }));

    return (
        <div className="expense-summary-card"> {/* usa mesma classe pra manter estilo */}
            <header className="summary-header">
                <h3>Investimento</h3>
                <select className="filter-dropdown" value={period} onChange={(e) => setPeriod(e.target.value)}>
                    <option>Últimos 30 dias</option>
                    <option>Semestre</option>
                    <option>Ano</option>
                </select>
            </header>
            <div className="total-investment-value">
                <p>Valor total investido (R$)</p>
                {/* não aplicamos cor vermelha; deixamos padrão */}
                <strong>
                    {totalInvestment.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </strong>
            </div>
            <HorizontalBarChart data={summaryData} />
        </div>
    );
};

// FilterModal (sem categoria)
const FilterModal = ({ isOpen, onClose, onFilter }) => {
    const [minValue, setMinValue] = useState("");
    const [maxValue, setMaxValue] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    if (!isOpen) return null;

    const handleFilter = () => {
        onFilter({ minValue, maxValue, dateFrom, dateTo });
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3 className="modal-title">Filtrar Investimentos</h3>
                <div className="modal-form">
                    <input type="number" placeholder="Valor mínimo" value={minValue} onChange={(e) => setMinValue(e.target.value)} />
                    <input type="number" placeholder="Valor máximo" value={maxValue} onChange={(e) => setMaxValue(e.target.value)} />
                    <div className="date-range-fields">
                        <label>De:</label>
                        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                        <label>Até:</label>
                        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                    </div>
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

// InvestmentModal (Adicionar / Editar) — reseta no modo add
const InvestmentModal = ({ isOpen, onClose, onSubmit, initialData, mode }) => {
    const emptyForm = { name: "", investmentValue: "", investmentDate: "", detailedDescription: "" };
    const [formData, setFormData] = useState(emptyForm);

    useEffect(() => {
        if (isOpen) {
            if (mode === "edit" && initialData) setFormData(initialData);
            else setFormData(emptyForm); // reseta em add
        }
    }, [isOpen, mode, initialData]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.investmentValue || !formData.investmentDate) return;
        await onSubmit({ ...formData, investmentValue: parseFloat(formData.investmentValue) });
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3 className="modal-title">
                    {mode === "edit" ? "Editar Investimento" : "Adicionar Investimento"}
                </h3>
                <form className="modal-form" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Nome"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                    <input
                        type="number"
                        placeholder="Valor (R$)"
                        value={formData.investmentValue}
                        onChange={(e) => setFormData({ ...formData, investmentValue: e.target.value })}
                        required
                    />
                    <input
                        type="date"
                        value={formData.investmentDate}
                        onChange={(e) => setFormData({ ...formData, investmentDate: e.target.value })}
                        required
                    />
                    {/* Alterado de <textarea> para <input> normal */}
                    <input
                        type="text"
                        placeholder="Descrição detalhada (opcional)"
                        value={formData.detailedDescription}
                        onChange={(e) => setFormData({ ...formData, detailedDescription: e.target.value })}
                    />
                    <div className="modal-button-row">
                        <button type="submit" className="modal-submit-button">
                            {mode === "edit" ? "Salvar mudanças" : "Salvar"}
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

// RecentInvestments (estrutura igual ao RecentExpenses, adaptada)
export const RecentInvestments = ({ investments, onAddInvestment, onDeleteSelected, onEditInvestment }) => {
    const [selectedItems, setSelectedItems] = useState([]);
    const [displayInvestments, setDisplayInvestments] = useState(investments);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    useEffect(() => setDisplayInvestments(investments), [investments]);

    const handleSelectItem = (id) => setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    const handleSelectAll = (checked) => setSelectedItems(checked ? displayInvestments.map(i => i.id) : []);

    const handleDeleteSelected = async () => {
        await onDeleteSelected(selectedItems);
        setSelectedItems([]);
    };

    const handleExportPDF = () => {
        if (!selectedItems.length) return;
        const doc = new jsPDF();
        doc.text("Investimentos Selecionados", 14, 20);
        const head = [["Nome", "Valor (R$)", "Data", "Descrição"]];
        const body = selectedItems.map(id => {
            const inv = displayInvestments.find(i => i.id === id) || investments.find(i => i.id === id);
            const dateObj = parseDate(inv.investmentDate);
            const dateStr = isNaN(dateObj) ? inv.investmentDate : dateObj.toLocaleDateString("pt-BR");
            return [
                inv.name,
                inv.investmentValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 }),
                dateStr,
                inv.detailedDescription || "",
            ];
        });
        autoTable(doc, { startY: 30, head, body });
        doc.save(`investimentos_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.pdf`);
        setSelectedItems([]);
    };

    const handleFilter = ({ minValue, maxValue, dateFrom, dateTo }) => {
        const filtered = investments.filter((inv) => {
            const valueOk =
                (!minValue || inv.investmentValue >= parseFloat(minValue)) &&
                (!maxValue || inv.investmentValue <= parseFloat(maxValue));
            const dateObj = parseDate(inv.investmentDate);
            const dateOk =
                (!dateFrom || dateObj >= new Date(dateFrom)) &&
                (!dateTo || dateObj <= new Date(dateTo));
            return valueOk && dateOk;
        });
        setDisplayInvestments(filtered);
        setSelectedItems([]);
    };

    const selectedInvestment = selectedItems.length === 1 ? displayInvestments.find(i => i.id === selectedItems[0]) : null;

    return (
        <div className="recent-expenses-card"> {/* usa mesma classe para estilo idêntico */}
            <header className="expenses-header">
                <div className="header-left">
                    {displayInvestments.length > 0 && (
                        <input
                            type="checkbox"
                            checked={selectedItems.length === displayInvestments.length && displayInvestments.length > 0}
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
                    <span className="col-value">Nome</span>
                    <span className="col-value">Valor</span>
                    <span className="col-date">Data</span>
                    <span className="col-description">Descrição</span>
                </div>
                <div className="list-body">
                    {displayInvestments.map((item) => {
                        const isSelected = selectedItems.includes(item.id);
                        return (
                            <div key={item.id} className={`list-item ${isSelected ? "selected" : ""}`}>
                                <div className="col-checkbox">
                                    <input type="checkbox" checked={isSelected} onChange={() => handleSelectItem(item.id)} />
                                </div>
                                <div className="col-value">{item.name}</div>
                                <div className="col-value">R$ {item.investmentValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
                                <div className="col-date">
                                    {(() => {
                                        const d = parseDate(item.investmentDate);
                                        return isNaN(d) ? item.investmentDate : d.toLocaleDateString("pt-BR");
                                    })()}
                                </div>
                                <div className="col-description">{item.detailedDescription}</div>
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
                className={`add-investment-fab ${investments.length === 0 ? "bouncing" : ""}`}
                onClick={() => setIsAddModalOpen(true)}
            >
                <Plus size={24} color="white" />
            </button>



            <InvestmentModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} mode="add" onSubmit={onAddInvestment} />
            <InvestmentModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                mode="edit"
                initialData={selectedInvestment}
                onSubmit={async (data) => await onEditInvestment({ ...selectedInvestment, ...data })}
            />
            <FilterModal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} onFilter={handleFilter} />
        </div>
    );
};

// InvestmentContainer (mesma estrutura do ExpenseContainer)
export const InvestmentContainer = () => {
    const [investments, setInvestments] = useState(initialInvestments);
    const userId = localStorage.getItem("userId");

    const mapApiInvestmentToLocal = (item) => ({
        id: item.id,
        name: item.name,
        investmentValue: parseFloat(item.investmentValue || item.amount || 0),
        investmentDate: item.investmentDate || item.date || "",
        detailedDescription: item.detailedDescription || item.description || "",
    });

    const fetchInvestmentsFromApi = async () => {
        if (!userId) return; // seguir padrão: não busca sem userId
        try {
            const res = await fetch(`http://localhost:8080/piglet/api/users/${userId}/investments`);
            if (!res.ok) return;
            const data = await res.json();
            if (!Array.isArray(data)) return;
            setInvestments(data.map(mapApiInvestmentToLocal));
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchInvestmentsFromApi();
    }, []);

    const handleAddInvestment = async (newInvestment) => {
        const payload = { userId: Number(userId) || 0, ...newInvestment };
        try {
            const res = await fetch(`http://localhost:8080/piglet/api/users/all/investments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const created = await res.json();
            setInvestments((prev) => [mapApiInvestmentToLocal(created), ...prev]);
        } catch (err) {
            // fallback local
            setInvestments((prev) => [{ ...newInvestment, id: Date.now() }, ...prev]);
        }
    };

    const handleDeleteSelected = async (ids) => {
        if (!ids.length || !window.confirm("Deseja realmente deletar os investimentos selecionados?")) return;
        for (const id of ids) {
            try {
                await fetch(`http://localhost:8080/piglet/api/users/all/investments/${id}`, { method: "DELETE" });
            } catch (err) {
                console.error(err);
            }
        }
        setInvestments((prev) => prev.filter((i) => !ids.includes(i.id)));
    };

    const handleEditInvestment = async (investment) => {
        const payload = { ...investment, userId: Number(userId) || 0 };
        try {
            const res = await fetch(`http://localhost:8080/piglet/api/users/all/investments/${investment.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error("Erro ao atualizar investimento");
            const updated = await res.json();
            setInvestments((prev) => prev.map((i) => (i.id === investment.id ? mapApiInvestmentToLocal(updated) : i)));
        } catch (err) {
            console.error(err);
            setInvestments((prev) => prev.map((i) => (i.id === investment.id ? investment : i)));
        }
    };

    return (
        <div className="expenses-layout"> {/* usa mesma grid/layout do ExpenseComponents */}
            <InvestmentSummary investments={investments} />
            <RecentInvestments
                investments={investments}
                onAddInvestment={handleAddInvestment}
                onDeleteSelected={handleDeleteSelected}
                onEditInvestment={handleEditInvestment}
            />
        </div>
    );
};

export default InvestmentContainer;
