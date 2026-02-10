import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toaster, toast } from 'sonner';
import type { User, FarmOrder, AbsenceRequest } from '@/types';
import { LoginForm } from '@/sections/LoginForm';
import { Dashboard } from '@/sections/Dashboard';
import { FarmOrdersManager } from '@/sections/FarmOrdersManager';
import { AbsenceRequests } from '@/sections/AbsenceRequests';
import { FarmerView } from '@/sections/FarmerView';
import { UserManagement } from '@/sections/UserManagement';
import { Header } from '@/sections/Header';
import './App.css';

const DEFAULT_USERS: User[] = [
  { id: '1', username: 'admin', password: 'opSucht2024!', role: 'admin', createdAt: new Date().toISOString() }
];

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<FarmOrder[]>([]);
  const [absences, setAbsences] = useState<AbsenceRequest[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const savedUser = localStorage.getItem('darknovaUser');
    const savedUsers = localStorage.getItem('darknovaUsers');
    const savedOrders = localStorage.getItem('darknovaOrders');
    const savedAbsences = localStorage.getItem('darknovaAbsences');
    
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedUsers) setUsers(JSON.parse(savedUsers));
    else {
      setUsers(DEFAULT_USERS);
      localStorage.setItem('darknovaUsers', JSON.stringify(DEFAULT_USERS));
    }
    if (savedOrders) setOrders(JSON.parse(savedOrders));
    if (savedAbsences) setAbsences(JSON.parse(savedAbsences));
  }, []);

  useEffect(() => {
    localStorage.setItem('darknovaUsers', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('darknovaOrders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('darknovaAbsences', JSON.stringify(absences));
  }, [absences]);

  const handleLogin = (username: string, password: string): boolean => {
    const foundUser = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('darknovaUser', JSON.stringify(foundUser));
      toast.success(`Willkommen zurück, ${foundUser.username}!`);
      return true;
    }
    toast.error('Falscher Benutzername oder Passwort!');
    return false;
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('darknovaUser');
    toast.info('Erfolgreich abgemeldet');
  };

  const addUser = (newUser: Omit<User, 'id' | 'createdAt'>) => {
    const user: User = {
      ...newUser,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setUsers([...users, user]);
    toast.success(`Benutzer ${user.username} erstellt!`);
  };

  const deleteUser = (userId: string) => {
    setUsers(users.filter(u => u.id !== userId));
    toast.success('Benutzer gelöscht');
  };

  const addOrder = (order: Omit<FarmOrder, 'id' | 'createdAt' | 'status'>) => {
    const newOrder: FarmOrder = {
      ...order,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: 'open',
    };
    
    if (order.autoAssign) {
      const farmers = users.filter(u => u.role === 'farmer').map(u => u.username);
      newOrder.assignedTo = farmers;
      newOrder.status = 'in_progress';
    }
    
    setOrders([...orders, newOrder]);
    toast.success(order.autoAssign ? 'Auftrag erstellt und allen Farmern zugewiesen!' : 'Farmauftrag erfolgreich erstellt!');
  };

  const updateOrder = (orderId: string, updates: Partial<FarmOrder>) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, ...updates } : o));
  };

  const deleteOrder = (orderId: string) => {
    setOrders(orders.filter(o => o.id !== orderId));
    toast.success('Auftrag gelöscht');
  };

  const addAbsence = (absence: Omit<AbsenceRequest, 'id' | 'requestedAt' | 'status'>) => {
    const newAbsence: AbsenceRequest = {
      ...absence,
      id: Date.now().toString(),
      requestedAt: new Date().toISOString(),
      status: 'pending',
    };
    setAbsences([...absences, newAbsence]);
    toast.success('Abwesenheitsantrag eingereicht!');
  };

  const updateAbsence = (absenceId: string, status: 'approved' | 'rejected') => {
    setAbsences(absences.map(a => a.id === absenceId ? { ...a, status } : a));
    toast.success(`Antrag ${status === 'approved' ? 'genehmigt' : 'abgelehnt'}`);
  };

  const claimOrder = (orderId: string) => {
    if (!user) return;
    const order = orders.find(o => o.id === orderId);
    if (order) {
      const assignedTo = order.assignedTo || [];
      if (!assignedTo.includes(user.username)) {
        assignedTo.push(user.username);
      }
      updateOrder(orderId, { assignedTo, status: 'in_progress' });
      toast.success('Auftrag übernommen!');
    }
  };

  const completeOrder = (orderId: string) => {
    updateOrder(orderId, { status: 'completed' });
    toast.success('Auftrag als erledigt markiert!');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 flex items-center justify-center p-4">
        <Toaster position="top-center" richColors />
        <LoginForm onLogin={handleLogin} />
      </div>
    );
  }

  const isAdmin = user.role === 'admin';
  const isFarmer = user.role === 'farmer' || isAdmin;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
      <Toaster position="top-center" richColors />
      <Header user={user} onLogout={handleLogout} />
      
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full bg-slate-900/80 border border-indigo-500/30 p-1 gap-1" 
            style={{ gridTemplateColumns: isAdmin ? 'repeat(5, 1fr)' : isFarmer ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)' }}>
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-white text-xs sm:text-sm px-1 sm:px-3">
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden">Dash</span>
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="orders" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-white text-xs sm:text-sm px-1 sm:px-3">
                <span className="hidden sm:inline">Aufträge</span>
                <span className="sm:hidden">Auftr.</span>
              </TabsTrigger>
            )}
            {isFarmer && (
              <TabsTrigger value="my-tasks" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-white text-xs sm:text-sm px-1 sm:px-3">
                <span className="hidden sm:inline">Meine Aufgaben</span>
                <span className="sm:hidden">Meine</span>
              </TabsTrigger>
            )}
            <TabsTrigger value="absence" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-white text-xs sm:text-sm px-1 sm:px-3">
              <span className="hidden sm:inline">Abwesenheit</span>
              <span className="sm:hidden">Abwes.</span>
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="users" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-white text-xs sm:text-sm px-1 sm:px-3">
                <span className="hidden sm:inline">Benutzer</span>
                <span className="sm:hidden">User</span>
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard orders={orders} absences={absences} user={user} users={users} onClaimOrder={claimOrder} />
          </TabsContent>

          {isAdmin && (
            <TabsContent value="orders">
              <FarmOrdersManager orders={orders} onAddOrder={addOrder} onDeleteOrder={deleteOrder} user={user} />
            </TabsContent>
          )}

          {isFarmer && (
            <TabsContent value="my-tasks">
              <FarmerView orders={orders} user={user} onClaimOrder={claimOrder} onCompleteOrder={completeOrder} />
            </TabsContent>
          )}

          <TabsContent value="absence">
            <AbsenceRequests absences={absences} user={user} onAddAbsence={addAbsence} onUpdateAbsence={updateAbsence} />
          </TabsContent>

          {isAdmin && (
            <TabsContent value="users">
              <UserManagement users={users} onAddUser={addUser} onDeleteUser={deleteUser} currentUser={user} />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
}

export default App;
