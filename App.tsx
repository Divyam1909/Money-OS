
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Budgets from './components/Budgets';
import SmartSplit from './components/SmartSplit';
import TimeValue from './components/TimeValue';
import Goals from './components/Goals';
import Insights from './components/Insights';
import Settings from './components/Settings';
import Auth from './components/Auth';
import Onboarding from './components/Onboarding';
import { Menu, LogOut, Loader, RefreshCw } from 'lucide-react';
import { Transaction, Budget, Goal, UserProfile } from './types';
import { API_BASE_URL } from './constants';

const App: React.FC = () => {
  // Helper to get view from hash
  const getHashView = () => window.location.hash.replace('#', '') || 'dashboard';

  const [currentView, setCurrentView] = useState(getHashView());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  
  // App State
  const [loadingData, setLoadingData] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userSettings, setUserSettings] = useState<UserProfile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  // Sync state with URL hash
  useEffect(() => {
    const handleHashChange = () => {
      const view = getHashView();
      if (view !== currentView) {
        setCurrentView(view);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentView]);

  const handleNavigate = (view: string) => {
    window.location.hash = view;
    setCurrentView(view);
    setMobileMenuOpen(false);
  };

  // Session Check
  useEffect(() => {
    const savedToken = localStorage.getItem('moneyos_token');
    if (savedToken) {
      setToken(savedToken);
      setIsLoggedIn(true);
      fetchInitialData(savedToken);
    }
  }, []);

  // 🔄 Automated Background Refresh
  useEffect(() => {
    if (!isLoggedIn || !token) return;

    const interval = setInterval(() => {
        refreshDataQuietly(token);
    }, 30000);

    return () => clearInterval(interval);
  }, [isLoggedIn, token]);

  const fetchInitialData = async (authToken: string) => {
      setLoadingData(true);
      try {
          const res = await fetch(`${API_BASE_URL}/api/data`, {
              headers: { 'Authorization': `Bearer ${authToken}` }
          });
          const data = await res.json();
          if (data.success) {
              setUserSettings(data.settings);
              setTransactions(data.transactions);
              setBudgets(data.budgets);
              setGoals(data.goals || []);
          }
      } catch (e) {
          console.error("Fetch failed", e);
      } finally {
          setLoadingData(false);
      }
  };

  const refreshDataQuietly = async (authToken: string) => {
    setIsRefreshing(true);
    try {
        const res = await fetch(`${API_BASE_URL}/api/data`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data = await res.json();
        if (data.success) {
            setTransactions(data.transactions);
            setBudgets(data.budgets);
        }
    } catch (e) {
        console.error("Refresh failed", e);
    } finally {
        setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  const handleLogin = (newToken: string, username: string) => {
    localStorage.setItem('moneyos_token', newToken);
    localStorage.setItem('moneyos_username', username);
    setToken(newToken);
    setIsLoggedIn(true);
    fetchInitialData(newToken);
  };

  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
    setIsLoggedIn(false);
    window.location.hash = '';
    setCurrentView('dashboard');
  };

  const renderContent = () => {
    if (loadingData) return (
        <div className="flex h-full items-center justify-center">
            <Loader className="animate-spin text-primary" size={48} />
        </div>
    );

    if (!userSettings?.onboardingComplete) {
        return <Onboarding token={token!} onComplete={() => fetchInitialData(token!)} />;
    }

    const commonProps = { token: token!, onUpdate: () => fetchInitialData(token!) };

    switch (currentView) {
      case 'dashboard': return <Dashboard transactions={transactions} budgets={budgets} />;
      case 'transactions': return (
        <Transactions 
            transactions={transactions} 
            budgets={budgets} 
            {...commonProps}
            isSyncing={isRefreshing} 
            onManualSync={() => refreshDataQuietly(token!)} 
        />
      );
      case 'budgets': return <Budgets budgets={budgets} transactions={transactions} {...commonProps} />;
      case 'groups': return <SmartSplit />;
      case 'timevalue': return <TimeValue userSettings={userSettings} />;
      case 'goals': return <Goals goals={goals} budgets={budgets} {...commonProps} />;
      case 'insights': return <Insights transactions={transactions} budgets={budgets} />;
      case 'settings': return <Settings />;
      default: return <Dashboard transactions={transactions} budgets={budgets} />;
    }
  };

  if (!isLoggedIn) return <Auth onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-background text-gray-100 font-sans flex overflow-hidden">
      <Sidebar currentView={currentView} setCurrentView={handleNavigate} onLogout={handleLogout} />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-surface border-b border-gray-700">
            <h1 className="text-xl font-bold text-primary flex items-center gap-2">
               <span className="text-gray-500 font-mono">#</span> MoneyOS
            </h1>
            <div className="flex items-center gap-3">
                {isRefreshing && <RefreshCw size={16} className="animate-spin text-primary" />}
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2"><Menu size={24} /></button>
            </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
            <div className="md:hidden fixed inset-0 z-[200] bg-background p-6 flex flex-col animate-in slide-in-from-right duration-300">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-primary">Navigation</h2>
                    <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-gray-400">✕</button>
                </div>
                <nav className="flex-1 space-y-4">
                    {['dashboard', 'transactions', 'budgets', 'groups', 'timevalue', 'goals', 'insights', 'settings'].map((view) => (
                        <button
                            key={view}
                            onClick={() => handleNavigate(view)}
                            className={`w-full text-left px-4 py-3 rounded-xl text-lg font-bold capitalize ${
                                currentView === view ? 'bg-primary/20 text-primary border border-primary/20' : 'text-gray-400'
                            }`}
                        >
                            <span className="text-gray-600 font-mono mr-2">#</span>{view === 'dashboard' ? 'Mission Control' : view.replace('groups', 'SmartSplit').replace('timevalue', 'Time-Value')}
                        </button>
                    ))}
                </nav>
                <button 
                    onClick={handleLogout}
                    className="mt-8 flex items-center justify-center space-x-3 px-4 py-4 text-danger font-bold w-full rounded-xl bg-danger/10 border border-danger/20 transition-all"
                >
                    <LogOut size={20} />
                    <span>Log Out</span>
                </button>
            </div>
        )}

        <main className="flex-1 overflow-auto p-4 md:p-8 relative">
            {/* Live Indicator */}
            <div className={`fixed top-4 right-4 z-[100] transition-all duration-500 flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-bold tracking-widest ${
                isRefreshing ? 'bg-primary/20 border-primary text-primary opacity-100' : 'bg-gray-800/20 border-gray-700 text-gray-500 opacity-50'
            }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${isRefreshing ? 'bg-primary animate-pulse' : 'bg-gray-600'}`}></div>
                {isRefreshing ? 'SYNCING...' : 'SYSTEM LIVE'}
            </div>
            {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
