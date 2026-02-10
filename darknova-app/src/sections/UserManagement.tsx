import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Users, 
  Plus, 
  Trash2, 
  User, 
  Shield, 
  Eye,
  Crown
} from 'lucide-react';
import type { User, UserRole } from '@/types';

interface UserManagementProps {
  users: User[];
  onAddUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  onDeleteUser: (userId: string) => void;
  currentUser: User;
}

export function UserManagement({ users, onAddUser, onDeleteUser, currentUser }: UserManagementProps) {
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('farmer');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUsername.trim() || !newPassword.trim()) {
      return;
    }

    onAddUser({
      username: newUsername.trim(),
      password: newPassword.trim(),
      role: newRole,
      createdBy: currentUser.username,
    });

    setNewUsername('');
    setNewPassword('');
    setNewRole('farmer');
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin': return <Crown className="w-4 h-4 text-red-400" />;
      case 'farmer': return <User className="w-4 h-4 text-indigo-400" />;
      case 'viewer': return <Eye className="w-4 h-4 text-blue-400" />;
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin': 
        return <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full border border-red-500/30">Admin</span>;
      case 'farmer': 
        return <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-xs rounded-full border border-indigo-500/30">Farmer</span>;
      case 'viewer': 
        return <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full border border-blue-500/30">Viewer</span>;
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'farmer': return 'Farmer';
      case 'viewer': return 'Viewer (nur Ansicht)';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('de-DE');
  };

  const sortedUsers = [...users].sort((a, b) => {
    // Sort by role: admin first, then farmer, then viewer
    const roleOrder = { admin: 0, farmer: 1, viewer: 2 };
    if (roleOrder[a.role] !== roleOrder[b.role]) {
      return roleOrder[a.role] - roleOrder[b.role];
    }
    return a.username.localeCompare(b.username);
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Create User Form */}
      <Card className="bg-slate-900/80 border-indigo-500/20">
        <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-4">
          <CardTitle className="text-base sm:text-lg text-white flex items-center gap-2">
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
            Neuen Benutzer erstellen
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white text-sm flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-400" />
                  Benutzername
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="z.B. farmer123"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-600 text-sm"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4 text-indigo-400" />
                  Passwort
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Sicheres Passwort"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-600 text-sm"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role" className="text-white text-sm">Rolle</Label>
              <Select value={newRole} onValueChange={(value: UserRole) => setNewRole(value)}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="admin" className="text-white hover:bg-slate-700">
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-red-400" />
                      Administrator (alle Rechte)
                    </div>
                  </SelectItem>
                  <SelectItem value="farmer" className="text-white hover:bg-slate-700">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-indigo-400" />
                      Farmer (Aufträge annehmen & erledigen)
                    </div>
                  </SelectItem>
                  <SelectItem value="viewer" className="text-white hover:bg-slate-700">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-blue-400" />
                      Viewer (nur Ansicht)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
            >
              <Plus className="w-4 h-4 mr-2" />
              Benutzer erstellen
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card className="bg-slate-900/80 border-indigo-500/20">
        <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-4">
          <CardTitle className="text-base sm:text-lg text-white flex items-center gap-2">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
            Benutzerliste
            <span className="text-xs sm:text-sm text-slate-400 font-normal">
              ({users.length} Benutzer)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          {users.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <Users className="w-10 h-10 sm:w-12 sm:h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">Noch keine Benutzer vorhanden</p>
            </div>
          ) : (
            <ScrollArea className="h-auto max-h-64 sm:max-h-96">
              <div className="space-y-2">
                {sortedUsers.map((user) => (
                  <div 
                    key={user.id} 
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg border gap-2 ${
                      user.id === currentUser.id 
                        ? 'bg-indigo-950/30 border-indigo-500/30' 
                        : 'bg-slate-800/50 border-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 ${
                        user.role === 'admin' ? 'bg-red-500/20' : 
                        user.role === 'farmer' ? 'bg-indigo-500/20' : 'bg-blue-500/20'
                      }`}>
                        {getRoleIcon(user.role)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-white font-medium text-sm truncate">{user.username}</span>
                          {user.id === currentUser.id && (
                            <span className="text-xs px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded-full">
                              Du
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {getRoleBadge(user.role)}
                          <span className="text-xs text-slate-500">
                            Erstellt: {formatDate(user.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {user.id !== currentUser.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteUser(user.id)}
                        className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 shrink-0 self-end sm:self-auto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Role Info */}
      <Card className="bg-slate-900/80 border-indigo-500/20">
        <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-4">
          <CardTitle className="text-base sm:text-lg text-white">Rollenübersicht</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-red-950/20 rounded-lg border border-red-500/20">
              <Crown className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-medium text-sm">Administrator</p>
                <p className="text-slate-400 text-xs mt-1">
                  Kann Aufträge erstellen, Benutzer verwalten, Abwesenheitsanträge genehmigen und alle Funktionen nutzen.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-indigo-950/20 rounded-lg border border-indigo-500/20">
              <User className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-medium text-sm">Farmer</p>
                <p className="text-slate-400 text-xs mt-1">
                  Kann Aufträge annehmen, als erledigt markieren und Abwesenheitsanträge stellen.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-blue-950/20 rounded-lg border border-blue-500/20">
              <Eye className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-medium text-sm">Viewer</p>
                <p className="text-slate-400 text-xs mt-1">
                  Kann nur Aufträge und Statistiken einsehen, aber keine Aktionen durchführen.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
