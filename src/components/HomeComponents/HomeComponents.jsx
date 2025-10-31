import React, { useState } from 'react';
// Ícones necessários para Resumo e Gráfico
import { ArrowDown, ArrowUp, BarChart3 } from 'lucide-react'; 
import './HomeComponents.css'; 

// --- DADOS MOCADOS PARA O GRÁFICO ---
const mockChartData = [
    { month: 'Jan', income: 8000, expense: 5500 },
    { month: 'Fev', income: 10500, expense: 6500 },
    { month: 'Mar', income: 9000, expense: 4000 },
    { month: 'Abr', income: 6000, expense: 7000 },
    { month: 'Mai', income: 9500, expense: 4500 },
    { month: 'Jun', income: 8500, expense: 5500 },
];
// -----------------------------------------------------------------

/**
 * Componente 1: Resumo do Balanço Geral (Balance Summary)
 */
export const BalanceSummary = ({ totalBalance = 'R$ 5.432,10' }) => {
    const [filter, setFilter] = useState('monthly');

    return (
        <div className="summary-card">
            <header className="summary-header">
                <h3>Resumo</h3>
                <select 
                    className="filter-dropdown" 
                    value={filter} 
                    onChange={(e) => setFilter(e.target.value)}
                >
                    <option value="monthly">Último Mês</option>
                    <option value="semiannual">Semestral</option>
                    <option value="annual">Anual</option>
                </select>
            </header>
            <div className="summary-balance">
                <p>Balanço Geral em R$</p>
                <div className="balance-value">
                    {totalBalance}
                </div>
            </div>
            <div className="summary-stats">
                <div className="stat-item income">
                    <ArrowUp size={16} />
                    <small>Receita:</small>
                    <strong>R$ 15.000,00</strong>
                </div>
                <div className="stat-item expense">
                    <ArrowDown size={16} />
                    <small>Despesa:</small>
                    <strong>R$ 9.567,90</strong>
                </div>
            </div>
        </div>
    );
};

// -----------------------------------------------------------------

/**
 * Componente Auxiliar: Gráfico de Barras (Simulado)
 */
const BarChart = ({ data }) => {
    // Encontra o valor máximo para normalizar as alturas das barras
    const maxValue = data.reduce((max, item) => Math.max(max, item.income, item.expense), 0);
    // Define alguns níveis para o eixo Y (ex: 0, 50%, 100% do máximo)
    const yAxisLevels = [maxValue, maxValue / 2, 0];

    return (
        <div className="bar-chart-container">
            {/* Eixo Y (Valores) */}
            <div className="y-axis">
                {yAxisLevels.map((level, index) => (
                    <span key={index}>
                        R$ {level.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                    </span>
                ))}
            </div>
            
            {/* Barras */}
            <div className="chart-bars">
                {data.map((item, index) => (
                    <div 
                        key={index} 
                        className="bar-group" 
                        title={`Receita: R$ ${item.income.toLocaleString('pt-BR')} | Despesa: R$ ${item.expense.toLocaleString('pt-BR')}`}
                    >
                        {/* Barra de Receita */}
                        <div
                            className="bar income-bar"
                            // Calcula a altura como percentagem do valor máximo
                            style={{ height: `${maxValue > 0 ? (item.income / maxValue) * 100 : 0}%` }} 
                        />
                        {/* Barra de Despesa */}
                        <div
                            className="bar expense-bar"
                            style={{ height: `${maxValue > 0 ? (item.expense / maxValue) * 100 : 0}%` }}
                        />
                        {/* Etiqueta do Mês (Eixo X) */}
                        <div className="bar-label">{item.month}</div>
                    </div>
                ))}
            </div>
            
            {/* Legenda (Opcional, pode ser adicionada se necessário) */}
            <div className="chart-legend">
                <div className="legend-item">
                    <span className="legend-color income-color"></span> Receita
                </div>
                <div className="legend-item">
                    <span className="legend-color expense-color"></span> Despesa
                </div>
            </div>
        </div>
    );
};

/**
 * Componente 2: Gráfico Receita x Despesa (Income vs Expense Chart)
 */
export const IncomeExpenseChart = () => {
    return (
        <div className="chart-card">
            <header className="chart-header">
                <h3>Receita vs Despesa</h3> 
                <BarChart3 size={20} color="#555" /> 
            </header>
            {/* Renderiza o componente de gráfico com os dados */}
            <BarChart data={mockChartData} />
        </div>
    );
};

// -----------------------------------------------------------------
// Placeholder para o Componente 3 (Atividade Recente) - Será adicionado depois
export const RecentActivityPlaceholder = () => (
    <div className="activity-card placeholder-card"> 
        <h3>Atividade Recente</h3>
        <p style={{color: '#999', fontSize: '0.9em', textAlign: 'center', flexGrow: 1}}>
            Lista de atividades será reconstruída aqui.
        </p>
    </div>
);