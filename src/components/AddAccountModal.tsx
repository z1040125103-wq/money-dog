import React, { useState, useEffect } from 'react';
import { X, Landmark, TrendingUp, CircleDollarSign, GraduationCap, Wallet, Check, Trash2, AlertTriangle, Save } from 'lucide-react';
import { CustomAccount, AccountType } from '../types';

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (account: Omit<CustomAccount, 'id'> | CustomAccount) => void;
  onDelete?: (id: number) => void;
  editingAccount?: CustomAccount | null;
}

const TEMPLATES: { type: AccountType; name: string; icon: React.ReactNode; desc: string }[] = [
  { type: 'bank', name: '银行存款', icon: <Landmark size={24} />, desc: '定期存款、存单利息' },
  { type: 'fund', name: '基金理财', icon: <TrendingUp size={24} />, desc: '指数基金、股票型基金' },
  { type: 'gold', name: '黄金储备', icon: <CircleDollarSign size={24} />, desc: '金豆豆、积存金' },
  { type: 'education', name: '教育基金', icon: <GraduationCap size={24} />, desc: '为未来上学存的钱' },
  { type: 'other', name: '自定义账户', icon: <Wallet size={24} />, desc: '其他任何资产' },
];

export const AddAccountModal: React.FC<AddAccountModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  onDelete,
  editingAccount 
}) => {
  const [selectedType, setSelectedType] = useState<AccountType | null>(null);
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [note, setNote] = useState('');
  const [step, setStep] = useState(1); // 1: Select Type, 2: Details
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Initialize for Edit Mode vs Add Mode
  useEffect(() => {
    if (isOpen) {
      if (editingAccount) {
        // Edit Mode: Pre-fill data and skip to step 2
        setSelectedType(editingAccount.type);
        setName(editingAccount.name);
        setBalance(editingAccount.balance.toString());
        setNote(editingAccount.note || '');
        setStep(2);
        setShowDeleteConfirm(false);
      } else {
        // Add Mode: Reset
        setSelectedType(null);
        setName('');
        setBalance('');
        setNote('');
        setStep(1);
        setShowDeleteConfirm(false);
      }
    }
  }, [isOpen, editingAccount]);

  const handleTypeSelect = (type: AccountType) => {
    setSelectedType(type);
    const template = TEMPLATES.find(t => t.type === type);
    if (template) {
        setName(template.name);
        setNote(template.desc);
    }
    setStep(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType || !name) return;
    
    const accountData = {
      type: selectedType,
      name,
      balance: parseFloat(balance) || 0,
      note
    };

    if (editingAccount) {
        onSave({ ...accountData, id: editingAccount.id });
    } else {
        onSave(accountData);
    }
    onClose();
  };

  const handleDeleteClick = () => {
      setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
      if (editingAccount && onDelete) {
          onDelete(editingAccount.id);
          onClose();
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in relative">
        
        {/* Delete Confirmation Overlay */}
        {showDeleteConfirm && (
             <div className="absolute inset-0 z-20 bg-white/95 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                <div className="bg-red-100 p-4 rounded-full mb-4">
                    <AlertTriangle size={32} className="text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">确定删除该账户吗？</h3>
                <p className="text-slate-500 mb-8 max-w-xs">
                    删除后，该账户的资金记录将被移除，总资产也会相应减少。
                </p>
                <div className="flex gap-4 w-full max-w-xs">
                    <button 
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                    >
                        取消
                    </button>
                    <button 
                        onClick={handleConfirmDelete}
                        className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-200"
                    >
                        确认删除
                    </button>
                </div>
            </div>
        )}

        <div className="bg-slate-50 p-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800">
                {editingAccount ? '编辑账户' : (step === 1 ? '选择账户类型' : '设置账户详情')}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500">
                <X size={20} />
            </button>
        </div>

        <div className="p-6">
            {step === 1 ? (
                <div className="grid grid-cols-1 gap-3 max-h-[60vh] overflow-y-auto">
                    {TEMPLATES.map(t => (
                        <button
                            key={t.type}
                            onClick={() => handleTypeSelect(t.type)}
                            className="flex items-center gap-4 p-4 border rounded-xl hover:bg-indigo-50 hover:border-indigo-300 transition-all text-left group"
                        >
                            <div className="bg-white p-3 rounded-full border shadow-sm text-slate-600 group-hover:text-indigo-600">
                                {t.icon}
                            </div>
                            <div>
                                <div className="font-bold text-slate-800">{t.name}</div>
                                <div className="text-xs text-slate-500">{t.desc}</div>
                            </div>
                            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500">
                                <Check size={20} />
                            </div>
                        </button>
                    ))}
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-500 mb-1">账户名称</label>
                        <input 
                            type="text" 
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-800"
                            placeholder="例如：工行定期"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-500 mb-1">当前余额 (¥)</label>
                        <input 
                            type="number" 
                            step="0.01"
                            required
                            value={balance}
                            placeholder="0.00"
                            onChange={(e) => setBalance(e.target.value)}
                            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-xl text-slate-800"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-500 mb-1">备注说明 (可选)</label>
                        <input 
                            type="text" 
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-600"
                            placeholder="例如：2026年到期，教育金..."
                        />
                    </div>
                    
                    <div className="flex gap-3 pt-4">
                        {!editingAccount && (
                            <button 
                                type="button" 
                                onClick={() => setStep(1)}
                                className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-xl"
                            >
                                返回
                            </button>
                        )}
                        
                        {editingAccount && (
                             <button 
                                type="button" 
                                onClick={handleDeleteClick}
                                className="flex-1 py-3 border border-red-200 text-red-500 font-bold rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                            >
                                <Trash2 size={18} /> 删除
                            </button>
                        )}

                        <button 
                            type="submit" 
                            className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                        >
                            <Save size={18} /> {editingAccount ? '保存修改' : '确认添加'}
                        </button>
                    </div>
                </form>
            )}
        </div>
      </div>
    </div>
  );
};