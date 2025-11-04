import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  BarChart2,
  DollarSign,
  TrendingUp,
  RefreshCcw,
  MoreHorizontal,
  Download,
  Plus,
  Calendar,
  Filter,
  Trash2,
  Edit2,
} from "lucide-react";
import "./IncomeComponents.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// --- DADOS INICIAIS VAZIOS ---
const initialIncomes = [];

// Mapas
const CategoryIcons = {
  Salário: { icon: DollarSign, color: "#3498db" },
  Investimento: { icon: TrendingUp, color: "#2ecc71" },
  Retornos: { icon: RefreshCcw, color: "#f39c12" },
  Outros: { icon: MoreHorizontal, color: "#95a5a6" },
};
const CATEGORY_NAME_TO_ID = { Salário: 1, Investimento: 3, Retornos: 4, Outros: 5 };
const CATEGORY_ID_TO_NAME = { 1: "Salário", 3: "Investimento", 4: "Retornos", 5: "Outros" };
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
      const categoryColor = CategoryIcons[item.category]?.color || "#2ecc71";
      return (
        <div key={index} className="horizontal-bar-item">
          <div className="category-label">{item.category}</div>
          <div className="bar-wrapper">
            <div className="horizontal-bar" style={{ width: `${item.percentage}%`, backgroundColor: categoryColor }} />
          </div>
          <div className="percentage-label" style={{ color: categoryColor }}>{item.percentage}%</div>
        </div>
      );
    })}
  </div>
);

