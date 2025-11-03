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
} from "lucide-react";
import "./IncomeComponents.css";

// jsPDF + autotable
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// --- DADOS INICIAIS (mantidos como fallback enquanto não há dados da API) ---
const initialIncomes = [
  {
    id: 1,
    value: 3000.0,
    isExpense: false,
    date: "2025/10/25",
    category: "Salário",
    description: "Pagamento mensal (Outubro)",
  },
  {
    id: 2,
    value: 500.5,
    isExpense: false,
    date: "2025/10/20",
    category: "Investimento",
    description: "Dividendos de Ações",
  },
  {
    id: 3,
    value: 150.0,
    isExpense: false,
    date: "2025/10/15",
    category: "Outros",
    description: "Venda de item usado",
  },
  {
    id: 4,
    value: 1000.0,
    isExpense: false,
    date: "2025/10/05",
    category: "Retornos",
    description: "Reembolso de despesa",
  },
  {
    id: 5,
    value: 4500.0,
    isExpense: false,
    date: "2025/09/25",
    category: "Salário",
    description: "Pagamento mensal (Setembro)",
  },
];

// Mapeamento de ícones e cores
const CategoryIcons = {
  Salário: { icon: DollarSign, color: "#3498db" },
  Investimento: { icon: TrendingUp, color: "#2ecc71" },
  Retornos: { icon: RefreshCcw, color: "#f39c12" },
  Outros: { icon: MoreHorizontal, color: "#95a5a6" },
};

// Mapeamento categoria <-> id (conforme seu backend)
const CATEGORY_NAME_TO_ID = {
  Salário: 1,
  Investimento: 3,
  Retornos: 4,
  Outros: 5,
};
const CATEGORY_ID_TO_NAME = {
  1: "Salário",
  3: "Investimento",
  4: "Retornos",
  5: "Outros",
};

// utilitário para parsear datas de forma robusta
const parseDate = (dateStr) => {
  if (!dateStr) return new Date(NaN);
  const normalized = dateStr.replace(/-/g, "/");
  return new Date(normalized);
};

// -------------------- COMPONENTES --------------------

