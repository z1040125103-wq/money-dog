import React from 'react';
import { X, PieChart as PieIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { Transaction } from '../types';

interface PocketDetailProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  balance: number;
}

const COLORS = ['#f472b6', '#22c55e', '#a855f7', '#f59e0b', '#64748b'];

export const PocketDetail: React.FC<PocketDetailProps> = ({
  isOpen,
  onClose,
  transactions,
  balance
}) => {
  if (!isOpen) return null;

  // Filter expenses only
  const expenses = transactions.filter(t => t.type === 'withdraw' && t.sourceAccount === 'pocket');
  const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  // Aggregate by category
  const dataMap = new Map<string, number>();
  expenses.forEach(t => {
      const cat = t.category || '其他';
      dataMap.set(cat, (dataMap.get(cat) || 0) + t.amount);
  });

  const chartData = Array.from(dataMap.entries()).map(([name, value]) => ({ name, value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
        <div className="bg-pocket-50 p-6 border-b border-pocket-100 flex justify-between items-center">
          <div>
             <h2 className="text-xl font-bold text-pocket-700 flex items-center gap-2">
                <PieIcon size={20} /> 零用钱支出分析
             </h2>
             <p className="text-pocket-600 text-sm mt-1">当前余额: ¥{balance.toFixed(2)}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-pocket-200 rounded-full text-pocket-700 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
            {chartData.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                    还没花过钱呢，真棒！<br/>去记一笔支出看看分析吧。
                </div>
            ) : (
                <>
                    <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl mb-4 border border-slate-100">
                       <span className="text-sm font-bold text-slate-500 uppercase">累计总支出</span>
                       <span className="text-2xl font-extrabold text-slate-700">¥{totalExpense.toFixed(2)}</span>
                    </div>

                    <div className="h-64 w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {chartData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip 
                                    formatter={(value: number) => `¥${value.toFixed(2)}`}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-4 space-y-3">
                        <h4 className="font-bold text-slate-700 border-b pb-2">支出明细</h4>
                        <div className="max-h-40 overflow-y-auto">
                            {expenses.slice(0, 10).map(t => (
                                <div key={t.id} className="flex justify-between text-sm py-2 border-b border-slate-50 last:border-0">
                                    <div className="flex gap-2">
                                        <span className="text-slate-500">{new Date(t.date).toLocaleDateString()}</span>
                                        <span className="font-bold text-slate-700">{t.category}</span>
                                        <span className="text-slate-600 truncate max-w-[100px]">{t.note}</span>
                                    </div>
                                    <div className="font-bold text-red-500">-¥{t.amount.toFixed(2)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
      </div>
    </div>
  );
};
