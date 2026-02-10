import { Button } from '@/components/ui/button';
import { User, LogOut, Sparkles } from 'lucide-react';
import type { User as UserType } from '@/types';

interface HeaderProps {
  user: UserType;
  onLogout: () => void;
}

export function Header({ user, onLogout }: HeaderProps) {
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[10px] sm:text-xs rounded-full border border-red-500/30 font-medium">Admin</span>;
      case 'farmer':
        return <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-[10px] sm:text-xs rounded-full border border-indigo-500/30 font-medium">Farmer</span>;
      default:
        return <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] sm:text-xs rounded-full border border-blue-500/30 font-medium">Viewer</span>;
    }
  };

  return (
    <header className="bg-slate-900/90 backdrop-blur-xl border-b border-indigo-500/20 sticky top-0 z-50">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="relative">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 border border-indigo-400/30">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-sm sm:text-lg font-black text-white tracking-tight">
                <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">URBAN</span>
                <span className="text-white">EX</span>
              </h1>
              <p className="text-[8px] sm:text-[10px] text-indigo-400/60 tracking-wider uppercase">Farm Management</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-9 sm:h-9 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center border border-slate-600">
                <User className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-400" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-white">{user.username}</p>
                {getRoleBadge(user.role)}
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onLogout}
              className="border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white text-xs sm:text-sm px-2 sm:px-3"
            >
              <LogOut className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
              <span className="hidden sm:inline">Abmelden</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
