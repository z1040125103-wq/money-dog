import React, { useState } from 'react';
import { Dream } from '../types';
import { Plus, Trash2, X, Trophy, AlertTriangle } from 'lucide-react';

interface DreamManagerProps {
  isOpen: boolean;
  onClose: () => void;
  dreams: Dream[];
  onAddDream: (dream: Omit<Dream, 'id'>) => void;
  onDeleteDream: (id: number) => void;
  totalDreamBalance: number;
}

export const DreamManager: React.FC<DreamManagerProps> = ({
  isOpen,
  onClose,
  dreams,
  onAddDream,
  onDeleteDream,
  totalDreamBalance
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newDream, setNewDream] = useState({ title: '', target: '' });
  
  // Custom Delete Confirmation State
  const [dreamToDelete, setDreamToDelete] = useState<number | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDream.title || !newDream.target) return;
    onAddDream({
      title: newDream.title,
      target_amount: parseFloat(newDream.target),
      current_amount: 0
    });
    setNewDream({ title: '', target: '' });
    setIsAdding(false);
  };

  const confirmDelete = () => {
    if (dreamToDelete !== null) {
        onDeleteDream(dreamToDelete);
        setDreamToDelete(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      {/* Main Container */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg h-[80vh] flex flex-col overflow-hidden animate-fade-in relative">
        
        {/* Internal Delete Confirmation Overlay */}
        {dreamToDelete !== null && (
            <div className="absolute inset-0 z-20 bg-white/95 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                <div className="bg-red-100 p-4 rounded-full mb-4">
                    <AlertTriangle size={32} className="text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">确定要放弃这个梦想吗？</h3>
                <p className="text-slate-500 mb-8 max-w-xs">
                    删除后，已经存入这个梦想的资金（¥{dreams.find(d => d.id === dreamToDelete)?.current_amount.toFixed(0)}）将会消失或需要重新分配。
                </p>
                <div className="flex gap-4 w-full max-w-xs">
                    <button 
                        onClick={() => setDreamToDelete(null)}
                        className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                    >
                        我再想想
                    </button>
                    <button 
                        onClick={confirmDelete}
                        className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-200"
                    >
                        确认放弃
                    </button>
                </div>
            </div>
        )}

        {/* Header */}
        <div className="bg-dream-50 p-6 border-b border-dream-100 flex justify-between items-center">
          <div>
             <h2 className="text-2xl font-bold text-dream-700 flex items-center gap-2">
                <Trophy size={24}/> 梦想清单
             </h2>
             <p className="text-dream-600 text-sm mt-1">当前梦想基金总额: ¥{totalDreamBalance.toFixed(2)}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-dream-200 rounded-full text-dream-700 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
           {dreams.length === 0 && !isAdding && (
               <div className="text-center py-10 text-slate-400">
                   你还没有写下任何梦想哦。<br/>点击下方按钮开始许愿！
               </div>
           )}

           {dreams.map(dream => {
               const progress = Math.min(100, (dream.current_amount / dream.target_amount) * 100);
               return (
                <div key={dream.id} className="bg-white border rounded-xl p-4 shadow-sm relative group hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3 pr-8">
                        <h3 className="font-bold text-slate-800 text-lg leading-tight">{dream.title}</h3>
                        <div className="text-right shrink-0">
                            <div className="text-[10px] uppercase text-slate-400 font-bold mb-1">已存 / 目标</div>
                            <div className="font-mono text-dream-600 whitespace-nowrap">
                                <span className="font-bold text-lg">¥{dream.current_amount.toFixed(0)}</span>
                                <span className="text-slate-400 text-sm mx-1">/</span>
                                <span className="text-slate-500 font-medium">¥{dream.target_amount}</span>
                            </div>
                        </div>
                    </div>
                    
                    <button 
                        onClick={(e) => { e.stopPropagation(); setDreamToDelete(dream.id); }}
                        className="absolute top-3 right-3 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                        title="删除梦想"
                    >
                        <Trash2 size={18} />
                    </button>

                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                        <div 
                            className="bg-dream-500 h-full rounded-full transition-all duration-500 relative"
                            style={{ width: `${Math.max(2, progress)}%` }}
                        >
                        </div>
                    </div>
                    <div className="text-right mt-1">
                        <span className="text-xs font-bold text-dream-500">{progress.toFixed(1)}%</span>
                    </div>
                </div>
               );
           })}

           {isAdding ? (
               <form onSubmit={handleAdd} className="bg-slate-50 p-4 rounded-xl border border-dashed border-dream-300">
                   <h3 className="font-bold text-slate-700 mb-3">许下一个新愿望 ✨</h3>
                   <div className="space-y-3">
                       <input 
                         type="text" 
                         placeholder="你的梦想是什么？" 
                         required
                         autoFocus
                         className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-dream-500 outline-none"
                         value={newDream.title}
                         onChange={e => setNewDream({...newDream, title: e.target.value})}
                       />
                       <div className="flex items-center gap-2">
                            <span className="text-slate-500 font-bold">¥</span>
                            <input 
                                type="number" 
                                placeholder="需要多少钱？" 
                                required
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-dream-500 outline-none"
                                value={newDream.target}
                                onChange={e => setNewDream({...newDream, target: e.target.value})}
                            />
                       </div>
                       <div className="flex gap-2 mt-2">
                           <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-2 text-slate-500 font-bold hover:bg-slate-200 rounded-lg">取消</button>
                           <button type="submit" className="flex-1 py-2 bg-dream-500 text-white font-bold rounded-lg hover:bg-dream-600">确认添加</button>
                       </div>
                   </div>
               </form>
           ) : (
               <button 
                onClick={() => setIsAdding(true)}
                className="w-full py-4 border-2 border-dashed border-dream-300 rounded-xl text-dream-600 font-bold flex items-center justify-center gap-2 hover:bg-dream-50 transition-colors"
               >
                   <Plus size={20} /> 添加新梦想
               </button>
           )}
        </div>
      </div>
    </div>
  );
};