// IncomeSummary
export const IncomeSummary = ({ incomes }) => {
  const [period, setPeriod] = useState("Últimos 30 dias");
  const [filteredIncomes, setFilteredIncomes] = useState([]);

  useEffect(() => {
    const now = new Date();
    let startDate;
    if (period === "Últimos 30 dias") startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    else if (period === "Semestre") startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
    else startDate = new Date(now.getFullYear(), 0, 1);

    const filtered = incomes.filter((i) => parseDate(i.date) >= startDate);
    setFilteredIncomes(filtered);
  }, [period, incomes]);

  const totalIncome = filteredIncomes.reduce((sum, item) => sum + item.value, 0);

  const summaryData = Object.values(filteredIncomes.reduce((acc, curr) => {
    if (!acc[curr.category]) acc[curr.category] = { category: curr.category, total: 0 };
    acc[curr.category].total += curr.value;
    return acc;
  }, {})).map((item) => ({
    ...item,
    percentage: totalIncome === 0 ? 0 : ((item.total / totalIncome) * 100).toFixed(1),
  }));

  return (
    <div className="income-summary-card">
      <header className="summary-header">
        <h3>Receitas</h3>
        <select className="filter-dropdown" value={period} onChange={(e) => setPeriod(e.target.value)}>
          <option>Últimos 30 dias</option>
          <option>Semestre</option>
          <option>Ano</option>
        </select>
      </header>
      <div className="total-income-value">
        <p>Valor total em Receita (R$)</p>
        <strong>{totalIncome.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
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
        <h3 className="modal-title">Filtrar Receitas</h3>
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
            {Object.keys(CategoryIcons).map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <div className="modal-button-row">
          <button type="button" className="modal-submit-button" onClick={handleFilter}>Aplicar Filtro</button>
        </div>
        <button className="modal-close-button" onClick={onClose}>Fechar</button>
      </div>
    </div>
  );
};

// IncomeModal (Adicionar ou Editar)
const IncomeModal = ({ isOpen, onClose, onSubmit, initialData, mode }) => {
  const emptyForm = { description: "", value: "", date: "", category: "" };
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && initialData) {
        setFormData(initialData);
      } else {
        setFormData(emptyForm); // reseta os campos no modo adicionar
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
          {mode === "edit" ? "Editar Receita" : "Adicionar Nova Receita"}
        </h3>
        <form className="modal-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Descrição"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Valor (R$)"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            required
          />
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
              {mode === "edit" ? "Salvar mudanças" : "Salvar Receita"}
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


// RecentIncomes
export const RecentIncomes = ({ incomes, onAddIncome, onDeleteSelected, onEditIncome }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [displayIncomes, setDisplayIncomes] = useState(incomes);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  useEffect(() => setDisplayIncomes(incomes), [incomes]);

  const handleSelectItem = (id) => setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const handleSelectAll = (checked) => setSelectedItems(checked ? displayIncomes.map(i => i.id) : []);

  const handleDeleteSelected = async () => { await onDeleteSelected(selectedItems); setSelectedItems([]); };
  const handleExportPDF = () => {
    if (!selectedItems.length) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Receitas Selecionadas", 14, 20);
    const head = [["Descrição", "Categoria", "Valor (R$)", "Data"]];
    const body = selectedItems.map(id => {
      const income = displayIncomes.find(i => i.id === id) || incomes.find(i => i.id === id);
      const dateObj = parseDate(income.date);
      const dateStr = isNaN(dateObj) ? income.date : dateObj.toLocaleDateString("pt-BR");
      return [income.description, income.category, income.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 }), dateStr];
    });
    autoTable(doc, { startY: 30, head, body, styles: { fontSize: 11 }, headStyles: { fillColor: [240, 240, 240], textColor: [40, 40, 40] }, margin: { left: 14, right: 14 } });
    doc.save(`receitas_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.pdf`);
    setSelectedItems([]);
  };

  const handleFilter = ({ minValue, maxValue, dateFrom, dateTo, category }) => {
    let filtered = [...incomes];
    if (minValue) filtered = filtered.filter(i => i.value >= parseFloat(minValue));
    if (maxValue) filtered = filtered.filter(i => i.value <= parseFloat(maxValue));
    if (dateFrom) filtered = filtered.filter(i => parseDate(i.date) >= parseDate(dateFrom));
    if (dateTo) filtered = filtered.filter(i => parseDate(i.date) <= parseDate(dateTo));
    if (category) filtered = filtered.filter(i => i.category === category);
    setDisplayIncomes(filtered);
    setSelectedItems([]);
  };

  const selectedIncome = selectedItems.length === 1 ? displayIncomes.find(i => i.id === selectedItems[0]) : null;

  return (
    <div className="recent-incomes-card">
      <header className="incomes-header">
        <div className="header-left">
          {displayIncomes.length > 0 && (
            <input type="checkbox" checked={selectedItems.length === displayIncomes.length && displayIncomes.length > 0} onChange={e => handleSelectAll(e.target.checked)} />
          )}
          <h3>Histórico</h3>
        </div>
        <button className="filter-button" onClick={() => setIsFilterModalOpen(true)}>
          <Filter size={16} /> Filtro Detalhado
        </button>
      </header>

      <div className="incomes-list-container">
        <div className="list-header">
          <span></span>
          <span className="col-value">Valor</span>
          <span className="col-date">Data</span>
          <span className="col-category">Categoria</span>
          <span className="col-description">Descrição</span>
        </div>
        <div className="list-body">
          {displayIncomes.map(item => {
            const isSelected = selectedItems.includes(item.id);
            const { icon: Icon, color } = CategoryIcons[item.category] || { icon: DollarSign, color: "#333" };
            return (
              <div key={item.id} className={`list-item ${isSelected ? "selected" : ""}`}>
                <div className="col-checkbox">
                  <input type="checkbox" checked={isSelected} onChange={() => handleSelectItem(item.id)} />
                </div>
                <div className="col-value value-income">+ R${" "}{item.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
                <div className="col-date">{(() => { const d = parseDate(item.date); return isNaN(d) ? item.date : d.toLocaleDateString("pt-BR"); })()}</div>
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

      <button className={`add-income-fab ${incomes.length === 0 ? "bouncing" : ""}`} onClick={() => setIsAddModalOpen(true)}>
        <Plus size={24} color="white" />
      </button>

      <IncomeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        mode="add"
        onSubmit={onAddIncome}
      />
      <IncomeModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        mode="edit"
        initialData={selectedIncome}
        onSubmit={async (data) => await onEditIncome({ ...selectedIncome, ...data })}
      />
      <FilterModal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} onFilter={handleFilter} />
    </div>
  );
};

// IncomeContainer
export const IncomeContainer = () => {
  const [incomes, setIncomes] = useState(initialIncomes);
  const userId = localStorage.getItem("userId");

  const mapApiIncomeToLocal = (item) => ({
    id: item.id,
    value: parseFloat(item.value),
    isExpense: false,
    date: item.incomeDate || item.date || "",
    category: CATEGORY_ID_TO_NAME[item.categoryId] || "Outros",
    description: item.description || "",
  });

  const fetchIncomesFromApi = async () => {
    if (!userId) return;
    try {
      const res = await fetch(`http://localhost:8080/piglet/api/users/${userId}/incomes`);
      if (!res.ok) return;
      const data = await res.json();
      if (!Array.isArray(data)) return;
      setIncomes(data.map(mapApiIncomeToLocal));
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchIncomesFromApi(); }, []);

  const handleAddIncome = async (newIncome) => {
    const payload = { userId: Number(userId) || 0, categoryId: CATEGORY_NAME_TO_ID[newIncome.category] || 5, description: newIncome.description, value: newIncome.value, incomeDate: newIncome.date };
    try {
      const res = await fetch(`http://localhost:8080/piglet/api/users/all/incomes`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const created = await res.json();
      setIncomes(prev => [mapApiIncomeToLocal(created), ...prev]);
    } catch (err) { setIncomes(prev => [{ ...newIncome, id: Date.now() }, ...prev]); }
  };

  const handleDeleteSelected = async (ids) => {
    if (!ids.length || !window.confirm("Deseja realmente deletar as receitas selecionadas?")) return;
    for (const id of ids) {
      try { await fetch(`http://localhost:8080/piglet/api/users/all/incomes/${id}`, { method: "DELETE" }); } 
      catch (err) { console.error(err); }
    }
    setIncomes(prev => prev.filter(i => !ids.includes(i.id)));
  };

  const handleEditIncome = async (income) => {
    const payload = { id: income.id, userId: Number(userId), categoryId: CATEGORY_NAME_TO_ID[income.category] || 5, description: income.description, value: income.value, incomeDate: income.date };
    try {
      const res = await fetch(`http://localhost:8080/piglet/api/users/all/incomes/${income.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error("Erro ao atualizar receita");
      const updated = await res.json();
      setIncomes(prev => prev.map(i => i.id === income.id ? mapApiIncomeToLocal(updated) : i));
    } catch (err) {
      console.error(err);
      setIncomes(prev => prev.map(i => i.id === income.id ? income : i));
    }
  };

  return (
    <div className="incomes-layout">
      <IncomeSummary incomes={incomes} />
      <RecentIncomes
        incomes={incomes}
        onAddIncome={handleAddIncome}
        onDeleteSelected={handleDeleteSelected}
        onEditIncome={handleEditIncome}
      />
    </div>
  );
};
