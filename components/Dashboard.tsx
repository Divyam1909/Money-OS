
import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { MOCK_AUTOPILOT_LOGS } from '../constants';
import { TrendingUp, Zap, Users, Clock } from 'lucide-react';
import { Transaction, Budget } from '../types';

interface DashboardProps {
    transactions: Transaction[];
    budgets: Budget[];
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, budgets }) => {
  // Calculate total health
  const totalLimit = budgets.reduce((acc, b) => acc + b.limit, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + b.spent, 0);
  // Avoid divide by zero
  const healthPercentage = totalLimit > 0 ? Math.round(((totalLimit - totalSpent) / totalLimit) * 100) : 100;

  // Generate chart data from real transactions
  const processChartData = () => {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const data = days.map(d => ({ name: d, spend: 0 }));
      
      const last7Days = new Date();
      last7Days.setDate(last7Days.getDate() - 7);

      transactions.forEach(t => {
          const tDate = new Date(t.date);
          if (tDate > last7Days) {
              const dayIndex = tDate.getDay();
              data[dayIndex].spend += t.amount;
          }
      });
      return data;
  };

  const chartData = processChartData();

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
          <p className="text-xs text-gray-500 mt-2">
              {totalSpent} spent of {totalLimit} limit.
          </p>
        </div>

        {/* Upcoming Bills (Placeholder logic until Recurring is integrated fully into dashboard) */}
        <div className="bg-surface border border-gray-700 rounded-2xl p-6">
            <h3 className="text-gray-400 text-sm font-semibold mb-4">UPCOMING BILLS</h3>
            <div className="space-y-3">
                 <div className="text-gray-500 text-sm text-center py-4">
                    Check Settings for Recurring Expenses
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
                <p className="text-sm text-gray-400">Manage group expenses in the Groups tab.</p>
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
                <p className="text-sm text-gray-400">Analyze subscriptions in Time-Value tab.</p>
            </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-surface border border-gray-700 rounded-2xl p-6">
        <h3 className="text-gray-400 text-sm font-semibold mb-6">SPENDING TREND (LAST 7 DAYS)</h3>
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
