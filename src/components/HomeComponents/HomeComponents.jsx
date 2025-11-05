import React, { useState, useEffect } from 'react';
import { ArrowDown, ArrowUp, BarChart3 } from 'lucide-react';
import './HomeComponents.css';

/**
 * Helper para converter datas e meses, ignorando fuso horário
 */
const parseLocalDate = (dateString) => {
  if (!dateString) return null;
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts.map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(dateString);
};

/**
 * COMPONENTE 1: RESUMO GERAL (BalanceSummary)
 */
export const BalanceSummary = () => {
  const [filter, setFilter] = useState('monthly');
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [balance, setBalance] = useState(0);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [incomeRes, expenseRes] = await Promise.all([
          fetch(`http://localhost:8080/piglet/api/users/${userId}/incomes`),
          fetch(`http://localhost:8080/piglet/api/users/${userId}/expenses`),
        ]);

        const incomeData = incomeRes.ok ? await incomeRes.json() : [];
        const expenseData = expenseRes.ok ? await expenseRes.json() : [];

        // Define intervalo de tempo conforme o filtro
        const now = new Date();
        let startDate;

        if (filter === 'monthly') {
          // Últimos 30 dias
          startDate = new Date();
          startDate.setDate(now.getDate() - 30);
        } else if (filter === 'semiannual') {
          // Últimos 6 meses
          startDate = new Date(now.getFullYear(), now.getMonth() - 5, now.getDate());
        } else if (filter === 'annual') {
          // Ano vigente
          startDate = new Date(now.getFullYear(), 0, 1);
        }

        const endDate = now;

        // Função genérica de filtragem por data
        const filterByDate = (item, dateKey) => {
          const d = parseLocalDate(item[dateKey] || item.date);
          return d && d >= startDate && d <= endDate;
        };

        // Filtra receitas e despesas
        const filteredIncomes = incomeData.filter((i) => filterByDate(i, 'incomeDate'));
        const filteredExpenses = expenseData.filter((e) => filterByDate(e, 'expenseDate'));

        // Soma valores
        const incomeSum = filteredIncomes.reduce(
          (sum, i) => sum + parseFloat(i.value || 0),
          0
        );
        const expenseSum = filteredExpenses.reduce(
          (sum, e) => sum + parseFloat(e.value || 0),
          0
        );

        setTotalIncome(incomeSum);
        setTotalExpense(expenseSum);
        setBalance(incomeSum - expenseSum);
      } catch (err) {
        console.error('Erro ao carregar dados financeiros:', err);
      }
    };

    fetchData();
  }, [userId, filter]);

  return (
    <div className="summary-card">
      <header className="summary-header">
        <h3>Resumo</h3>
        <select
          className="filter-dropdown"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="monthly">Últimos 30 dias</option>
          <option value="semiannual">Semestral</option>
          <option value="annual">Anual</option>
        </select>
      </header>

      <div className="summary-balance">
        <p>Balanço Geral em R$</p>
        <div className={`balance-value ${balance >= 0 ? 'positive' : 'negative'}`}>
          {balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </div>
      </div>

      <div className="summary-stats">
        <div className="stat-item income">
          <ArrowUp size={16} />
          <small>Receita:</small>
          <strong>
            {totalIncome.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </strong>
        </div>
        <div className="stat-item expense">
          <ArrowDown size={16} />
          <small>Despesa:</small>
          <strong>
            {totalExpense.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </strong>
        </div>
      </div>
    </div>
  );
};

/**
 * COMPONENTE AUXILIAR: Gráfico de Barras (com eixo Y em %)
 */
const BarChart = ({ data }) => {
  const maxValue = data.reduce((max, item) => Math.max(max, item.income, item.expense), 0);
  const yAxisLevels = [100, 50, 0]; // Eixo Y fixo em porcentagem

  const getBarHeight = (value) => (maxValue > 0 ? (value / maxValue) * 100 : 0);

  return (
    <div className="bar-chart-container">
      <div className="y-axis">
        {yAxisLevels.map((level, i) => (
          <span key={i}>{level}%</span>
        ))}
      </div>

      <div className="chart-bars">
        {data.map((item, index) => (
          <div key={index} className="bar-group">
            <div
              className="bar income-bar"
              style={{ height: `${getBarHeight(item.income)}%` }}
            />
            <div
              className="bar expense-bar"
              style={{ height: `${getBarHeight(item.expense)}%` }}
            />
            <div className="bar-label">{item.month}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * COMPONENTE 2: GRÁFICO RECEITA VS DESPESA
 */
export const IncomeExpenseChart = () => {
  const [chartData, setChartData] = useState([]);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [incomeRes, expenseRes] = await Promise.all([
          fetch(`http://localhost:8080/piglet/api/users/${userId}/incomes`),
          fetch(`http://localhost:8080/piglet/api/users/${userId}/expenses`),
        ]);

        const incomeData = incomeRes.ok ? await incomeRes.json() : [];
        const expenseData = expenseRes.ok ? await expenseRes.json() : [];

        const orderedMonths = [
          { label: 'jan', index: 0 },
          { label: 'fev', index: 1 },
          { label: 'mar', index: 2 },
          { label: 'abr', index: 3 },
          { label: 'mai', index: 4 },
          { label: 'jun', index: 5 },
          { label: 'jul', index: 6 },
          { label: 'ago', index: 7 },
          { label: 'set', index: 8 },
          { label: 'out', index: 9 },
          { label: 'nov', index: 10 },
          { label: 'dez', index: 11 },
        ];

        const grouped = {};
        orderedMonths.forEach((m) => {
          grouped[m.label] = { month: m.label, income: 0, expense: 0 };
        });

        incomeData.forEach((inc) => {
          const date = parseLocalDate(inc.incomeDate || inc.date);
          if (!isNaN(date)) {
            const monthLabel = orderedMonths[date.getMonth()].label;
            grouped[monthLabel].income += parseFloat(inc.value || 0);
          }
        });

        expenseData.forEach((exp) => {
          const date = parseLocalDate(exp.expenseDate || exp.date);
          if (!isNaN(date)) {
            const monthLabel = orderedMonths[date.getMonth()].label;
            grouped[monthLabel].expense += parseFloat(exp.value || 0);
          }
        });

        const chartArr = orderedMonths.map((m) => grouped[m.label]);
        setChartData(chartArr);
      } catch (err) {
        console.error('Erro ao gerar gráfico:', err);
      }
    };

    fetchData();
  }, [userId]);

  return (
    <div className="chart-card">
      <header className="chart-header">
        <h3>Receita vs Despesa</h3>
        <BarChart3 size={20} color="#555" />
      </header>
      <BarChart data={chartData} />
    </div>
  );
};

/**
 * COMPONENTE 3: ATIVIDADE RECENTE
 */
export const RecentActivityPlaceholder = () => {
  const [activities, setActivities] = useState([]);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const [incomeRes, expenseRes] = await Promise.all([
          fetch(`http://localhost:8080/piglet/api/users/${userId}/incomes`),
          fetch(`http://localhost:8080/piglet/api/users/${userId}/expenses`),
        ]);

        const incomeData = incomeRes.ok ? await incomeRes.json() : [];
        const expenseData = expenseRes.ok ? await expenseRes.json() : [];

        const formattedIncomes = incomeData.map((i) => ({
          id: i.id,
          type: 'income',
          description: i.description || 'Receita',
          value: parseFloat(i.value || 0),
          date: i.incomeDate || i.date,
        }));

        const formattedExpenses = expenseData.map((e) => ({
          id: e.id,
          type: 'expense',
          description: e.description || 'Despesa',
          value: parseFloat(e.value || 0),
          date: e.expenseDate || e.date,
        }));

        const allActivities = [...formattedIncomes, ...formattedExpenses].sort(
          (a, b) => parseLocalDate(b.date) - parseLocalDate(a.date)
        );

        setActivities(allActivities);
      } catch (err) {
        console.error('Erro ao carregar atividades:', err);
      }
    };

    fetchActivities();
  }, [userId]);

  return (
    <div className="activity-card">
      <h3>Atividade Recente</h3>
      {activities.length === 0 ? (
        <p className="no-activity">Nenhuma movimentação recente encontrada.</p>
      ) : (
        <ul className="activity-list">
          {activities.slice(0, 10).map((item) => (
            <li key={item.id} className={`activity-item ${item.type}`}>
              <div className="activity-icon">
                {item.type === 'income' ? (
                  <ArrowUp size={18} color="#00b341" />
                ) : (
                  <ArrowDown size={18} color="#d93025" />
                )}
              </div>
              <div className="activity-content">
                <span className="activity-desc">{item.description}</span>
                <span className="activity-date">
                  {parseLocalDate(item.date).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <div
                className={`activity-value ${
                  item.type === 'income' ? 'positive' : 'negative'
                }`}
              >
                {item.value.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
