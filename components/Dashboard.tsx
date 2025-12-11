import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { MOCK_AUTOPILOT_LOGS, INITIAL_BUDGETS } from '../constants';
import { TrendingUp, Zap, Users, Clock } from 'lucide-react';

const Dashboard: React.FC = () => {
  // Calculate total health
  const totalLimit = INITIAL_BUDGETS.reduce((acc, b) => acc + b.limit, 0);
  const totalSpent = INITIAL_BUDGETS.reduce((acc, b) => acc + b.spent, 0);
  const healthPercentage = Math.round(((totalLimit - totalSpent) / totalLimit) * 100);

  const chartData = [
    { name: 'Mon', spend: 1200 },
    { name: 'Tue', spend: 900 },
    { name: 'Wed', spend: 2400 },
    { name: 'Thu', spend: 1500 },
    { name: 'Fri', spend: 3200 },
    { name: 'Sat', spend: 4500 },
    { name: 'Sun', spend: 2100 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Health Meter */}
        <div className="bg-surface border border-gray-700 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <TrendingUp size={100} />
          </div>
          <h3 className="text-gray-400 text-sm font-semibold mb-2">SAVINGS HEALTH</h3>
          <div className="flex items-baseline space-x-2">
            <span className={`text-4xl font-bold ${healthPercentage > 30 ? 'text-success' : 'text-danger'}`}>
              {healthPercentage}%
            </span>
            <span className="text-gray-400">budget remaining</span>
          </div>
          <div className="w-full bg-gray-700 h-2 rounded-full mt-4">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${healthPercentage > 30 ? 'bg-success' : 'bg-danger'}`} 
              style={{ width: `${healthPercentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Projected to save ₹4,500 this month.</p>
        </div>

        {/* Upcoming Bills */}
        <div className="bg-surface border border-gray-700 rounded-2xl p-6">
            <h3 className="text-gray-400 text-sm font-semibold mb-4">UPCOMING BILLS</h3>
            <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-warning"></div>
                        <span>Rent</span>
                    </div>
                    <span className="font-mono">₹12,000</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        <span>Internet</span>
                    </div>
                    <span className="font-mono">₹999</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-accent"></div>
                        <span>Netflix</span>
                    </div>
                    <span className="font-mono">₹649</span>
                </div>
            </div>
        </div>

        {/* Autopilot Actions */}
        <div className="bg-surface border border-gray-700 rounded-2xl p-6">
          <h3 className="text-gray-400 text-sm font-semibold mb-4 flex items-center space-x-2">
            <Zap size={16} className="text-warning" />
            <span>AUTOPILOT LOG</span>
          </h3>
          <div className="space-y-4">
            {MOCK_AUTOPILOT_LOGS.map((log) => (
              <div key={log.id} className="text-sm">
                <p className="text-white font-medium">{log.action}</p>
                <p className="text-gray-500 text-xs">{log.reason}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Secondary Row for Checklists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SmartSplit Summary */}
        <div className="bg-surface border border-gray-700 rounded-2xl p-6 flex items-center justify-between">
            <div>
                <h3 className="text-gray-400 text-sm font-semibold mb-1 flex items-center gap-2">
                    <Users size={16} className="text-primary" />
                    GROUP DEBT
                </h3>
                <p className="text-2xl font-bold text-white">₹1,250</p>
                <p className="text-xs text-gray-500">You are owed by 2 people</p>
            </div>
            <div className="text-right">
                <button className="text-primary text-sm font-bold hover:underline">View Groups</button>
            </div>
        </div>

        {/* Time-Value Score */}
        <div className="bg-surface border border-gray-700 rounded-2xl p-6 flex items-center justify-between">
            <div>
                 <h3 className="text-gray-400 text-sm font-semibold mb-1 flex items-center gap-2">
                    <Clock size={16} className="text-accent" />
                    EFFICIENCY SCORE
                </h3>
                <p className="text-2xl font-bold text-white">78/100</p>
                <p className="text-xs text-gray-500">2 subscriptions marked 'low value'</p>
            </div>
             <div className="w-16 h-16 rounded-full border-4 border-accent/30 flex items-center justify-center">
                 <span className="text-accent font-bold">B+</span>
             </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-surface border border-gray-700 rounded-2xl p-6">
        <h3 className="text-gray-400 text-sm font-semibold mb-6">SPENDING TREND</h3>
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
                <defs>
                <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                    itemStyle={{ color: '#3b82f6' }}
                />
                <Area type="monotone" dataKey="spend" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSpend)" />
            </AreaChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;