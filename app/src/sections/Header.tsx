import { Button } from '@/components/ui/button';
import { Sprout, LogOut, User } from 'lucide-react';
import type { User as UserType } from '@/types';

interface HeaderProps {
  currentUser: UserType;
  onLogout: () => Promise<void>;
}

export function Header({ currentUser, onLogout }: HeaderProps) {
  return (
    <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-white">DARKNOVA</h1>
              <p className="text-xs text-slate-400">Farm Management</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-slate-400" />
              </div>
              <div className="hidden sm:block">
                <p className="text-white font-medium">{currentUser.username}</p>
                <p className="text-xs text-slate-400 capitalize">{currentUser.role}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="text-slate-400 hover:text-white hover:bg-slate-700"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">Abmelden</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
