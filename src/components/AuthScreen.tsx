import React, { useState } from 'react';
import { User } from '../types';
import { Wallet, ArrowRight, UserPlus, LogIn, Lock, User as UserIcon, ShieldQuestion, HelpCircle, Check, ArrowLeft } from 'lucide-react';

interface AuthScreenProps {
  users: User[];
  onLogin: (userId: number) => void;
  onRegister: (name: string, password: string, securityQuestion: string, securityAnswer: string) => void;
  onResetPassword: (userId: number, newPassword: string) => void;
}

const PREDEFINED_QUESTIONS = [
  "你的第一只宠物名字是？",
  "你母亲的姓名是？",
  "你最喜欢的食物是？",
  "你出生的城市是？",
  "custom"
];

type AuthView = 'login' | 'register' | 'forgot_find_user' | 'forgot_check_answer' | 'forgot_reset_password';

export const AuthScreen: React.FC<AuthScreenProps> = ({ users, onLogin, onRegister, onResetPassword }) => {
  const [view, setView] = useState<AuthView>('login');
  
  // Login State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Register State
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState(PREDEFINED_QUESTIONS[0]);
  const [customQuestion, setCustomQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');

  // Recover State
  const [recoverUser, setRecoverUser] = useState<User | null>(null);
  const [recoverAnswer, setRecoverAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [error, setError] = useState('');

  const resetForms = () => {
    setUsername('');
    setPassword('');
    setRegUsername('');
    setRegPassword('');
    setSelectedQuestion(PREDEFINED_QUESTIONS[0]);
    setCustomQuestion('');
    setSecurityAnswer('');
    setRecoverUser(null);
    setRecoverAnswer('');
    setNewPassword('');
    setError('');
  };

  const switchView = (v: AuthView) => {
    resetForms();
    setView(v);
  };

  // --- Handlers ---

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username || !password) { setError('请输入账号和密码'); return; }

    const user = users.find(u => u.name === username && u.password === password);
    if (user) {
      onLogin(user.id);
    } else {
      const userExists = users.some(u => u.name === username);
      setError(userExists ? '密码错误' : '账号不存在');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!regUsername.trim()) { setError('请输入账号名称'); return; }
    if (regPassword.length !== 6 || isNaN(Number(regPassword))) { setError('密码必须是6位数字'); return; }
    if (users.some(u => u.name === regUsername)) { setError('账号已存在'); return; }
    
    const finalQuestion = selectedQuestion === 'custom' ? customQuestion : selectedQuestion;
    if (!finalQuestion.trim()) { setError('请设置密保问题'); return; }
    if (!securityAnswer.trim()) { setError('请设置密保答案'); return; }

    onRegister(regUsername, regPassword, finalQuestion, securityAnswer);
  };

  const handleFindUser = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.name === username);
    if (!user) { setError('账号不存在'); return; }
    if (!user.securityQuestion || !user.securityAnswer) { setError('该账号未设置密保，请联系管理员重置'); return; }
    
    setRecoverUser(user);
    setError('');
    setView('forgot_check_answer');
  };

  const handleCheckAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoverUser) return;
    if (recoverAnswer === recoverUser.securityAnswer) {
      setError('');
      setView('forgot_reset_password');
    } else {
      setError('密保答案错误');
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length !== 6 || isNaN(Number(newPassword))) { setError('新密码必须是6位数字'); return; }
    if (!recoverUser) return;

    onResetPassword(recoverUser.id, newPassword);
    alert("密码重置成功！请使用新密码登录。");
    switchView('login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-indigo-600 p-8 text-center relative overflow-hidden">
           {/* Decorative background circles */}
           <div className="absolute top-[-50%] left-[-50%] w-full h-full rounded-full bg-white/10 blur-3xl"></div>
           <div className="absolute bottom-[-50%] right-[-50%] w-full h-full rounded-full bg-indigo-400/20 blur-3xl"></div>
           
           <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm relative z-10">
              <Wallet className="text-white" size={32} />
           </div>
           <h1 className="text-2xl font-extrabold text-white relative z-10">小狗钱钱理财助手</h1>
           <p className="text-indigo-200 mt-2 text-sm relative z-10">更适合家长管理小孩的理财工具</p>
        </div>

        <div className="p-8">
           {/* Tab Switcher for Login/Register */}
           {(view === 'login' || view === 'register') && (
             <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
               <button 
                 onClick={() => switchView('login')}
                 className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${view === 'login' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
               >
                 登录
               </button>
               <button 
                 onClick={() => switchView('register')}
                 className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${view === 'register' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
               >
                 注册开户
               </button>
             </div>
           )}

           {/* Error Message */}
           {error && (
             <div className="mb-4 p-3 bg-red-50 text-red-500 text-sm font-bold rounded-lg text-center animate-shake">
               {error}
             </div>
           )}

           {/* --- LOGIN VIEW --- */}
           {view === 'login' && (
             <form onSubmit={handleLoginSubmit} className="space-y-4 animate-fade-in">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">账号</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                      type="text" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700"
                      placeholder="请输入账号"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">密码</label>
                    <button type="button" onClick={() => switchView('forgot_find_user')} className="text-xs text-indigo-500 font-bold hover:underline">忘记密码？</button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 tracking-widest"
                      placeholder="●●●●●●"
                      inputMode="numeric"
                    />
                  </div>
                </div>

                <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-200">
                   安全登录 <LogIn size={20} />
                </button>
             </form>
           )}

           {/* --- REGISTER VIEW --- */}
           {view === 'register' && (
             <form onSubmit={handleRegisterSubmit} className="space-y-4 animate-fade-in">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">账号</label>
                  <input 
                    type="text" 
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700"
                    placeholder="请输入你的名字"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">设置密码 (6位数字)</label>
                  <input 
                    type="password" 
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 tracking-widest"
                    placeholder="●●●●●●"
                    inputMode="numeric"
                  />
                </div>
                
                <div className="pt-2 border-t border-slate-100">
                    <h4 className="text-xs font-bold text-slate-500 mb-3 flex items-center gap-1"><ShieldQuestion size={14}/> 设置密保问题 (用于找回密码)</h4>
                    
                    <div className="space-y-3">
                        <select 
                            value={selectedQuestion}
                            onChange={(e) => setSelectedQuestion(e.target.value)}
                            className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 text-sm font-medium"
                        >
                            {PREDEFINED_QUESTIONS.map(q => (
                                <option key={q} value={q}>{q === 'custom' ? '自定义问题...' : q}</option>
                            ))}
                        </select>

                        {selectedQuestion === 'custom' && (
                            <input 
                                type="text" 
                                value={customQuestion}
                                onChange={(e) => setCustomQuestion(e.target.value)}
                                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700"
                                placeholder="输入你的自定义问题"
                            />
                        )}

                        <input 
                            type="text" 
                            value={securityAnswer}
                            onChange={(e) => setSecurityAnswer(e.target.value)}
                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 font-bold"
                            placeholder="输入密保答案"
                        />
                    </div>
                </div>

                <button type="submit" className="w-full py-4 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-200">
                   立即开户 <UserPlus size={20} />
                </button>
             </form>
           )}

           {/* --- FORGOT PASSWORD FLOW --- */}
           
           {/* Step 1: Find User */}
           {view === 'forgot_find_user' && (
               <form onSubmit={handleFindUser} className="space-y-4 animate-fade-in">
                   <div className="flex items-center gap-2 mb-4">
                       <button type="button" onClick={() => switchView('login')} className="p-2 hover:bg-slate-100 rounded-full"><ArrowLeft size={20}/></button>
                       <h3 className="text-lg font-bold text-slate-800">找回密码</h3>
                   </div>
                   <p className="text-sm text-slate-500 mb-4">请输入你要找回密码的账号：</p>
                   <input 
                      type="text" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700"
                      placeholder="账号名称"
                      autoFocus
                   />
                   <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg">下一步</button>
               </form>
           )}

           {/* Step 2: Answer Question */}
           {view === 'forgot_check_answer' && recoverUser && (
               <form onSubmit={handleCheckAnswer} className="space-y-4 animate-fade-in">
                   <div className="flex items-center gap-2 mb-4">
                       <button type="button" onClick={() => switchView('forgot_find_user')} className="p-2 hover:bg-slate-100 rounded-full"><ArrowLeft size={20}/></button>
                       <h3 className="text-lg font-bold text-slate-800">安全验证</h3>
                   </div>
                   
                   <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                       <div className="text-xs text-indigo-500 font-bold uppercase mb-1">密保问题</div>
                       <div className="font-bold text-indigo-900 text-lg">{recoverUser.securityQuestion}</div>
                   </div>

                   <div>
                       <label className="block text-xs font-bold text-slate-400 uppercase mb-2">请输入答案</label>
                       <input 
                          type="text" 
                          value={recoverAnswer}
                          onChange={(e) => setRecoverAnswer(e.target.value)}
                          className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700"
                          placeholder="你的答案"
                          autoFocus
                       />
                   </div>
                   <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg">验证</button>
               </form>
           )}

           {/* Step 3: Reset Password */}
           {view === 'forgot_reset_password' && (
               <form onSubmit={handleResetPassword} className="space-y-4 animate-fade-in">
                   <div className="text-center mb-6">
                       <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                           <Check size={32} />
                       </div>
                       <h3 className="text-xl font-bold text-slate-800">验证通过</h3>
                       <p className="text-sm text-slate-500">请设置新的登录密码</p>
                   </div>
                   
                   <input 
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none font-bold text-slate-700 tracking-widest text-center text-xl"
                      placeholder="6位新密码"
                      inputMode="numeric"
                      autoFocus
                   />
                   
                   <button type="submit" className="w-full py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg hover:bg-green-700">完成重置</button>
               </form>
           )}

        </div>
      </div>
    </div>
  );
};