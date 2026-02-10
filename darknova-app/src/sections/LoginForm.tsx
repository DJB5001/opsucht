import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, User, Sparkles } from 'lucide-react';

interface LoginFormProps {
  onLogin: (username: string, password: string) => boolean;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="relative inline-block">
          <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto relative">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 rounded-2xl rotate-3 opacity-50 blur-lg"></div>
            <div className="relative w-full h-full bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 rounded-2xl flex items-center justify-center shadow-2xl border border-indigo-400/30">
              <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-white text-[10px] sm:text-xs font-bold">DN</span>
          </div>
        </div>
        
        <h1 className="mt-6 text-3xl sm:text-4xl font-black text-white tracking-tight">
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
            DARK
          </span>
          <span className="text-white">NOVA</span>
        </h1>
        <p className="mt-2 text-indigo-300/70 text-xs sm:text-sm tracking-widest uppercase">
          Urbanex | Clan | UBX | Opsucht
        </p>
        <p className="mt-1 text-slate-500 text-xs">
          Farm Management System
        </p>
      </div>

      <Card className="border-indigo-500/30 bg-slate-900/80 backdrop-blur-xl shadow-2xl shadow-indigo-500/10">
        <CardHeader className="pb-4 px-4 sm:px-6">
          <CardTitle className="text-lg sm:text-xl text-white text-center">Anmelden</CardTitle>
          <CardDescription className="text-slate-400 text-center text-sm">
            Melde dich mit deinen Zugangsdaten an
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-white flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-indigo-400" /> Benutzername
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Dein Benutzername"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-600 focus:border-indigo-500"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-indigo-400" /> Passwort
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-600 focus:border-indigo-500"
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-5 sm:py-6"
            >
              Anmelden
            </Button>
          </form>
          
          <div className="mt-6 p-3 sm:p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <p className="text-xs text-slate-500 text-center mb-2">Standard-Zugang:</p>
            <div className="text-center text-sm">
              <span className="text-indigo-400 font-semibold">admin</span>
              <span className="text-slate-600 mx-2">/</span>
              <span className="text-slate-400">opSucht2024!</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <p className="text-center text-slate-600 text-xs mt-6">
        DARKNOVA Farm Management v2.0
      </p>
    </div>
  );
}
