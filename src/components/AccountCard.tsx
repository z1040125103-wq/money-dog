import React from 'react';
import { LucideIcon, ChevronRight } from 'lucide-react';

interface AccountCardProps {
  title: string;
  balance: number;
  colorTheme: 'goose' | 'dream' | 'pocket';
  icon: React.ReactNode; // Changed to Node to allow custom icons
  secondaryInfo?: React.ReactNode;
  onClick: () => void;
  backgroundImage?: string;
}

export const AccountCard: React.FC<AccountCardProps> = ({
  title,
  balance,
  colorTheme,
  icon,
  secondaryInfo,
  onClick,
  backgroundImage
}) => {
  const themeClasses = {
    goose: 'bg-goose-50 border-goose-100 text-goose-700 hover:shadow-goose-100',
    dream: 'bg-dream-50 border-dream-100 text-dream-700 hover:shadow-dream-100',
    pocket: 'bg-pocket-50 border-pocket-100 text-pocket-700 hover:shadow-pocket-100',
  };

  return (
    <div 
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl border p-6 shadow-sm transition-all cursor-pointer hover:scale-[1.02] hover:shadow-lg ${themeClasses[colorTheme]}`}
    >
      {backgroundImage && (
        <div 
          className="absolute inset-0 opacity-10 bg-cover bg-center z-0"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}
      
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold uppercase tracking-wider opacity-80">{title}</h3>
          <div className="flex items-center gap-2">
             <div className={`p-2 rounded-full bg-white/50 backdrop-blur-sm shadow-sm`}>
               {icon}
             </div>
          </div>
        </div>

        <div>
          <div className="text-3xl font-extrabold mb-1">
            ¥{balance.toFixed(2)}
          </div>
          {secondaryInfo && (
            <div className="text-sm opacity-80 font-medium mb-3 min-h-[1.25rem]">
              {secondaryInfo}
            </div>
          )}
          
          <div className="flex items-center text-xs font-bold uppercase tracking-widest opacity-60 mt-4 group">
             点击查看详情 <ChevronRight size={14} className="ml-1 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </div>
  );
};