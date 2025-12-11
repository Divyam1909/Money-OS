
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
import { Menu, LogOut, Loader } from 'lucide-react';
import { Transaction, Budget, Goal, UserProfile } from './types';
import { API_BASE_URL } from './constants';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  
  // App State
  const [loadingData, setLoadingData] = useState(false);
  const [userSettings, setUserSettings] = useState<UserProfile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  // Check for existing session
  useEffect(() => {
    const savedToken = localStorage.getItem('moneyos_token');
    if (savedToken) {
      setToken(savedToken);
      setIsLoggedIn(true);
      fetchData(savedToken);
    }
  }, []);

  const fetchData = async (authToken: string) => {
      setLoadingData(true);
      try {
          const res = await fetch(`${API_BASE_URL}/api/data`, {
              headers: { 'Authorization': authToken }
          });
          const data = await res.json();
          if (data.success) {
              setUserSettings(data.settings);
              setTransactions(data.transactions);
              setBudgets(data.budgets);
              setGoals(data.goals);
          }
      } catch (e) {
          console.error("Failed to load data", e);
      } finally {
          setLoadingData(false);
      }
  };

  const handleLogin = (newToken: string, username: string) => {
    localStorage.setItem('moneyos_token', newToken);
    localStorage.setItem('moneyos_username', username);
    setToken(newToken);
    setIsLoggedIn(true);
    fetchData(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('moneyos_token');
    localStorage.removeItem('moneyos_username');
    setToken(null);
    setIsLoggedIn(false);
    setUserSettings(null);
    setCurrentView('dashboard');
  };

  const refreshData = () => {
      if (token) fetchData(token);
  };

  const renderContent = () => {
    if (loadingData) return (
        <div className="flex h-full items-center justify-center">
            <Loader className="animate-spin text-primary" size={48} />
        </div>
    );

    if (!userSettings?.onboardingComplete) {
        return <Onboarding token={token!} onComplete={refreshData} />;
    }

    switch (currentView) {
      case 'dashboard': return <Dashboard transactions={transactions} budgets={budgets} />;
      case 'transactions': return <Transactions transactions={transactions} budgets={budgets} token={token!} onUpdate={refreshData} />;
      case 'budgets': return <Budgets budgets={budgets} transactions={transactions} token={token!} onUpdate={refreshData} />;
      case 'groups': return <SmartSplit />;
      case 'timevalue': return <TimeValue />;
      case 'goals': return <Goals goals={goals} budgets={budgets} token={token!} onUpdate={refreshData} />;
      case 'insights': return <Insights transactions={transactions} budgets={budgets} />;
      case 'settings': return <Settings />;
      default: return <Dashboard transactions={transactions} budgets={budgets} />;
    }
  };

  if (!isLoggedIn) {
    return <Auth onLogin={handleLogin} />;
  }

  // If we are logged in but still checking onboarding status
  if (!userSettings && loadingData) {
       return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <Loader className="animate-spin text-primary" size={48} />
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-gray-100 font-sans flex overflow-hidden">
      {/* Sidebar for Desktop */}
      {userSettings?.onboardingComplete && (
          <Sidebar currentView={currentView} setCurrentView={setCurrentView} onLogout={handleLogout} />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        {userSettings?.onboardingComplete && (
            <div className="md:hidden flex items-center justify-between p-4 bg-surface border-b border-gray-700">
                <h1 className="text-xl font-bold text-primary">MoneyOS</h1>
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
                    <Menu size={24} />
                </button>
            </div>
        )}

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && userSettings?.onboardingComplete && (
            <div className="md:hidden bg-surface border-b border-gray-700 absolute top-16 left-0 w-full z-50 shadow-xl">
                 <div className="flex flex-col p-2">
                    {['dashboard', 'transactions', 'budgets', 'groups', 'timevalue', 'goals', 'insights', 'settings'].map(view => (
                        <button 
                            key={view}
                            onClick={() => { setCurrentView(view); setMobileMenuOpen(false); }}
                            className={`p-3 text-left capitalize ${currentView === view ? 'text-primary font-bold' : 'text-gray-400'}`}
                        >
                            {view}
                        </button>
                    ))}
                    <button 
                        onClick={handleLogout}
                        className="p-3 text-left text-danger font-bold border-t border-gray-700 mt-2 flex items-center gap-2"
                    >
                        <LogOut size={16} /> Log Out
                    </button>
                 </div>
            </div>
        )}

        <main className="flex-1 overflow-auto p-4 md:p-8 relative">
            {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
