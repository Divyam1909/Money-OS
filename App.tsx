
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
import { Menu, LogOut } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // Check for existing session
  useEffect(() => {
    const savedToken = localStorage.getItem('moneyos_token');
    if (savedToken) {
      setToken(savedToken);
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (newToken: string, username: string) => {
    localStorage.setItem('moneyos_token', newToken);
    localStorage.setItem('moneyos_username', username);
    setToken(newToken);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('moneyos_token');
    localStorage.removeItem('moneyos_username');
    setToken(null);
    setIsLoggedIn(false);
    setCurrentView('dashboard');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'transactions': return <Transactions />;
      case 'budgets': return <Budgets />;
      case 'groups': return <SmartSplit />;
      case 'timevalue': return <TimeValue />;
      case 'goals': return <Goals />;
      case 'insights': return <Insights />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  if (!isLoggedIn) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-background text-gray-100 font-sans flex overflow-hidden">
      {/* Sidebar for Desktop */}
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} onLogout={handleLogout} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-surface border-b border-gray-700">
            <h1 className="text-xl font-bold text-primary">MoneyOS</h1>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
                <Menu size={24} />
            </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
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
