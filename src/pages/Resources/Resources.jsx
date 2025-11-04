import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Resources.css';
import { LayoutDashboard } from 'lucide-react';

import { BalanceSummary, IncomeExpenseChart, RecentActivityPlaceholder }
    from '../../components/HomeComponents/HomeComponents.jsx';

import { IncomeContainer }
    from '../../components/IncomeComponents/IncomeComponents.jsx';

import { ExpenseContainer }
    from '../../components/ExpenseComponents/ExpenseComponents.jsx';

import { InvestmentContainer }
    from '../../components/InvestmentComponents/InvestmentComponents.jsx';

import ProfileComponents
    from '../../components/ProfileComponents/ProfileComponents.jsx';

import PigletLogo from '../../assets/Logo_piglet.svg';
import Home from '../../assets/Home Tab.svg';
import revenue from '../../assets/banknote-arrow-up.svg';
import expense from '../../assets/banknote-arrow-down.svg';
import investment from '../../assets/Trending up.svg';
import Profile from '../../assets/Account Tab.svg';

const PigletLogoPath = ({ size = 28, color }) => (
    <img src={PigletLogo} alt="Logo" style={{ width: size, height: size }} />
);

const HomeIcon = ({ size = 28, color }) => (
    <img src={Home} alt="Home" style={{ width: size, height: size }} />
);

const IncomesIcon = ({ size = 28, color }) => (
    <img src={revenue} alt="Receita" style={{ width: size, height: size }} />
);

const ExpensesIcon = ({ size = 28, color }) => (
    <img src={expense} alt="Despesa" style={{ width: size, height: size }} />
);

const InvestmentsIcon = ({ size = 28, color }) => (
    <img src={investment} alt="Investimento" style={{ width: size, height: size }} />
);

const ProfileIcon = ({ size = 28, color }) => (
    <img src={Profile} alt="Perfil" style={{ width: size, height: size }} />
);
// -----------------------------------------------------------------

// Mapeamento das seções e seus ícones
const navItems = [
    { key: 'home', icon: HomeIcon, color: '#333', title: 'Início' },
    { key: 'incomes', icon: IncomesIcon, color: '#2ecc71', title: 'Receitas' },
    { key: 'expenses', icon: ExpensesIcon, color: '#e74c3c', title: 'Despesas' },
    { key: 'investments', icon: InvestmentsIcon, color: '#3498db', title: 'Investimentos' },
];

// Componente do Menu Lateral (Desktop - Icon Only)
const Sidebar = ({ activeSection, onNavigate }) => (
    <nav className="sidebar">
        <div className="sidebar-logo">
            <PigletLogoPath size={32} />
        </div>

        <div className="sidebar-main-nav">
            {navItems.map(item => (
                <button
                    key={item.key}
                    className={`nav-item ${activeSection === item.key ? 'active' : ''}`}
                    onClick={() => onNavigate(item.key)}
                    title={item.title}
                >
                    <item.icon color={activeSection === item.key ? '#FF594E' : item.color} />
                </button>
            ))}
        </div>

        <div className="sidebar-footer-nav">
            <button
                className={`nav-item ${activeSection === 'profile' ? 'active' : ''}`}
                onClick={() => onNavigate('profile')}
                title="Perfil"
            >
                <ProfileIcon color={activeSection === 'profile' ? '#FF594E' : '#555'} />
            </button>
        </div>
    </nav>
);

// Componente do Menu Inferior (Mobile - Icon Only)
const BottomNav = ({ activeSection, onNavigate }) => (
    <nav className="bottom-nav">
        {/* Todos os 5 itens (Home, Receitas, Despesas, Investimentos, Perfil) */}
        {[...navItems, { key: 'profile', icon: ProfileIcon, color: '#555' }].map(item => (
            <button
                key={item.key}
                className={`nav-item ${activeSection === item.key ? 'active' : ''}`}
                onClick={() => onNavigate(item.key)}
                title={item.title || 'Perfil'}
            >
                <item.icon
                    color={activeSection === item.key ? '#FF594E' : item.color}
                />
            </button>
        ))}
    </nav>
);


// Componente Principal de Renderização (Resources)
const Resources = () => {
    // GARANTINDO QUE ABRA NA TELA DE RECEITAS
    const [activeSection, setActiveSection] = useState('home');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    const navigate = useNavigate();

    useEffect(() => {
        const userId = localStorage.getItem('userId'); // verifica se o usuário está logado
        if (!userId) {
            navigate('/login'); // redireciona para a tela de login se não estiver logado
        }
    }, [navigate]);

    // Hook para escutar o redimensionamento da tela
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const renderContent = () => {
        switch (activeSection) {
            case 'home':
                return (
                    <div className="home-dashboard">
                        <BalanceSummary />
                        <IncomeExpenseChart />
                        <RecentActivityPlaceholder />
                    </div>
                );
            case 'incomes':
                return (
                    <div className="incomes-layout">
                        <IncomeContainer />
                    </div>
                );
            case 'expenses':
                return (
                    <div className="incomes-layout">
                        <ExpenseContainer />
                    </div>
                );
            case 'investments':
                return (
                    <div className="incomes-layout">
                        <InvestmentContainer />
                    </div>
                );
            case 'profile':
                return (
                    <div>
                        <ProfileComponents />
                    </div>
                );


            default:
                return (
                    <div className="main-content-placeholder">
                        <h2>Seção Desconhecida</h2>
                        <p>Navegação ativa: **{isMobile ? 'Mobile (BottomNav)' : 'Desktop (Sidebar)'}**.</p>
                    </div>
                );
        }
    };

    return (
        <div className="resources-layout">

            {/* 1. Navegação - Sidebar para Desktop */}
            {!isMobile && (
                <Sidebar
                    activeSection={activeSection}
                    onNavigate={setActiveSection}
                />
            )}

            {/* 2. Área de Conteúdo Principal */}
            <main className="main-area">
                {renderContent()}
            </main>

            {/* 3. Navegação - BottomNav para Mobile */}
            {isMobile && (
                <BottomNav
                    activeSection={activeSection}
                    onNavigate={setActiveSection}
                />
            )}

        </div>
    );
};

export default Resources;