import React from 'react';
import { LayoutDashboard, Receipt, PieChart, Users, Clock, Target, Zap, Settings, LogOut, Eye, EyeOff } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  onLogout: () => void;
  isPrivacy: boolean;          // 🆕 New Prop
  togglePrivacy: () => void;   // 🆕 New Prop
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, onLogout, isPrivacy, togglePrivacy }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Mission Control' },
    { id: 'transactions', icon: Receipt, label: 'Transactions' },
    { id: 'budgets', icon: PieChart, label: 'Budgets' },
    { id: 'groups', icon: Users, label: 'SmartSplit' },
    { id: 'timevalue', icon: Clock, label: 'Time-Value' },
    { id: 'goals', icon: Target, label: 'Goals' },
    { id: 'insights', icon: Zap, label: 'System Insights' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="hidden md:flex w-64 flex-col bg-surface border-r border-gray-700 h-screen p-4">
      <div className="mb-8 px-2 flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-tr from-primary to-accent rounded-lg flex items-center justify-center font-bold text-white">
          M
        </div>
        <h1 className="text-xl font-bold bg-gradient-to-r from-gray-100 to-gray-400 bg-clip-text text-transparent">
          MoneyOS
        </h1>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
              currentView === item.id 
                ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'
            }`}
          >
            <item.icon size={20} className={currentView === item.id ? 'text-primary' : 'text-gray-500 group-hover:text-gray-300'} />
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="pt-4 border-t border-gray-700 space-y-2">
        {/* 🕵️‍♂️ STEALTH MODE TOGGLE */}
        <button 
          onClick={togglePrivacy}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
             isPrivacy ? 'bg-accent/10 text-accent' : 'text-gray-400 hover:bg-gray-800'
          }`}
        >
          {isPrivacy ? <EyeOff size={20} /> : <Eye size={20} />}
          <span className="font-medium text-sm">
            {isPrivacy ? 'Stealth: ON' : 'Stealth: OFF'}
          </span>
        </button>

        <button 
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 text-gray-400 hover:text-danger hover:bg-danger/10 rounded-xl transition-all"
        >
          <LogOut size={20} />
          <span className="font-medium text-sm">Log Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;