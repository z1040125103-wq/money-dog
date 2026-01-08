import React, { useState, useEffect } from 'react';
import { X, TrendingUp, Clock } from 'lucide-react';
import { GooseIcon } from './Icons';

interface GooseDetailProps {
  isOpen: boolean;
  onClose: () => void;
  balance: number;
  interestRate: number;
}

export const GooseDetail: React.FC<GooseDetailProps> = ({
  isOpen,
  onClose,
  balance,
  interestRate
}) => {
  const [forecastDays, setForecastDays] = useState<{label: string, earn: number}[]>([]);
  const [currentTimeStr, setCurrentTimeStr] = useState('');

  // Live Clock Effect
  useEffect(() => {
    if (!isOpen) return;

    const updateTime = () => {
        const now = new Date();
        const timeString = now.toLocaleTimeString('zh-CN', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit',
            hour12: false 
        });
        setCurrentTimeStr(timeString);
    };

    updateTime(); // Initial
    const timer = setInterval(updateTime, 1000); // Update every second

    return () => clearInterval(timer);
  }, [isOpen]);

  // Generate Future Forecast Data Effect
  useEffect(() => {
    if (isOpen) {
        const dailyRate = interestRate / 365;
        // Generate Next 7 Days (Starting tomorrow)
        const days = Array.from({ length: 7 }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() + i + 1); // +1 to start from tomorrow
            
            const month = (d.getMonth() + 1).toString().padStart(2, '0');
            const day = d.getDate().toString().padStart(2, '0');
            
            let label = `${month}/${day}`;
            if (i === 0) label = "明天";
            if (i === 1) label = "后天";

            // Simple compound projection for visualization (assuming no withdrawal)
            // Balance grows slightly each day
            const projectedBalance = balance * Math.pow(1 + dailyRate, i + 1);
            const dayEarn = projectedBalance * dailyRate;
            
            return {
                label: label,
                earn: dayEarn
            };
        });
        setForecastDays(days);
    }
  }, [isOpen, balance, interestRate]);

  if (!isOpen) return null;

  const yearlyEarning = balance * interestRate;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
        <div className="bg-goose-50 p-6 border-b border-goose-100 flex justify-between items-center">
          <div>
             <h2 className="text-xl font-bold text-goose-700 flex items-center gap-2">
                <GooseIcon className="text-goose-600" /> 金鹅产蛋日报
             </h2>
             <p className="text-xs text-goose-600 mt-1 flex items-center gap-1 font-mono bg-goose-100 px-2 py-0.5 rounded-full w-fit">
                <Clock size={12}/> 当前时间: {currentTimeStr}
             </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-goose-200 rounded-full text-goose-700 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
            {/* Summary Card */}
            <div className="bg-gradient-to-br from-goose-500 to-goose-700 rounded-xl p-6 text-white shadow-lg shadow-goose-200">
                <div className="text-goose-100 text-sm font-bold uppercase tracking-wider mb-1">当前本金</div>
                <div className="text-3xl font-extrabold mb-4">¥{balance.toFixed(2)}</div>
                
                <div className="grid grid-cols-2 gap-4 border-t border-white/20 pt-4">
                    <div>
                        <div className="text-xs text-goose-100">年化利率</div>
                        <div className="font-bold text-lg">{(interestRate * 100).toFixed(1)}%</div>
                    </div>
                    <div>
                        <div className="text-xs text-goose-100">预计年收益</div>
                        <div className="font-bold text-lg">+¥{yearlyEarning.toFixed(2)}</div>
                    </div>
                </div>
            </div>

            {/* Daily List */}
            <div>
                <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <TrendingUp size={18} /> 未来7天收益预测
                </h3>
                <div className="bg-slate-50 rounded-xl border overflow-hidden max-h-[300px] overflow-y-auto">
                    {balance <= 0 ? (
                        <div className="p-6 text-center text-slate-400 text-sm">
                            还没有本金哦，喂养金鹅后开始产生收益。
                        </div>
                    ) : (
                        forecastDays.map((day, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 border-b last:border-0 border-slate-100 hover:bg-white transition-colors">
                                <div className={`font-bold ${idx === 0 ? 'text-indigo-600' : 'text-slate-600'}`}>
                                    {day.label}
                                </div>
                                <div className="font-mono font-bold text-goose-600 flex items-center gap-1">
                                    <TrendingUp size={14} /> +¥{day.earn.toFixed(4)}
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <p className="text-xs text-slate-400 mt-2 text-center">
                   *估算数据，实际收益按当天本金计算。
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};
