import React, { useState, useEffect } from 'react';
import { Dream } from '../types';
import { Plus, Trash2, X, Trophy, AlertTriangle, Edit2, Save } from 'lucide-react';

interface DreamManagerProps {
  isOpen: boolean;
  onClose: () => void;
  dreams: Dream[];
  onAddDream: (dream: Omit<Dream, 'id'>) => void;
  onUpdateDream: (dream: Dream) => void;
  onDeleteDream: (id: number) => void;
  totalDreamBalance: number;
}

export const DreamManager: React.FC<DreamManagerProps> = ({
  isOpen,
  onClose,
  dreams,
  onAddDream,
  onUpdateDream,
  onDeleteDream,
  totalDreamBalance
}) => {
  // Mode state: 'view', 'add', 'edit'
  const [viewMode, setViewMode] = useState<'view' | 'add' | 'edit'>('view');
  
  // Form state
  const [formData, setFormData] = useState({ title: '', target: '', imageUrl: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Custom Delete Confirmation State
  const [dreamToDelete, setDreamToDelete] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen && viewMode === 'view') {
        // Reset form when opening or going back to view
        setFormData({ title: '', target: '', imageUrl: '' });
        setEditingId(null);
    }
  }, [isOpen, viewMode]);

  const handleStartAdd = () => {
      setFormData({ title: '', target: '', imageUrl: '' });
      setEditingId(null);
      setViewMode('add');
  };

  const handleStartEdit = (dream: Dream) => {
      setFormData({
          title: dream.title,
          target: dream.target_amount.toString(),
          imageUrl: dream.image_url || ''
      });
      setEditingId(dream.id);
      setViewMode('edit');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.target) return;
    
    if (viewMode === 'add') {
        onAddDream({
            title: formData.title,
            target_amount: parseFloat(formData.target),
            current_amount: 0,
            image_url: formData.imageUrl || undefined
        });
    } else if (viewMode === 'edit' && editingId !== null) {
        const existingDream = dreams.find(d => d.id === editingId);
        if (existingDream) {
            onUpdateDream({
                ...existingDream,
                title: formData.title,
                target_amount: parseFloat(formData.target),
                image_url: formData.imageUrl || undefined
            });
        }
    }
    
    setViewMode('view');
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
                <Trophy size={24}/> {viewMode === 'add' ? '添加梦想' : viewMode === 'edit' ? '编辑梦想' : '梦想清单'}
             </h2>
             {viewMode === 'view' && (
                 <p className="text-dream-600 text-sm mt-1">当前梦想基金总额: ¥{totalDreamBalance.toFixed(2)}</p>
             )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-dream-200 rounded-full text-dream-700 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
           {viewMode === 'view' && dreams.length === 0 && (
               <div className="text-center py-10 text-slate-400">
                   你还没有写下任何梦想哦。<br/>点击下方按钮开始许愿！
               </div>
           )}

           {viewMode === 'view' ? (
               /* View List */
               <>
                   {dreams.map(dream => {
                       const progress = Math.min(100, (dream.current_amount / dream.target_amount) * 100);
                       return (
                        <div key={dream.id} className="bg-white border rounded-xl p-4 shadow-sm relative group hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-3 pr-16">
                                <div className="flex items-start gap-3">
                                    {dream.image_url && (
                                        <div className="w-12 h-12 rounded-lg bg-cover bg-center shrink-0 border border-slate-100" style={{backgroundImage: `url(${dream.image_url})`}} />
                                    )}
                                    <h3 className="font-bold text-slate-800 text-lg leading-tight">{dream.title}</h3>
                                </div>
                                <div className="text-right shrink-0">
                                    <div className="text-[10px] uppercase text-slate-400 font-bold mb-1">已存 / 目标</div>
                                    <div className="font-mono text-dream-600 whitespace-nowrap">
                                        <span className="font-bold text-lg">¥{dream.current_amount.toFixed(0)}</span>
                                        <span className="text-slate-400 text-sm mx-1">/</span>
                                        <span className="text-slate-500 font-medium">¥{dream.target_amount}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="absolute top-3 right-3 flex gap-1">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleStartEdit(dream); }}
                                    className="p-2 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-full transition-all"
                                    title="编辑"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setDreamToDelete(dream.id); }}
                                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                    title="删除"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden mt-2">
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
                   
                   <button 
                    onClick={handleStartAdd}
                    className="w-full py-4 border-2 border-dashed border-dream-300 rounded-xl text-dream-600 font-bold flex items-center justify-center gap-2 hover:bg-dream-50 transition-colors mt-4"
                   >
                       <Plus size={20} /> 添加新梦想
                   </button>
               </>
           ) : (
               /* Add/Edit Form */
               <form onSubmit={handleSubmit} className="bg-slate-50 p-4 rounded-xl border border-dashed border-dream-300 h-full flex flex-col">
                   <h3 className="font-bold text-slate-700 mb-4 text-center">
                       {viewMode === 'add' ? '许下一个新愿望 ✨' : '修改梦想信息 📝'}
                   </h3>
                   <div className="space-y-4 flex-1">
                       <div>
                           <label className="block text-xs font-bold text-slate-500 mb-1">梦想名称</label>
                           <input 
                             type="text" 
                             placeholder="例如：乐高城堡、游乐园门票" 
                             required
                             autoFocus
                             className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-dream-500 outline-none"
                             value={formData.title}
                             onChange={e => setFormData({...formData, title: e.target.value})}
                           />
                       </div>
                       
                       <div>
                           <label className="block text-xs font-bold text-slate-500 mb-1">目标金额 (¥)</label>
                           <input 
                                type="number" 
                                placeholder="需要多少钱？" 
                                required
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-dream-500 outline-none font-mono"
                                value={formData.target}
                                onChange={e => setFormData({...formData, target: e.target.value})}
                            />
                       </div>

                       <div>
                           <label className="block text-xs font-bold text-slate-500 mb-1">梦想图片链接 (可选)</label>
                           <input 
                                type="url" 
                                placeholder="粘贴图片网址 (http://...)" 
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-dream-500 outline-none text-sm"
                                value={formData.imageUrl}
                                onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                            />
                           <p className="text-[10px] text-slate-400 mt-1">
                               提示: 可以在网上找到图片，右键选择"复制图片地址"然后粘贴在这里。
                           </p>
                       </div>
                       
                       {formData.imageUrl && (
                           <div className="mt-2 text-center">
                               <div className="text-xs text-slate-400 mb-1">预览</div>
                               <img src={formData.imageUrl} alt="Preview" className="h-32 mx-auto rounded-lg object-cover border border-slate-200 shadow-sm" onError={(e) => (e.target as HTMLImageElement).style.display = 'none'} />
                           </div>
                       )}
                   </div>

                   <div className="flex gap-3 mt-6">
                       <button type="button" onClick={() => setViewMode('view')} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-200 rounded-xl transition-colors">取消</button>
                       <button type="submit" className="flex-1 py-3 bg-dream-500 text-white font-bold rounded-xl hover:bg-dream-600 shadow-lg shadow-dream-200 flex items-center justify-center gap-2">
                           <Save size={18} /> {viewMode === 'add' ? '确认添加' : '保存修改'}
                       </button>
                   </div>
               </form>
           )}
        </div>
      </div>
    </div>
  );
};