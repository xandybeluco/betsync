import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Layers, 
  Calculator, 
  TrendingUp, 
  Wallet, 
  History,
  Moon,
  Sun
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Layout = () => {
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();

  const navigation = [
    { name: 'Painel', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Registro de Apostas', href: '/bet-registration', icon: PlusCircle },
    { name: 'Operações', href: '/operations', icon: Layers },
    { name: 'Calculadora de Arbitragem', href: '/arbitrage-calculator', icon: Calculator },
    { name: 'Calculadora de Exchange', href: '/exchange-calculator', icon: TrendingUp },
    { name: 'Calculadora de Odds Boost', href: '/odds-boost-calculator', icon: TrendingUp },
    { name: 'Casas de Apostas', href: '/bookmakers', icon: Wallet },
    { name: 'Histórico', href: '/history', icon: History },
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">BetSync</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Apostas Esportivas</p>
          </div>

          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-3 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={toggleTheme}
              type="button"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              {isDark ? 'Modo Claro' : 'Modo Escuro'}
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 overflow-auto">
        <main className="p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
