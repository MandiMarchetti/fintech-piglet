import React, { useState } from 'react';
import { ChevronDown, BarChart2, DollarSign, TrendingUp, RefreshCcw, MoreHorizontal, Download, Plus, Calendar, Filter } from 'lucide-react'; 
import './IncomeComponents.css'; 

// --- DADOS MOCADOS ---
const mockSummaryData = [
    { category: 'Salário', percentage: 25, total: 15000 },
    { category: 'Investimento', percentage: 25, total: 15000 },
    { category: 'Retornos', percentage: 25, total: 15000 },
    { category: 'Outros', percentage: 25, total: 15000 },
];

const mockRecentIncomes = [
    { id: 1, value: 3000.00, isExpense: false, date: '25/10/2025', category: 'Salário', description: 'Pagamento mensal (Outubro)' },
    { id: 2, value: 500.50, isExpense: false, date: '20/10/2025', category: 'Investimento', description: 'Dividendos de Ações' },
    { id: 3, value: 150.00, isExpense: false, date: '15/10/2025', category: 'Outros', description: 'Venda de item usado' },
    { id: 4, value: 1000.00, isExpense: false, date: '05/10/2025', category: 'Retornos', description: 'Reembolso de despesa' },
    { id: 5, value: 4500.00, isExpense: false, date: '25/09/2025', category: 'Salário', description: 'Pagamento mensal (Setembro)' },
];

// Mapeamento de Ícones e Cores por Categoria
const CategoryIcons = {
    'Salário': { icon: DollarSign, color: '#3498db' },
    'Investimento': { icon: TrendingUp, color: '#2ecc71' },
    'Retornos': { icon: RefreshCcw, color: '#f39c12' },
    'Outros': { icon: MoreHorizontal, color: '#95a5a6' },
};
// -----------------------------------------------------------------


/**
 * Subcomponente: Gráfico de Barras Horizontais da Distribuição de Receita
 */
const HorizontalBarChart = ({ data }) => (
    <div className="horizontal-chart-area">
        {data.map((item, index) => (
            <div key={index} className="horizontal-bar-item">
                <div className="category-label">
                    {item.category}
                </div>
                <div className="bar-wrapper">
                    <div 
                        className="horizontal-bar"
                        style={{ width: `${item.percentage}%` }}
                    >
                    </div>
                </div>
                <div className="percentage-label">{item.percentage}%</div>
            </div>
        ))}
    </div>
);


/**
 * Componente 1: Resumo da Receita (Income Summary)
 */
export const IncomeSummary = ({ totalIncome = 60000.00 }) => {
    const [filter, setFilter] = useState('monthly');

    return (
        <div className="income-summary-card">
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
            
            <div className="total-income-value">
                <p>Valor total em Receita (R$)</p>
                <strong>{totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
            </div>

            <HorizontalBarChart data={mockSummaryData} />
        </div>
    );
};

// Placeholder para o Modal de Adição/Edição
const IncomeModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3 className='modal-title'>Adicionar Nova Receita</h3>
                <form className='modal-form'>
                    <input type="text" placeholder="Descrição (Ex: Salário)" required />
                    <input type="number" placeholder="Valor (R$)" required />
                    <input type="date" required />
                    <select required>
                        <option value="">Selecione a Categoria</option>
                        {Object.keys(CategoryIcons).map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <button type="submit" className="modal-submit-button">Salvar Receita</button>
                </form>
                <button className="modal-close-button" onClick={onClose}>Fechar</button>
            </div>
        </div>
    );
};

