
import React from 'react';
import { LayoutDashboard, Wallet, PieChart, Users, Clock, Settings, Target, BrainCircuit, LogOut } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Mission Control', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions & Firewall', icon: Wallet },
    { id: 'budgets', label: 'ShiftBudget', icon: PieChart },
    { id: 'groups', label: 'SmartSplit', icon: Users },
    { id: 'timevalue', label: 'Time-Value Analysis', icon: Clock },
    { id: 'goals', label: 'Goals & Planning', icon: Target },
    { id: 'insights', label: 'System Insights', icon: BrainCircuit },
  ];

  return (
    <div className="w-64 bg-surface h-screen border-r border-gray-700 flex flex-col hidden md:flex sticky top-0">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          MoneyOS
        </h1>
        <p className="text-xs text-gray-400 mt-1">AI Financial Operating System</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-primary/20 text-primary border border-primary/20' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-700 space-y-2">
        <button 
            onClick={() => setCurrentView('settings')}
            className={`flex items-center space-x-3 px-4 py-3 w-full rounded-xl hover:bg-gray-800 transition-all ${
                currentView === 'settings' ? 'text-primary bg-primary/20 border border-primary/20' : 'text-gray-400 hover:text-white'
            }`}
        >
            <Settings size={20} />
            <span className="text-sm">Settings</span>
        </button>
        <button 
            onClick={onLogout}
            className="flex items-center space-x-3 px-4 py-3 text-danger hover:text-red-400 w-full rounded-xl hover:bg-danger/10 transition-all"
        >
            <LogOut size={20} />
            <span className="text-sm font-bold">Log Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
