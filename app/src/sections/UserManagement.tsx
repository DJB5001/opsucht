import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { UserPlus, Trash2, Users, Eye } from 'lucide-react';
import type { User, FarmOrder, AbsenceRequest } from '@/types';
import { UserProfile } from './UserProfile';

interface UserManagementProps {
  users: User[];
  orders: FarmOrder[];
  absences: AbsenceRequest[];
  currentUser: User;
  onCreateUser: (username: string, password: string, role: User['role']) => void;
  onDeleteUser: (userId: string) => void;
}

export function UserManagement({ users, orders, absences, currentUser, onCreateUser, onDeleteUser }: UserManagementProps) {
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<User['role']>('farmer');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const handleCreateUser = () => {
    if (!newUsername || !newPassword) return;
    onCreateUser(newUsername, newPassword, newRole);
    setNewUsername('');
    setNewPassword('');
    setNewRole('farmer');
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      onDeleteUser(userToDelete.id);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const openUserProfile = (user: User) => {
    setSelectedUser(user);
    setIsProfileOpen(true);
  };

  const filteredUsers = users.filter(u => u.id !== currentUser.id);

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-emerald-500" />
            Neuen Benutzer erstellen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              placeholder="Benutzername"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
            />
            <Input
              type="text"
              placeholder="Passwort"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
            />
            <Select value={newRole} onValueChange={(v) => setNewRole(v as User['role'])}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Rolle wählen" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="farmer" className="text-white">Farmer</SelectItem>
                <SelectItem value="viewer" className="text-white">Viewer</SelectItem>
                <SelectItem value="admin" className="text-white">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleCreateUser}
            disabled={!newUsername || !newPassword}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Benutzer erstellen
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-500" />
            Benutzerliste
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredUsers.length === 0 ? (
              <p className="text-slate-400 text-center py-4">Keine Benutzer vorhanden</p>
            ) : (
              filteredUsers.map(user => (
                <div
                  key={user.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-700 rounded-lg gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">{user.username[0].toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{user.username}</p>
                      <div className="flex items-center gap-2">
                        <Badge className={
                          user.role === 'admin' ? 'bg-red-600 text-white' :
                          user.role === 'farmer' ? 'bg-emerald-600 text-white' :
                          'bg-blue-600 text-white'
                        }>
                          {user.role}
                        </Badge>
                        <span className="text-slate-400 text-xs">
                          Erstellt: {new Date(user.createdAt).toLocaleDateString('de-DE')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openUserProfile(user)}
                      className="border-slate-600 text-white hover:bg-slate-600 flex-1 sm:flex-none"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Profil
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClick(user)}
                      className="flex-1 sm:flex-none"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Löschen
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Benutzer löschen</DialogTitle>
            <DialogDescription className="text-slate-400">
              Möchtest du den Benutzer "{userToDelete?.username}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="border-slate-600 text-white hover:bg-slate-700"
            >
              Abbrechen
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
            >
              Löschen
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* User Profile Dialog */}
      {selectedUser && (
        <UserProfile
          user={selectedUser}
          orders={orders}
          absences={absences}
          isOpen={isProfileOpen}
          onClose={() => {
            setIsProfileOpen(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
}
