import React, { useState } from 'react';
import { AppState, User } from '../types';
import { Save, RefreshCw, X, ShieldAlert, Banknote, Lock, AlertTriangle } from 'lucide-react';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
  onUpdateSettings: (newSettings: AppState['app_settings']) => void;
  onUpdateUserData: (userId: number, newData: Partial<User>) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  state,
  onUpdateSettings,
  onUpdateUserData
}) => {
  const [password, setPassword] = useState('');
  const [setupPassword, setSetupPassword] = useState('');
  const [setupConfirm, setSetupConfirm] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);
  
  // Local state for form editing
  const [allocation, setAllocation] = useState(state.app_settings.default_allocation);
  const [interestRate, setInterestRate] = useState(state.app_settings.assumed_interest_rate * 100);
  
  const activeUser = state.users.find(u => u.id === state.activeUserId);
  const [balances, setBalances] = useState({
    goose: activeUser?.assets.goose_balance || 0,
    pocket: activeUser?.assets.pocket_balance || 0,
    dream: activeUser?.assets.dreams.reduce((acc, d) => acc + d.current_amount, 0) || 0
  });

  const handleSetupPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (setupPassword.length !== 6 || isNaN(Number(setupPassword))) {
      setErrorModal("密码必须是6位数字");
      return;
    }
    if (setupPassword !== setupConfirm) {
      setErrorModal("两次输入的密码不一致，请重新输入");
      // Reset confirmations for UX
      setSetupConfirm('');
      return;
    }
    
    // Save new password and init flag
    onUpdateSettings({
      ...state.app_settings,
      admin_password: setupPassword,
      admin_initialized: true
    });
    
    setIsAuthenticated(true);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === state.app_settings.admin_password) {
      setIsAuthenticated(true);
    } else {
      setErrorModal("密码错误！请重试。");
      setPassword('');
    }
  };

  const handleSaveSettings = () => {
    onUpdateSettings({
      ...state.app_settings,
      default_allocation: allocation,
      assumed_interest_rate: interestRate / 100
    });
    
    if (activeUser) {
        const updatedUser = { ...activeUser };
        updatedUser.assets.goose_balance = balances.goose;
        updatedUser.assets.pocket_balance = balances.pocket;
        if(updatedUser.assets.dreams.length > 0) {
           const currentTotal = updatedUser.assets.dreams.reduce((acc, d) => acc + d.current_amount, 0);
           const diff = balances.dream - currentTotal;
           updatedUser.assets.dreams[0].current_amount += diff;
        }
        onUpdateUserData(activeUser.id, updatedUser);
    }

    alert("设置已保存！");
    onClose();
  };

  if (!isOpen) return null;

  const isFirstTime = !state.app_settings.admin_initialized;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-in relative">
        
        {/* Error Modal Overlay */}
        {errorModal && (
            <div className="absolute inset-0 z-20 bg-white/95 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                <div className="bg-red-100 p-4 rounded-full mb-4">
                    <AlertTriangle size={32} className="text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">出错了</h3>
                <p className="text-slate-500 mb-8 max-w-xs font-bold">
                    {errorModal}
                </p>
                <button 
                    onClick={() => setErrorModal(null)}
                    className="px-8 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-colors shadow-lg"
                >
                    我知道了
                </button>
            </div>
        )}

        <div className="flex justify-between items-center p-6 border-b bg-slate-50">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Banknote className="text-indigo-600"/> 资金管理系统
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full">
            <X />
          </button>
        </div>

        <div className="p-8">
          {/* First Time Setup View */}
          {isFirstTime && !isAuthenticated ? (
             <form onSubmit={handleSetupPassword} className="flex flex-col gap-4 max-w-sm mx-auto py-6 text-center">
                <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Lock size={32} className="text-indigo-600"/>
                </div>
                <h3 className="text-xl font-bold text-slate-800">设置管理员密码</h3>
                <p className="text-sm text-slate-500 mb-4">
                   为了保护资金安全，初次使用请设置一个6位数的管理员密码。
                </p>
                
                <input
                    type="password"
                    value={setupPassword}
                    onChange={(e) => {
                        if (e.target.value.length <= 6) setSetupPassword(e.target.value);
                    }}
                    className="p-3 border rounded-xl text-center text-lg tracking-widest focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="输入6位数字密码"
                    inputMode="numeric"
                    autoFocus
                />
                <input
                    type="password"
                    value={setupConfirm}
                    onChange={(e) => {
                        if (e.target.value.length <= 6) setSetupConfirm(e.target.value);
                    }}
                    className="p-3 border rounded-xl text-center text-lg tracking-widest focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="再次确认密码"
                    inputMode="numeric"
                />
                <button type="submit" className="bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors mt-2 shadow-lg shadow-indigo-200">
                  确认设置
                </button>
             </form>
          ) : !isAuthenticated ? (
            /* Login View */
            <form onSubmit={handleLogin} className="flex flex-col gap-4 max-w-sm mx-auto py-10">
              <div className="text-center mb-4">
                <ShieldAlert size={48} className="mx-auto text-slate-300 mb-4"/>
                <p className="text-slate-500">这是系统的核心区域，请输入管理员密码。</p>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="p-3 border rounded-xl text-center text-lg tracking-widest focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="输入密码"
                autoFocus
              />
              <button type="submit" className="bg-slate-800 text-white py-3 rounded-xl font-bold hover:bg-slate-700 transition-colors">
                验证身份
              </button>
            </form>
          ) : (
            /* Main Admin Panel View */
            <div className="space-y-8 h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              
              {/* Allocation Settings */}
              <section>
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <RefreshCw size={20} className="text-indigo-500" /> 收入分配比例设置
                </h3>
                <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
                    <div className="grid grid-cols-3 gap-6">
                    <div className="text-center">
                        <label className="block text-xs font-bold text-dream-600 uppercase mb-2">梦想账户</label>
                        <div className="relative">
                            <input 
                            type="number" step="0.05" max="1" min="0"
                            value={allocation.dream}
                            onChange={(e) => setAllocation({...allocation, dream: parseFloat(e.target.value)})}
                            className="w-full p-2 border border-dream-200 rounded-lg text-center font-bold text-xl text-dream-700"
                            />
                            <span className="text-xs text-slate-400 mt-1 block">{(allocation.dream * 100).toFixed(0)}%</span>
                        </div>
                    </div>
                    <div className="text-center">
                        <label className="block text-xs font-bold text-goose-600 uppercase mb-2">金鹅账户</label>
                        <div className="relative">
                            <input 
                            type="number" step="0.05" max="1" min="0"
                            value={allocation.goose}
                            onChange={(e) => setAllocation({...allocation, goose: parseFloat(e.target.value)})}
                            className="w-full p-2 border border-goose-200 rounded-lg text-center font-bold text-xl text-goose-700"
                            />
                            <span className="text-xs text-slate-400 mt-1 block">{(allocation.goose * 100).toFixed(0)}%</span>
                        </div>
                    </div>
                    <div className="text-center">
                        <label className="block text-xs font-bold text-pocket-600 uppercase mb-2">零用钱</label>
                        <div className="relative">
                            <input 
                            type="number" step="0.05" max="1" min="0"
                            value={allocation.pocket}
                            onChange={(e) => setAllocation({...allocation, pocket: parseFloat(e.target.value)})}
                            className="w-full p-2 border border-pocket-200 rounded-lg text-center font-bold text-xl text-pocket-700"
                            />
                            <span className="text-xs text-slate-400 mt-1 block">{(allocation.pocket * 100).toFixed(0)}%</span>
                        </div>
                    </div>
                    </div>
                    <div className="mt-4 text-center">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${Math.abs(allocation.dream + allocation.goose + allocation.pocket - 1) < 0.01 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            总计: {((allocation.dream + allocation.goose + allocation.pocket) * 100).toFixed(0)}%
                        </span>
                    </div>
                </div>
              </section>

              {/* Interest Rate */}
              <section>
                <h3 className="text-lg font-bold text-slate-800 mb-4">金鹅参数</h3>
                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border">
                   <label className="text-slate-600 font-medium">预计年化回报率 (%):</label>
                   <input 
                      type="number" 
                      value={interestRate}
                      onChange={(e) => setInterestRate(parseFloat(e.target.value))}
                      className="w-24 p-2 border rounded-lg text-center font-bold text-goose-600"
                    />
                </div>
              </section>

              {/* Data Correction */}
              <section className="bg-red-50 p-6 rounded-xl border border-red-100">
                <h3 className="text-lg font-bold text-red-800 mb-4 flex items-center gap-2">
                    <ShieldAlert size={20}/> 强制修正 (上帝模式)
                </h3>
                <p className="text-sm text-red-600 mb-4">直接修改账户余额。请在盘点现金后使用此功能修正误差。</p>
                
                <div className="space-y-4">
                    <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-red-100">
                        <label className="font-bold text-goose-700">金鹅余额</label>
                        <input 
                            type="number" 
                            value={balances.goose}
                            onChange={(e) => setBalances({...balances, goose: parseFloat(e.target.value)})}
                            className="w-40 p-2 border rounded-lg text-right font-mono"
                        />
                    </div>
                    <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-red-100">
                        <label className="font-bold text-dream-700">梦想总额</label>
                        <input 
                            type="number" 
                            value={balances.dream}
                            onChange={(e) => setBalances({...balances, dream: parseFloat(e.target.value)})}
                            className="w-40 p-2 border rounded-lg text-right font-mono"
                        />
                    </div>
                    <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-red-100">
                        <label className="font-bold text-pocket-700">零用钱余额</label>
                        <input 
                            type="number" 
                            value={balances.pocket}
                            onChange={(e) => setBalances({...balances, pocket: parseFloat(e.target.value)})}
                            className="w-40 p-2 border rounded-lg text-right font-mono"
                        />
                    </div>
                </div>
              </section>

              <button 
                onClick={handleSaveSettings}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                <Save size={20} /> 保存所有系统设置
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
