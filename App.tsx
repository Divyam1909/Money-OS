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
import { Menu, LogOut, Loader, RefreshCw, Bell, X, ArrowRight, Lightbulb, AlertCircle } from 'lucide-react';
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

  // Notification State
  const [showNotifications, setShowNotifications] = useState(false);

  // 🆕 STEALTH MODE STATE
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);

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
    setShowNotifications(false);
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

  // 🔔 SMART NOTIFICATION GENERATOR
  const getNotifications = () => {
    const alerts = [];

    // 1. Goal Check
    if (goals.length === 0) {
        alerts.push({
            id: 'no-goals',
            title: 'No Financial Targets Set',
            msg: 'MoneyOS works best when you have a target. Set a goal for a vacation or gadget.',
            type: 'tip',
            action: 'goals',
            actionLabel: 'Create Goal'
        });
    }

    // 2. Uncategorized Transactions
    const uncategorizedCount = transactions.filter(t => t.category === 'Uncategorized').length;
    if (uncategorizedCount > 5) {
        alerts.push({
            id: 'messy-data',
            title: `${uncategorizedCount} Unsorted Transactions`,
            msg: 'Your analytics will be inaccurate. Use the AI Rule Engine to sort them automatically.',
            type: 'warning',
            action: 'settings',
            actionLabel: 'Fix Rules'
        });
    }

    // 3. Low Savings Health
    if (userSettings?.monthlyIncome) {
        const totalLimit = budgets.reduce((acc, b) => acc + b.limit, 0);
        const savingsRate = ((userSettings.monthlyIncome - totalLimit) / userSettings.monthlyIncome) * 100;
        if (savingsRate < 10) {
            alerts.push({
                id: 'low-savings',
                title: 'High Risk Budgeting',
                msg: `You are spending ${100 - Math.round(savingsRate)}% of your income. Consider using ShiftBudget to trim costs.`,
                type: 'alert',
                action: 'budgets',
                actionLabel: 'Trim Budget'
            });
        }
    }

    // 4. Feature Discovery
    alerts.push({
        id: 'discovery',
        title: 'Analyze Your Subscriptions',
        msg: 'Have you checked if your Netflix subscription is worth your time? Try the Time-Value analyzer.',
        type: 'info',
        action: 'timevalue',
        actionLabel: 'Check ROI'
    });

    return alerts;
  };

  const notifications = getNotifications();
  const unreadCount = notifications.length;

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
      // 👇 PASS PRIVACY PROP TO DASHBOARD
      case 'dashboard': return <Dashboard transactions={transactions} budgets={budgets} userSettings={userSettings} isPrivacy={isPrivacyMode} />;
      
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
      
      // Default to Dashboard with Privacy Prop
      default: return <Dashboard transactions={transactions} budgets={budgets} userSettings={userSettings} isPrivacy={isPrivacyMode} />;
    }
  };

  if (!isLoggedIn) return <Auth onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-background text-gray-100 font-sans flex overflow-hidden">
      {/* 👇 PASS PROPS TO SIDEBAR FOR TOGGLE */}
      <Sidebar 
        currentView={currentView} 
        setCurrentView={handleNavigate} 
        onLogout={handleLogout} 
        isPrivacy={isPrivacyMode}
        togglePrivacy={() => setIsPrivacyMode(!isPrivacyMode)}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-surface border-b border-gray-700">
            <h1 className="text-xl font-bold text-primary flex items-center gap-2">
               <span className="text-gray-500 font-mono">#</span> MoneyOS
            </h1>
            <div className="flex items-center gap-3">
                <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 text-gray-400">
                    <Bell size={20} />
                    {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full"></span>}
                </button>
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
            {/* Header Area: Live Indicator & Notifications */}
            <div className="fixed top-4 right-4 z-[100] flex items-center gap-3">
                
                {/* 1. Live Indicator */}
                <div className={`hidden md:flex transition-all duration-500 items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-bold tracking-widest ${
                    isRefreshing ? 'bg-primary/20 border-primary text-primary opacity-100' : 'bg-gray-800/20 border-gray-700 text-gray-500 opacity-50'
                }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${isRefreshing ? 'bg-primary animate-pulse' : 'bg-gray-600'}`}></div>
                    {isRefreshing ? 'SYNCING...' : 'SYSTEM LIVE'}
                </div>

                {/* 2. Notification Bell (Desktop) */}
                <div className="relative hidden md:block">
                    <button 
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`p-2 rounded-full border transition-all ${
                            showNotifications 
                            ? 'bg-gray-700 border-gray-500 text-white' 
                            : 'bg-surface border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'
                        }`}
                    >
                        <Bell size={18} />
                        {unreadCount > 0 && (
                            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-danger rounded-full border-2 border-background"></span>
                        )}
                    </button>

                    {/* Notification Dropdown */}
                    {showNotifications && (
                        <div className="absolute right-0 top-12 w-80 bg-surface border border-gray-700 rounded-2xl shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-sm text-gray-300 uppercase tracking-wider">Co-Pilot Updates</h3>
                                <button onClick={() => setShowNotifications(false)} className="text-gray-500 hover:text-white"><X size={14}/></button>
                            </div>
                            
                            <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
                                {notifications.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500 text-xs">
                                        <p>All systems nominal.</p>
                                    </div>
                                ) : (
                                    notifications.map((note) => (
                                        <div key={note.id} className="bg-background/50 border border-gray-700 p-3 rounded-xl hover:border-primary/30 transition-colors">
                                            <div className="flex gap-3">
                                                <div className="mt-1">
                                                    {note.type === 'alert' && <AlertCircle size={16} className="text-danger" />}
                                                    {note.type === 'warning' && <AlertCircle size={16} className="text-warning" />}
                                                    {note.type === 'tip' && <Lightbulb size={16} className="text-primary" />}
                                                    {note.type === 'info' && <Bell size={16} className="text-gray-400" />}
                                                </div>
                                                <div>
                                                    <h4 className={`text-sm font-bold mb-1 ${
                                                        note.type === 'alert' ? 'text-danger' : 
                                                        note.type === 'warning' ? 'text-warning' : 'text-white'
                                                    }`}>{note.title}</h4>
                                                    <p className="text-xs text-gray-400 leading-relaxed mb-2">{note.msg}</p>
                                                    {note.action && (
                                                        <button 
                                                            onClick={() => handleNavigate(note.action!)}
                                                            className="text-[10px] font-bold uppercase tracking-widest text-primary hover:text-blue-400 flex items-center gap-1"
                                                        >
                                                            {note.actionLabel} <ArrowRight size={10} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Notification Modal Overlay */}
            {showNotifications && (
                <div className="md:hidden fixed inset-0 z-[150] bg-black/80 backdrop-blur-sm flex items-end justify-center">
                    <div className="bg-surface w-full rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom">
                         <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg">Notifications</h3>
                            <button onClick={() => setShowNotifications(false)} className="bg-gray-800 p-2 rounded-full"><X size={20}/></button>
                        </div>
                        <div className="space-y-4">
                            {notifications.map((note) => (
                                <div key={note.id} className="bg-background border border-gray-700 p-4 rounded-xl">
                                    <div className="flex gap-3">
                                        <div className="mt-1">
                                            {note.type === 'alert' && <AlertCircle className="text-danger" />}
                                            {note.type === 'tip' && <Lightbulb className="text-primary" />}
                                            {note.type === 'warning' && <AlertCircle className="text-warning" />}
                                            {note.type === 'info' && <Bell className="text-gray-400" />}
                                        </div>
                                        <div>
                                            <h4 className="font-bold mb-1">{note.title}</h4>
                                            <p className="text-sm text-gray-400 mb-3">{note.msg}</p>
                                            {note.action && (
                                                <button 
                                                    onClick={() => handleNavigate(note.action!)}
                                                    className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-xs font-bold"
                                                >
                                                    {note.actionLabel}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;