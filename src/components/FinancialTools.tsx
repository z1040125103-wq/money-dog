import React, { useState, useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calculator, TrendingUp, Zap, Coins } from 'lucide-react';

interface FinancialToolsProps {
  currentPrincipal: number;
}

export const FinancialTools: React.FC<FinancialToolsProps> = ({ currentPrincipal }) => {
  // Compound State
  const [principal, setPrincipal] = useState<number>(currentPrincipal);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(0);
  const [years, setYears] = useState<number>(10);
  const [rate, setRate] = useState<number>(8);

  // Sync principal when the actual account balance changes (e.g. on mount or update)
  useEffect(() => {
    setPrincipal(currentPrincipal);
  }, [currentPrincipal]);

  // Calculate 72 Rule automatically based on current rate
  const yearsToDouble = useMemo(() => {
    if (rate <= 0) return 0;
    return (72 / rate).toFixed(1);
  }, [rate]);

  // Calculate Final Amount for display
  const finalAmount = useMemo(() => {
      let balance = principal;
      const monthlyRate = rate / 100 / 12;
      for (let i = 0; i < years * 12; i++) {
          balance = (balance + monthlyContribution) * (1 + monthlyRate);
      }
      return Math.round(balance);
  }, [principal, monthlyContribution, years, rate]);

  const chartData = useMemo(() => {
    const data = [];
    let currentCompound = principal;
    let currentSimple = principal;
    const monthlyRate = rate / 100 / 12;

    for (let i = 0; i <= years; i++) {
      data.push({
        year: i,
        Simple: Math.round(currentSimple),
        Compound: Math.round(currentCompound),
      });

      // Calculate next year
      if (i < years) {
        currentSimple += monthlyContribution * 12; // Simple just adds contributions
        // Compound adds contributions + interest
        // FV = P * (1 + r)^n + PMT * (((1 + r)^n - 1) / r)
        // Iterative approach for graph points:
        for(let m=0; m<12; m++) {
            currentCompound = (currentCompound + monthlyContribution) * (1 + monthlyRate);
        }
      }
    }
    return data;
  }, [principal, monthlyContribution, years, rate]);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
      <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
        <TrendingUp className="text-indigo-600" size={24} />
        <h3 className="text-xl font-bold text-slate-800">复利计算器</h3>
      </div>

      <div className="space-y-6">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Inputs */}
              <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">初始本金 (¥)</label>
                    <input 
                      type="number" 
                      value={principal} 
                      onChange={(e) => setPrincipal(Number(e.target.value))}
                      className="w-full p-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 font-bold text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">每月追加 (¥)</label>
                    <input 
                      type="number" 
                      value={monthlyContribution} 
                      onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                      className="w-full p-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 font-bold text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">年收益率 (%)</label>
                    <input 
                      type="number" 
                      value={rate} 
                      onChange={(e) => setRate(Number(e.target.value))}
                      className="w-full p-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 font-bold text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">持续年数</label>
                    <input 
                      type="number" 
                      value={years} 
                      max={50}
                      onChange={(e) => setYears(Number(e.target.value))}
                      className="w-full p-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 font-bold text-slate-700"
                    />
                  </div>
              </div>

              {/* 72 Rule Card - Integrated */}
              <div className="flex flex-col gap-4">
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl p-5 text-white shadow-lg flex flex-col justify-center relative overflow-hidden flex-1">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Zap size={64} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2 opacity-90">
                            <Calculator size={16} />
                            <span className="text-xs font-bold uppercase tracking-wider">72法则 (资产翻倍)</span>
                        </div>
                        <div className="text-4xl font-extrabold mb-1">{yearsToDouble} <span className="text-lg">年</span></div>
                        <p className="text-xs text-indigo-100 leading-relaxed">
                            无需额外存钱，{yearsToDouble} 年后翻倍。
                        </p>
                    </div>
                </div>
                
                {/* Projected Result */}
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 text-amber-900 relative overflow-hidden">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 mb-1">
                        <Coins size={14} /> 复利威力
                    </div>
                    <div className="text-xs text-amber-800 mb-1">
                        {years} 年后，<span className="font-bold underline decoration-amber-300 decoration-2">金鹅价值</span>将达到：
                    </div>
                    <div className="text-2xl font-extrabold mb-1">
                        ¥{finalAmount.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-amber-600/80 font-bold bg-amber-100/50 inline-block px-2 py-0.5 rounded">
                        * 仅计算金鹅账户复利
                    </div>
                </div>
              </div>
           </div>

           {/* Chart */}
           <div className="h-64 w-full mt-4">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                 <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                 <XAxis dataKey="year" stroke="#94a3b8" tickLine={false} axisLine={false} dy={10} />
                 <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} dx={-10} />
                 <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                 />
                 <Legend verticalAlign="top" height={36}/>
                 <Line type="monotone" dataKey="Simple" stroke="#cbd5e1" strokeWidth={3} dot={false} name="仅储蓄 (本金)" />
                 <Line type="monotone" dataKey="Compound" stroke="#f59e0b" strokeWidth={4} dot={false} name="复利增值 (养鹅)" activeDot={{ r: 6, strokeWidth: 0 }} />
               </LineChart>
             </ResponsiveContainer>
           </div>
           
           <div className="text-center text-sm text-slate-500 italic bg-slate-50 p-3 rounded-lg">
             看到那条飞起来的橙色线了吗？那就是金鹅在为你下金蛋！
           </div>
        </div>
    </div>
  );
};