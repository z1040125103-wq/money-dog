import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, AlertCircle } from 'lucide-react';
import { Allocation, TransactionCategory } from '../types';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (type: 'deposit' | 'withdraw', amount: number, note: string, category: TransactionCategory, distribution?: any, source?: string) => void;
  currentAllocation: Allocation;
  balances: {
    goose: number;
    dream: number;
    pocket: number;
  };
}

const EXPENSE_CATEGORIES: TransactionCategory[] = ['零食', '玩具', '文具', '娱乐', '其他'];

export const TransactionModal: React.FC<TransactionModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  currentAllocation,
  balances 
}) => {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [totalAmount, setTotalAmount] = useState<number | ''>('');
  const [note, setNote] = useState('');
  const [category, setCategory] = useState<TransactionCategory>('其他');
  
  // Deposit Split State
  const [split, setSplit] = useState({ dream: 0, goose: 0, pocket: 0 });
  
  // Withdraw State
  const [withdrawSource, setWithdrawSource] = useState<'pocket' | 'dream' | 'goose'>('pocket');
  const [showGooseWarning, setShowGooseWarning] = useState(false);

  // Insufficient Funds Error State
  const [insufficientError, setInsufficientError] = useState<{show: boolean, amount: number, account: string} | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTotalAmount('');
      setNote('');
      setSplit({ dream: 0, goose: 0, pocket: 0 });
      setWithdrawSource('pocket');
      setCategory('其他');
      setShowGooseWarning(false);
      setInsufficientError(null);
      setActiveTab('deposit');
    }
  }, [isOpen]);

  // Auto-calculate split when total amount changes for deposit
  useEffect(() => {
    if (activeTab === 'deposit' && typeof totalAmount === 'number' && totalAmount > 0) {
      setSplit({
        dream: parseFloat((totalAmount * currentAllocation.dream).toFixed(2)),
        goose: parseFloat((totalAmount * currentAllocation.goose).toFixed(2)),
        pocket: parseFloat((totalAmount * currentAllocation.pocket).toFixed(2)),
      });
    }
  }, [totalAmount, activeTab, currentAllocation]);

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!totalAmount || totalAmount <= 0) return;
    
    const sum = split.dream + split.goose + split.pocket;
    if (Math.abs(sum - (totalAmount as number)) > 0.1) {
      alert(`分配总额 (${sum.toFixed(2)}) 必须等于输入总金额 (${totalAmount}).`);
      return;
    }

    onSubmit('deposit', totalAmount as number, note, '收入', split);
    onClose();
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!totalAmount || totalAmount <= 0) return;
    
    const currentBalance = balances[withdrawSource];
    if ((totalAmount as number) > currentBalance) {
      // Show Custom Error Modal instead of alert
      setInsufficientError({
          show: true,
          amount: totalAmount as number,
          account: withdrawSource === 'pocket' ? '零用钱' : withdrawSource === 'goose' ? '金鹅账户' : '梦想账户'
      });
      return;
    }

    if (withdrawSource === 'goose' && !showGooseWarning) {
      setShowGooseWarning(true);
      return;
    }

    onSubmit('withdraw', totalAmount as number, note, category, undefined, withdrawSource);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in relative">
        
        {/* Insufficient Funds Overlay */}
        {insufficientError && (
             <div className="absolute inset-0 z-20 bg-white/95 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                <div className="bg-red-100 p-4 rounded-full mb-4">
                    <AlertCircle size={32} className="text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">余额不足</h3>
                <p className="text-slate-500 mb-8 max-w-xs">
                    你的 {insufficientError.account} 只有 <span className="font-bold text-slate-800">¥{balances[withdrawSource].toFixed(2)}</span>，
                    但是你想花 <span className="font-bold text-red-500">¥{insufficientError.amount.toFixed(2)}</span>。
                </p>
                <button 
                    onClick={() => setInsufficientError(null)}
                    className="w-full py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-colors shadow-lg"
                >
                    我知道了，重新调整
                </button>
            </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-slate-800">记一笔</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex p-2 bg-slate-50">
          <button
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'deposit' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'
            }`}
            onClick={() => setActiveTab('deposit')}
          >
            存入 (喂养金鹅)
          </button>
          <button
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'withdraw' ? 'bg-white shadow text-pink-600' : 'text-slate-500 hover:text-slate-700'
            }`}
            onClick={() => setActiveTab('withdraw')}
          >
            支出 (消费)
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'deposit' ? (
            <form onSubmit={handleDepositSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">总金额</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">¥</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(parseFloat(e.target.value))}
                    className="w-full pl-8 pr-4 py-3 text-2xl font-bold text-slate-800 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">来源 / 备注</label>
                <input
                  type="text"
                  required
                  placeholder="例如：压岁钱、做家务"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-xl space-y-3">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">自动分配</div>
                
                <div className="flex items-center gap-3">
                  <div className="w-24 text-sm font-medium text-dream-700">梦想 ({(currentAllocation.dream * 100).toFixed(0)}%)</div>
                  <input
                    type="number"
                    step="0.01"
                    value={split.dream}
                    onChange={(e) => setSplit({...split, dream: parseFloat(e.target.value)})}
                    className="flex-1 p-2 border rounded-md text-right text-sm font-mono"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 text-sm font-medium text-goose-700">金鹅 ({(currentAllocation.goose * 100).toFixed(0)}%)</div>
                  <input
                    type="number"
                    step="0.01"
                    value={split.goose}
                    onChange={(e) => setSplit({...split, goose: parseFloat(e.target.value)})}
                    className="flex-1 p-2 border rounded-md text-right text-sm font-mono"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 text-sm font-medium text-pocket-700">零用钱 ({(currentAllocation.pocket * 100).toFixed(0)}%)</div>
                  <input
                    type="number"
                    step="0.01"
                    value={split.pocket}
                    onChange={(e) => setSplit({...split, pocket: parseFloat(e.target.value)})}
                    className="flex-1 p-2 border rounded-md text-right text-sm font-mono"
                  />
                </div>
              </div>

              <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-indigo-200">
                确认存入
              </button>
            </form>
          ) : (
            <form onSubmit={handleWithdrawSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">消费金额</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">¥</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(parseFloat(e.target.value))}
                    className="w-full pl-8 pr-4 py-3 text-2xl font-bold text-slate-800 border rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">消费类目</label>
                <div className="grid grid-cols-3 gap-2">
                   {EXPENSE_CATEGORIES.map(cat => (
                     <button
                       key={cat}
                       type="button"
                       onClick={() => setCategory(cat)}
                       className={`p-2 rounded-lg text-sm font-bold border transition-colors ${
                         category === cat 
                         ? 'bg-pink-100 border-pink-300 text-pink-700' 
                         : 'bg-white border-slate-200 text-slate-500 hover:border-pink-200'
                       }`}
                     >
                       {cat}
                     </button>
                   ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">资金来源</label>
                <select
                  value={withdrawSource}
                  onChange={(e) => {
                    setWithdrawSource(e.target.value as any);
                    setShowGooseWarning(false);
                  }}
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-pink-500 outline-none bg-white"
                >
                  <option value="pocket">零用钱 (可用: ¥{balances.pocket.toFixed(2)})</option>
                  <option value="dream">梦想账户 (可用: ¥{balances.dream.toFixed(2)})</option>
                  <option value="goose">金鹅账户 (可用: ¥{balances.goose.toFixed(2)})</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">用途 / 备注</label>
                <input
                  type="text"
                  required
                  placeholder="买了什么？"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
                />
              </div>

              {showGooseWarning && withdrawSource === 'goose' && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg animate-pulse">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="text-red-500 shrink-0" />
                    <div>
                      <h4 className="font-bold text-red-700">警告！别杀掉你的鹅！</h4>
                      <p className="text-sm text-red-600 mt-1">
                        你正在动用金鹅账户的本金。如果花掉这笔钱，它就再也不能为你生金蛋（利息）了。你确定要这样做吗？
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                className={`w-full py-3 font-bold rounded-xl transition-colors shadow-lg text-white ${
                   showGooseWarning ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : 'bg-pink-600 hover:bg-pink-700 shadow-pink-200'
                }`}
              >
                {showGooseWarning ? '我明白了，坚持取出' : '确认支出'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};