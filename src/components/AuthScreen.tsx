import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Wallet, LogIn, Lock, UserPlus, Mail, AlertCircle, Loader2 } from 'lucide-react';

interface AuthScreenProps {
  onLoginSuccess?: () => void; 
  users?: any;
  onLogin?: any;
  onRegister?: any;
  onResetPassword?: any;
}

export const AuthScreen: React.FC<AuthScreenProps> = () => {
  const [view, setView] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (view === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        // Login successful, App.tsx listener will handle state change
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage("注册成功！请检查你的邮箱进行验证，或者直接登录（如果是测试模式）。");
        setView('login');
      }
    } catch (err: any) {
      setError(err.message || '发生错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-indigo-600 p-8 text-center relative overflow-hidden">
           <div className="absolute top-[-50%] left-[-50%] w-full h-full rounded-full bg-white/10 blur-3xl"></div>
           <div className="absolute bottom-[-50%] right-[-50%] w-full h-full rounded-full bg-indigo-400/20 blur-3xl"></div>
           
           <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm relative z-10">
              <Wallet className="text-white" size={32} />
           </div>
           <h1 className="text-2xl font-extrabold text-white relative z-10">小狗钱钱 (云端版)</h1>
           <p className="text-indigo-200 mt-2 text-sm relative z-10">数据永久保存，多设备同步</p>
        </div>

        <div className="p-8">
           <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
             <button 
               onClick={() => { setView('login'); setError(null); setMessage(null); }}
               className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${view === 'login' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
             >
               登录
             </button>
             <button 
               onClick={() => { setView('register'); setError(null); setMessage(null); }}
               className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${view === 'register' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
             >
               注册
             </button>
           </div>

           {error && (
             <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm font-bold rounded-lg flex items-center gap-2 animate-shake">
               <AlertCircle size={16}/> {error === 'Invalid login credentials' ? '账号或密码错误' : error}
             </div>
           )}

           {message && (
             <div className="mb-4 p-3 bg-green-50 text-green-600 text-sm font-bold rounded-lg flex items-center gap-2">
               {message}
             </div>
           )}

           <form onSubmit={handleAuth} className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">电子邮箱</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">密码</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    type="password" 
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 tracking-widest"
                    placeholder="******"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 transition-all"
              >
                 {loading ? <Loader2 className="animate-spin" /> : (view === 'login' ? <><LogIn size={20} /> 登录</> : <><UserPlus size={20} /> 注册</>)}
              </button>
           </form>
           
           <div className="mt-6 text-center text-xs text-slate-400">
              {view === 'login' ? '还没有账号？点击上方切换到注册' : '已有账号？点击上方切换到登录'}
           </div>
        </div>
      </div>
    </div>
  );
};