// Placeholder para o Modal de Filtro
const FilterModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3 className='modal-title'>Filtrar Receitas</h3>
                <form className='modal-form'>
                    <label>Valor Mínimo</label>
                    <input type="number" placeholder="R$ 0,00" />
                    <label>Valor Máximo</label>
                    <input type="number" placeholder="R$ 10.000,00" />
                    <label>Data De:</label>
                    <input type="date" />
                    <label>Data Até:</label>
                    <input type="date" />
                    <label>Categoria</label>
                    <select>
                        <option value="">Todas as Categorias</option>
                        {Object.keys(CategoryIcons).map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <button type="submit" className="modal-submit-button">Aplicar Filtro</button>
                </form>
                <button className="modal-close-button" onClick={onClose}>Fechar</button>
            </div>
        </div>
    );
};


/**
 * Componente 2: Histórico de Receitas Recentes (Recent Incomes)
 */
export const RecentIncomes = ({ data = mockRecentIncomes }) => {
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    // Lógica para selecionar/desselecionar todos
    const handleSelectAll = (e) => {
        const isChecked = e.target.checked;
        setSelectAll(isChecked);
        if (isChecked) {
            setSelectedItems(data.map(item => item.id));
        } else {
            setSelectedItems([]);
        }
    };

    // Lógica para selecionar/desselecionar um item
    const handleSelectItem = (id) => {
        const newSelectedItems = selectedItems.includes(id) 
            ? selectedItems.filter(itemId => itemId !== id)
            : [...selectedItems, id];
        
        setSelectedItems(newSelectedItems);
        // Atualiza o selectAll se todos os itens foram selecionados ou não
        setSelectAll(newSelectedItems.length === data.length);
    };

    const isExportButtonVisible = selectedItems.length > 0;

    return (
        <div className="recent-incomes-card">
            <header className="incomes-header">
                <div className="header-left">
                    <input 
                        type="checkbox" 
                        checked={selectAll && data.length > 0} 
                        onChange={handleSelectAll} 
                        className="select-all-checkbox"
                        disabled={data.length === 0}
                    />
                    <h3>Histórico</h3>
                </div>
                <div className="filter-controls">
                    {/* Botão de Filtro que abre o modal */}
                    <button 
                        className="filter-button"
                        onClick={() => setIsFilterModalOpen(true)}
                    >
                        <Filter size={16} /> Filtro Detalhado
                    </button>
                </div>
            </header>

            {/* Tabela/Lista de Receitas */}
            <div className="incomes-list-container">
                <div className="list-header">
                    <span className="col-checkbox"></span> {/* Coluna vazia para checkbox */}
                    <span className="col-value">Valor</span>
                    <span className="col-date">Data</span>
                    <span className="col-category">Categoria</span>
                    <span className="col-description">Descrição</span>
                </div>

                <div className="list-body">
                    {data.map(item => {
                        const isSelected = selectedItems.includes(item.id);
                        const { icon: Icon, color } = CategoryIcons[item.category] || { icon: DollarSign, color: '#333' };
                        
                        // Determina a classe de cor (verde para receita)
                        const valueClass = item.isExpense ? 'value-expense' : 'value-income';

                        return (
                            <div key={item.id} className={`list-item ${isSelected ? 'selected' : ''}`}>
                                <div className="col-checkbox">
                                    <input 
                                        type="checkbox" 
                                        checked={isSelected} 
                                        onChange={() => handleSelectItem(item.id)}
                                    />
                                </div>
                                {/* O valor é sempre verde para Receitas */}
                                <div className={`col-value ${valueClass}`}>
                                    {item.isExpense ? '- ' : '+ '} R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </div>
                                <div className="col-date">{item.date}</div>
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

            {/* Botão de Exportar (Visível condicionalmente) */}
            {isExportButtonVisible && (
                <div className="export-action-bar">
                    <button className="export-button">
                        <Download size={18} /> Exportar para PDF ({selectedItems.length})
                    </button>
                </div>
            )}

            {/* Botão de Adicionar (Float) */}
            <button 
                className="add-income-fab" 
                title="Adicionar Receita"
                onClick={() => setIsAddModalOpen(true)}
            >
                <Plus size={24} color="white" />
            </button>

            {/* Modais */}
            <IncomeModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
            <FilterModal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} />
        </div>
    );
};