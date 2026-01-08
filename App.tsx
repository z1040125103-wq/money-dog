import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { loadState, saveState, saveToCloud, loadFromCloud } from './services/storageService';
import { AppState, Transaction, User, Dream, TransactionCategory, CustomAccount } from './types';
import { AccountCard } from './components/AccountCard';
import { FinancialTools } from './components/FinancialTools';
import { TransactionModal } from './components/TransactionModal';
import { AdminPanel } from './components/AdminPanel';
import { DreamManager } from './components/DreamManager';
import { GooseDetail } from './components/GooseDetail';
import { PocketDetail } from './components/PocketDetail';
import { AuthScreen } from './components/AuthScreen';
import { AddAccountModal } from './components/AddAccountModal';
import { GooseIcon } from './components/Icons';
import { Settings, PlusCircle, Wallet, Target, History, PiggyBank, LogOut, Plus, Landmark, TrendingUp, CircleDollarSign, GraduationCap, Loader2, Cloud, CloudOff } from 'lucide-react';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Initialize with local state first for fast render
  const [appState, setAppState] = useState<AppState>(loadState());
  
  const [isTransactionModalOpen, setTransactionModalOpen] = useState(false);
  const [isAdminOpen, setAdminOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Modal States
  const [isDreamManagerOpen, setDreamManagerOpen] = useState(false);
  const [isGooseDetailOpen, setGooseDetailOpen] = useState(false);
  const [isPocketDetailOpen, setPocketDetailOpen] = useState(false);
  const [isAddAccountOpen, setAddAccountOpen] = useState(false);
  
  // State for editing custom accounts
  const [editingAccount, setEditingAccount] = useState<CustomAccount | null>(null);

  // 1. Check Supabase Session & Load Data
  useEffect(() => {
    // If NO Supabase config, skip auth entirely and run in offline mode
    if (!isSupabaseConfigured) {
      console.log("App running in Offline Mode");
      setIsLoading(false);
      return;
    }

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchCloudData(session.user.id, session.user.email);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        setIsLoading(true); 
        fetchCloudData(session.user.id, session.user.email);
      } else {
        setIsLoading(false);
        // Reset to default/local state on logout
        setAppState(loadState()); 
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchCloudData = async (userId: string, userEmail?: string) => {
    setIsSyncing(true);
    const cloudData = await loadFromCloud(userId);
    
    if (cloudData) {
      // 1. If data exists in cloud, use it
      console.log("Loaded data from cloud");
      setAppState(cloudData);
      saveState(cloudData); // Sync to local storage
    } else {
      // 2. If NO data in cloud (New User), init with current default state
      console.log("New user detected, initializing cloud data...");
      
      // Update the default user name to the email address
      const newState = { ...appState };
      if (newState.users.length > 0 && userEmail) {
          newState.users[0].name = userEmail.split('@')[0];
      }
      
      setAppState(newState);
      await saveToCloud(userId, newState);
    }
    
    setIsLoading(false);
    setIsSyncing(false);
  };

  // 2. Persist state changes to Local AND Cloud
  useEffect(() => {
    // Save locally
    saveState(appState);
    
    // Save to cloud
    if (session?.user?.id && isSupabaseConfigured && !isLoading) {
       saveToCloud(session.user.id, appState);
    }
  }, [appState, session, isLoading]);


  const handleLogout = async () => {
    if (isSupabaseConfigured) {
        await supabase.auth.signOut();
        setSession(null);
    }
  };

  // --- LOGIC HELPERS ---
  
  // User Logic:
  // If Cloud/Auth mode: use the first user in the array (synced one).
  // If Offline mode: use the first user in the array (local default).
  const user: User = appState.users[0] || {
      id: 0, 
      name: session?.user?.email?.split('@')[0] || "我的账本", 
      password: "", 
      assets: { goose_balance: 0, pocket_balance: 0, dreams: [], custom_accounts: [] }, 
      transactions: []
  };

  // If loading and no session yet, show loader
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
            <Loader2 className="animate-spin text-indigo-600 mx-auto mb-4" size={40} />
            <p className="text-slate-500 font-bold">正在连接金鹅星球...</p>
        </div>
      </div>
    );
  }

  // If Configured AND Not logged in -> Show Auth Screen
  // If Not Configured -> Skip Auth Screen (Offline Mode)
  if (isSupabaseConfigured && !session) {
    return <AuthScreen />;
  }

  const { assets } = user;
  
  // Calculate Interest
  const annualInterest = assets.goose_balance * appState.app_settings.assumed_interest_rate;

  // Dream Stats
  const totalDreamBalance = assets.dreams.reduce((acc, d) => acc + d.current_amount, 0);
  const activeDreamsCount = assets.dreams.length;

  // Calculate total custom assets
  const totalCustomBalance = (assets.custom_accounts || []).reduce((acc, c) => acc + c.balance, 0);

  // Transaction Handler
  const handleTransaction = (
    type: 'deposit' | 'withdraw', 
    amount: number, 
    note: string, 
    category: TransactionCategory, 
    distribution?: { dream: number; goose: number; pocket: number }, 
    source?: string
  ) => {
    // 关键修复：使用深拷贝 (Deep Copy) 防止 React 状态更新不生效
    const newUser = JSON.parse(JSON.stringify(user));
    
    const newTx: Transaction = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      type,
      amount,
      note,
      category,
      distribution,
      sourceAccount: source as any
    };

    if (type === 'deposit' && distribution) {
      // 关键修复：处理梦想账户
      if (distribution.dream > 0) {
          if (newUser.assets.dreams.length > 0) {
             // 正常情况：存入第一个梦想
             newUser.assets.dreams[0].current_amount += distribution.dream;
          } else {
             // 异常情况修复：如果没有梦想，自动创建一个，防止钱消失
             const defaultDream: Dream = {
                 id: Date.now(),
                 title: "我的梦想基金",
                 target_amount: 10000, // 默认目标
                 current_amount: distribution.dream
             };
             newUser.assets.dreams.push(defaultDream);
          }
      }

      newUser.assets.goose_balance += distribution.goose;
      newUser.assets.pocket_balance += distribution.pocket;
      
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);

    } else if (type === 'withdraw' && source) {
      if (source === 'pocket') newUser.assets.pocket_balance -= amount;
      if (source === 'goose') newUser.assets.goose_balance -= amount;
      if (source === 'dream' && newUser.assets.dreams.length > 0) {
        newUser.assets.dreams[0].current_amount -= amount;
      }
    }

    newUser.transactions.unshift(newTx);
    
    // Update State (User array is kept for structure, but we only use index 0)
    const newUsers = [newUser]; 
    setAppState({ ...appState, users: newUsers });
  };

  const updateSettings = (newSettings: AppState['app_settings']) => {
    setAppState({ ...appState, app_settings: newSettings });
  };

  const updateUserData = (_userId: number, userData: Partial<User>) => {
    // We don't need userId here as we always operate on the single active user logic in this version
    // Renamed to _userId to suppress unused variable warning
    const newUser = { ...user, ...userData };
    setAppState({ ...appState, users: [newUser] });
  };

  // Dream Management Handlers
  const handleAddDream = (dream: Omit<Dream, 'id'>) => {
      const newDreamObj: Dream = { ...dream, id: Date.now(), current_amount: 0 };
      const newUser = JSON.parse(JSON.stringify(user));
      newUser.assets.dreams.push(newDreamObj);
      updateUserData(user.id, newUser);
  };

  const handleUpdateDream = (updatedDream: Dream) => {
      const newUser = JSON.parse(JSON.stringify(user));
      newUser.assets.dreams = newUser.assets.dreams.map((d: Dream) => d.id === updatedDream.id ? updatedDream : d);
      updateUserData(user.id, newUser);
  };

  const handleDeleteDream = (id: number) => {
      const newUser = JSON.parse(JSON.stringify(user));
      newUser.assets.dreams = newUser.assets.dreams.filter((d: Dream) => d.id !== id);
      updateUserData(user.id, newUser);
  };

  // Custom Account Handlers
  const handleSaveCustomAccount = (account: Omit<CustomAccount, 'id'> | CustomAccount) => {
      let updatedAccounts;
      
      if ('id' in account) {
          // Edit existing
          updatedAccounts = (user.assets.custom_accounts || []).map(acc => 
              acc.id === account.id ? account : acc
          );
      } else {
          // Add new
          const newAccount: CustomAccount = { ...account, id: Date.now() };
          updatedAccounts = [...(user.assets.custom_accounts || []), newAccount];
      }

      const newUser = {
          ...user,
          assets: {
              ...user.assets,
              custom_accounts: updatedAccounts
          }
      };
      updateUserData(user.id, newUser);
      setAddAccountOpen(false);
      setEditingAccount(null);
  };

  const handleDeleteCustomAccount = (id: number) => {
      const newUser = {
          ...user,
          assets: {
              ...user.assets,
              custom_accounts: (user.assets.custom_accounts || []).filter(acc => acc.id !== id)
          }
      };
      updateUserData(user.id, newUser);
  };

  const openAddAccountModal = () => {
      setEditingAccount(null);
      setAddAccountOpen(true);
  };

  const openEditAccountModal = (account: CustomAccount) => {
      setEditingAccount(account);
      setAddAccountOpen(true);
  };

  const getCustomAccountIcon = (type: string) => {
      switch(type) {
          case 'bank': return <Landmark size={24} />;
          case 'fund': return <TrendingUp size={24} />;
          case 'gold': return <CircleDollarSign size={24} />;
          case 'education': return <GraduationCap size={24} />;
          default: return <Wallet size={24} />;
      }
  };

  return (
    <div className="min-h-screen pb-20 md:pb-10 font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg text-white ${isSupabaseConfigured ? 'bg-indigo-600' : 'bg-slate-600'}`}>
               <Wallet size={24} />
            </div>
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">小狗钱钱</h1>
            
            {/* Status Indicator */}
            {isSupabaseConfigured ? (
                isSyncing ? 
                    <span className="text-xs text-slate-400 flex items-center gap-1 animate-pulse"><Cloud size={12}/> 同步中</span> : 
                    <span className="text-xs text-green-500 flex items-center gap-1"><Cloud size={12}/> 已同步</span>
            ) : (
                <span className="text-xs text-slate-400 flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-full"><CloudOff size={12}/> 离线模式</span>
            )}
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden md:block text-right">
                <div className="text-xs text-slate-500 font-bold uppercase">总资产</div>
                <div className="text-lg font-bold text-slate-800">
                    ¥{(assets.goose_balance + assets.pocket_balance + totalDreamBalance + totalCustomBalance).toFixed(2)}
                </div>
             </div>
             
             <div className="flex gap-2">
                <button 
                  onClick={() => setAdminOpen(true)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                  title="资金管理"
                >
                  <Settings size={20} />
                </button>
                {isSupabaseConfigured && (
                    <button 
                    onClick={handleLogout}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    title="退出登录"
                    >
                    <LogOut size={20} />
                    </button>
                )}
             </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        
        {/* Welcome Message */}
        <div className="md:flex justify-between items-end">
             <div>
                <h2 className="text-2xl font-bold text-slate-800">你好，{user.name}！ 👋</h2>
                <p className="text-slate-500 font-medium">
                    永远不要杀死一直会下蛋的鹅。
                </p>
             </div>
        </div>

        {/* Account Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AccountCard 
            title="梦想账户"
            balance={totalDreamBalance}
            colorTheme="dream"
            icon={<Target size={24} />}
            secondaryInfo={
                <div className="flex items-center gap-2 text-dream-700">
                    <span className="font-bold">{activeDreamsCount} 个进行中的梦想</span>
                </div>
            }
            onClick={() => setDreamManagerOpen(true)}
            backgroundImage={assets.dreams[0]?.image_url}
          />
          <AccountCard 
            title="金鹅账户"
            balance={assets.goose_balance}
            colorTheme="goose"
            icon={
                <div className="relative">
                    <GooseIcon size={24} className="relative z-10" />
                </div>
            }
            secondaryInfo={`预计年收益: +¥${annualInterest.toFixed(2)}`}
            onClick={() => setGooseDetailOpen(true)}
          />
          <AccountCard 
            title="零用钱"
            balance={assets.pocket_balance}
            colorTheme="pocket"
            icon={<PiggyBank size={24} />}
            secondaryInfo="点击查看支出分析"
            onClick={() => setPocketDetailOpen(true)}
          />

          {/* Render Custom Accounts */}
          {assets.custom_accounts && assets.custom_accounts.map(acc => (
              <AccountCard 
                key={acc.id}
                title={acc.name}
                balance={acc.balance}
                colorTheme="pocket" 
                icon={getCustomAccountIcon(acc.type)}
                secondaryInfo={<span className="text-slate-500 truncate block">{acc.note || '点击编辑账户详情'}</span>}
                onClick={() => openEditAccountModal(acc)}
              />
          ))}
        </div>
        
        {/* Add Account & Record Transaction Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <button 
                onClick={openAddAccountModal}
                className="w-full bg-white border-2 border-dashed border-slate-300 rounded-xl p-4 text-slate-500 font-bold hover:border-indigo-500 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2 hover:bg-indigo-50"
            >
                <Plus size={20} /> 添加新账户
            </button>
            
            <button 
                onClick={() => setTransactionModalOpen(true)}
                className="w-full bg-white border-2 border-dashed border-slate-300 rounded-xl p-4 text-slate-500 font-bold hover:border-indigo-500 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
            >
                <PlusCircle size={20} /> 记一笔
            </button>
        </div>

        {/* Educational Tools */}
        <section>
          <FinancialTools currentPrincipal={assets.goose_balance} />
        </section>

        {/* Recent Transactions */}
        <section>
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <History size={20}/> 近期变动
          </h3>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {user.transactions.length === 0 ? (
                <div className="p-8 text-center text-slate-400">暂无记录。开始喂养你的金鹅吧！</div>
            ) : (
                <div className="divide-y divide-slate-100">
                    {user.transactions.slice(0, 5).map(tx => (
                        <div key={tx.id} className="p-4 flex justify-between items-center hover:bg-slate-50">
                            <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-full ${tx.type === 'deposit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                    {tx.type === 'deposit' ? <PlusCircle size={16}/> : <Wallet size={16}/>}
                                </div>
                                <div>
                                    <div className="font-bold text-slate-800">{tx.note}</div>
                                    <div className="text-xs text-slate-500">
                                        {new Date(tx.date).toLocaleDateString()} · {tx.category || '未分类'}
                                    </div>
                                </div>
                            </div>
                            <div className={`font-bold ${tx.type === 'deposit' ? 'text-green-600' : 'text-slate-800'}`}>
                                {tx.type === 'deposit' ? '+' : '-'}¥{tx.amount.toFixed(2)}
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </div>
        </section>
      </main>

      {/* Modals */}
      <TransactionModal 
        isOpen={isTransactionModalOpen}
        onClose={() => setTransactionModalOpen(false)}
        onSubmit={handleTransaction}
        currentAllocation={appState.app_settings.default_allocation}
        balances={{
            goose: assets.goose_balance,
            dream: totalDreamBalance,
            pocket: assets.pocket_balance
        }}
      />

      <AdminPanel 
        isOpen={isAdminOpen}
        onClose={() => setAdminOpen(false)}
        state={appState}
        onUpdateSettings={updateSettings}
        onUpdateUserData={updateUserData}
      />

      <DreamManager 
        isOpen={isDreamManagerOpen}
        onClose={() => setDreamManagerOpen(false)}
        dreams={assets.dreams}
        totalDreamBalance={totalDreamBalance}
        onAddDream={handleAddDream}
        onUpdateDream={handleUpdateDream}
        onDeleteDream={handleDeleteDream}
      />

      <GooseDetail 
        isOpen={isGooseDetailOpen}
        onClose={() => setGooseDetailOpen(false)}
        balance={assets.goose_balance}
        interestRate={appState.app_settings.assumed_interest_rate}
      />

      <PocketDetail 
        isOpen={isPocketDetailOpen}
        onClose={() => setPocketDetailOpen(false)}
        transactions={user.transactions}
        balance={assets.pocket_balance}
      />

      <AddAccountModal 
        isOpen={isAddAccountOpen}
        onClose={() => setAddAccountOpen(false)}
        onSave={handleSaveCustomAccount}
        onDelete={handleDeleteCustomAccount}
        editingAccount={editingAccount}
      />

      {/* Confetti (Simple CSS Version) */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-[60] flex items-start justify-center pt-20">
            <div className="animate-bounce bg-yellow-400 text-white px-6 py-2 rounded-full shadow-lg font-bold">
                🎉 哇！金鹅吃饱了！
            </div>
        </div>
      )}
    </div>
  );
};

export default App;