// Gráfico de barras horizontais (mantido igual)
const HorizontalBarChart = ({ data }) => (
  <div className="horizontal-chart-area">
    {data.map((item, index) => {
      const categoryColor = CategoryIcons[item.category]?.color || "#2ecc71";
      return (
        <div key={index} className="horizontal-bar-item">
          <div className="category-label">{item.category}</div>
          <div className="bar-wrapper">
            <div
              className="horizontal-bar"
              style={{
                width: `${item.percentage}%`,
                backgroundColor: categoryColor,
              }}
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

// IncomeSummary — filtra por período com base nas datas (mantido)
export const IncomeSummary = ({ incomes }) => {
  const [period, setPeriod] = useState("Último mês");
  const [filteredIncomes, setFilteredIncomes] = useState([]);

  useEffect(() => {
    const now = new Date();
    let startDate;

    if (period === "Último mês") {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (period === "Semestre") {
      startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
    } else {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    const filtered = incomes.filter((i) => {
      const d = parseDate(i.date);
      return !isNaN(d) && d >= startDate;
    });
    setFilteredIncomes(filtered);
  }, [period, incomes]);

  const totalIncome = filteredIncomes.reduce(
    (sum, item) => sum + item.value,
    0
  );

  const summaryData = Object.values(
    filteredIncomes.reduce((acc, curr) => {
      if (!acc[curr.category])
        acc[curr.category] = { category: curr.category, total: 0 };
      acc[curr.category].total += curr.value;
      return acc;
    }, {})
  ).map((item) => ({
    ...item,
    percentage:
      totalIncome === 0 ? 0 : ((item.total / totalIncome) * 100).toFixed(1),
  }));

  return (
    <div className="income-summary-card">
      <header className="summary-header">
        <h3>Resumo</h3>
        <select
          className="filter-dropdown"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        >
          <option>Último mês</option>
          <option>Semestre</option>
          <option>Ano</option>
        </select>
      </header>

      <div className="total-income-value">
        <p>Valor total em Receita (R$)</p>
        <strong>
          {totalIncome.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </strong>
      </div>

      <HorizontalBarChart data={summaryData} />
    </div>
  );
};

// Modal de Filtro atualizado com intervalo de datas (mantido)
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
          <input
            type="number"
            placeholder="Valor mínimo"
            value={minValue}
            onChange={(e) => setMinValue(e.target.value)}
          />
          <input
            type="number"
            placeholder="Valor máximo"
            value={maxValue}
            onChange={(e) => setMaxValue(e.target.value)}
          />
          <div className="date-range-fields">
            <label>De:</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
            <label>Até:</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Todas as categorias</option>
            {Object.keys(CategoryIcons).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div className="modal-button-row">
          <button
            type="button"
            className="modal-submit-button"
            onClick={handleFilter}
          >
            Aplicar Filtro
          </button>
        </div>
        <button className="modal-close-button" onClick={onClose}>
          Fechar
        </button>
      </div>
    </div>
  );
};

// Histórico (mantido, só usa os props que recebe)
export const RecentIncomes = ({ incomes, onAddIncome }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [displayIncomes, setDisplayIncomes] = useState(incomes);

  useEffect(() => setDisplayIncomes(incomes), [incomes]);

  const handleSelectItem = (id) =>
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );

  const handleSelectAll = (checked) => {
    if (checked) setSelectedItems(displayIncomes.map((i) => i.id));
    else setSelectedItems([]);
  };

  const handleFilter = ({ minValue, maxValue, dateFrom, dateTo, category }) => {
    let filtered = [...incomes];
    if (minValue)
      filtered = filtered.filter((i) => i.value >= parseFloat(minValue));
    if (maxValue)
      filtered = filtered.filter((i) => i.value <= parseFloat(maxValue));
    if (dateFrom)
      filtered = filtered.filter(
        (i) => parseDate(i.date) >= parseDate(dateFrom)
      );
    if (dateTo)
      filtered = filtered.filter((i) => parseDate(i.date) <= parseDate(dateTo));
    if (category) filtered = filtered.filter((i) => i.category === category);
    setDisplayIncomes(filtered);
    setSelectedItems([]);
  };

  // --- Export to PDF usando selectedItems e displayIncomes ---
  const exportSelectedToPDF = () => {
    if (!selectedItems || selectedItems.length === 0) return;

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Receitas Selecionadas", 14, 20);

    // Cabeçalho da tabela
    const head = [["Descrição", "Categoria", "Valor (R$)", "Data"]];

    // Linhas: seleciona a partir de displayIncomes (filtradas)
    const body = selectedItems.map((id) => {
      const income =
        displayIncomes.find((i) => i.id === id) ||
        incomes.find((i) => i.id === id);
      if (!income) return ["-", "-", "-", "-"];

      const dateObj = parseDate(income.date);
      const dateStr = isNaN(dateObj)
        ? income.date
        : dateObj.toLocaleDateString("pt-BR");

      return [
        income.description,
        income.category,
        income.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 }),
        dateStr,
      ];
    });

    // Gera a tabela no PDF
    autoTable(doc, {
      startY: 30,
      head,
      body,
      styles: { fontSize: 11 },
      headStyles: { fillColor: [240, 240, 240], textColor: [40, 40, 40] },
      margin: { left: 14, right: 14 },
    });

    // Salva o PDF
    const filename = `receitas_${new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/[:T]/g, "-")}.pdf`;
    doc.save(filename);
  };

  const isExportButtonVisible = selectedItems.length > 0;

  return (
    <div className="recent-incomes-card">
      <header className="incomes-header">
        <div className="header-left">
          {displayIncomes.length > 0 && (
            <input
              type="checkbox"
              checked={
                selectedItems.length === displayIncomes.length &&
                displayIncomes.length > 0
              }
              onChange={e => handleSelectAll(e.target.checked)}
            />
          )}
          <h3>Histórico</h3>
        </div>

        <button
          className="filter-button"
          onClick={() => setIsFilterModalOpen(true)}
        >
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
          {displayIncomes.map((item) => {
            const isSelected = selectedItems.includes(item.id);
            const { icon: Icon, color } = CategoryIcons[item.category] || {
              icon: DollarSign,
              color: "#333",
            };
            return (
              <div
                key={item.id}
                className={`list-item ${isSelected ? "selected" : ""}`}
              >
                <div className="col-checkbox">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleSelectItem(item.id)}
                  />
                </div>
                <div className="col-value value-income">
                  + R${" "}
                  {item.value.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </div>
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

      {isExportButtonVisible && (
        <div className="export-action-bar">
          <button className="export-button" onClick={exportSelectedToPDF}>
            <Download size={18} /> Exportar para PDF ({selectedItems.length})
          </button>
        </div>
      )}

      <button
        className={`add-income-fab ${incomes.length === 0 ? "bouncing" : ""}`}
        onClick={() => setIsAddModalOpen(true)}
      >
        <Plus size={24} color="white" />
      </button>

      <IncomeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddIncome={(income) => {
          // chama callback enviado pelo pai
          onAddIncome(income);
          setIsAddModalOpen(false);
        }}
      />
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onFilter={handleFilter}
      />
    </div>
  );
};

// Modal de adicionar receita (mantido estrutura; apenas chama onAddIncome)
const IncomeModal = ({ isOpen, onClose, onAddIncome }) => {
  const [formData, setFormData] = useState({
    description: "",
    value: "",
    date: "",
    category: "",
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !formData.description ||
      !formData.value ||
      !formData.date ||
      !formData.category
    )
      return;

    // Envia o objeto para o pai (pai decidirá se manda para API)
    onAddIncome({
      id: Date.now(),
      description: formData.description,
      value: parseFloat(formData.value),
      date: formData.date,
      category: formData.category,
      isExpense: false,
    });

    setFormData({ description: "", value: "", date: "", category: "" });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">Adicionar Nova Receita</h3>
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
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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
              Salvar Receita
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

// Componente pai (modificado para buscar/criar via API sem alterar a API interna)
export const IncomeContainer = () => {
  const [incomes, setIncomes] = useState(initialIncomes);

  // Pega id do usuário logado (de onde você já salvou no login)
  const userId = localStorage.getItem("userId");

  // Função para mapear receita do backend para o formato usado aqui
  const mapApiIncomeToLocal = (item) => ({
    id: item.id,
    value: parseFloat(item.value),
    isExpense: false,
    date: item.incomeDate || item.date || "",
    category: CATEGORY_ID_TO_NAME[item.categoryId] || "Outros",
    description: item.description || "",
  });

  // Busca as receitas do backend pelo userId e atualiza o estado
  const fetchIncomesFromApi = async () => {
    if (!userId) {
      console.warn("IncomeContainer: userId não encontrado no localStorage.");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:8080/piglet/api/users/${userId}/incomes`
      );
      if (!res.ok) {
        console.error("Erro ao buscar incomes da API:", res.status);
        return;
      }
      const data = await res.json();
      if (!Array.isArray(data)) {
        console.warn("Resposta de incomes não é array:", data);
        return;
      }
      const mapped = data.map(mapApiIncomeToLocal);
      setIncomes(mapped);
    } catch (err) {
      console.error("Erro ao buscar incomes:", err);
    }
  };

  useEffect(() => {
    // Ao montar, tenta buscar do backend. Se falhar, mantém os dados mockados.
    fetchIncomesFromApi();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ao adicionar nova receita (recebida do IncomeModal via RecentIncomes -> onAddIncome)
  const handleAddIncome = async (newIncome) => {
    // newIncome tem: { id, description, value, date, category, isExpense }
    // Precisamos mandar ao backend com userId e categoryId
    const categoryId = CATEGORY_NAME_TO_ID[newIncome.category] || 5;
    const payload = {
      userId: Number(userId) || 0,
      categoryId,
      description: newIncome.description,
      value: Number(newIncome.value),
      incomeDate: newIncome.date,
    };

    // Tenta enviar ao backend; se der certo, atualiza estado com objeto retornado.
    try {
      const res = await fetch(
        "http://localhost:8080/piglet/api/users/all/incomes",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        // fallback: apenas insere localmente para não quebrar fluxo
        console.warn(
          "POST createIncome retornou status",
          res.status,
          "- adicionando localmente como fallback."
        );
        const localIncome = { ...newIncome, id: Date.now() };
        setIncomes((prev) => [localIncome, ...prev]);
        return;
      }

      const created = await res.json();
      // Normaliza o objeto retornado do backend (pode variar conforme API)
      const mapped = mapApiIncomeToLocal(created);
      setIncomes((prev) => [mapped, ...prev]);
    } catch (err) {
      console.error("Erro ao criar receita na API:", err);
      // fallback local para continuar fluxo
      const localIncome = { ...newIncome, id: Date.now() };
      setIncomes((prev) => [localIncome, ...prev]);
    }
  };

  return (
    <div className="incomes-layout">
      <IncomeSummary incomes={incomes} />
      <RecentIncomes incomes={incomes} onAddIncome={handleAddIncome} />
    </div>
  );
};
