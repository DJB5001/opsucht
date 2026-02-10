import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoginForm } from './sections/LoginForm';
import { Header } from './sections/Header';
import { Dashboard } from './sections/Dashboard';
import { FarmOrdersManager } from './sections/FarmOrdersManager';
import { FarmerView } from './sections/FarmerView';
import { UserManagement } from './sections/UserManagement';
import { AbsenceRequests } from './sections/AbsenceRequests';
import type { User, FarmOrder, AbsenceRequest, UserOrderProgress } from './types';
import { LayoutDashboard, Package, Users, Calendar, Sprout } from 'lucide-react';

const DEFAULT_USERS: User[] = [
  { id: '1', username: 'admin', password: 'opSucht2024!', role: 'admin', createdAt: new Date().toISOString() }
];

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<FarmOrder[]>([]);
  const [absences, setAbsences] = useState<AbsenceRequest[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    const savedUsers = localStorage.getItem('users');
    const savedOrders = localStorage.getItem('orders');
    const savedAbsences = localStorage.getItem('absences');

    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    } else {
      setUsers(DEFAULT_USERS);
      localStorage.setItem('users', JSON.stringify(DEFAULT_USERS));
    }

    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }

    if (savedAbsences) {
      setAbsences(JSON.parse(savedAbsences));
    }

    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }

    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('users', JSON.stringify(users));
    }
  }, [users, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('orders', JSON.stringify(orders));
    }
  }, [orders, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('absences', JSON.stringify(absences));
    }
  }, [absences, isLoaded]);

  const handleLogin = (username: string, password: string): boolean => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setActiveTab('dashboard');
  };

  const handleCreateUser = (username: string, password: string, role: User['role']) => {
    const newUser: User = {
      id: Date.now().toString(),
      username,
      password,
      role,
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.id
    };
    setUsers([...users, newUser]);
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(u => u.id !== userId));
  };

  const handleCreateOrder = (orderData: Omit<FarmOrder, 'id' | 'createdAt' | 'userProgress'>) => {
    const farmers = users.filter(u => u.role === 'farmer');
    let userProgress: UserOrderProgress[] = [];

    if (orderData.autoAssign) {
      userProgress = farmers.map(farmer => ({
        userId: farmer.id,
        status: 'accepted',
        completedItems: []
      }));
    }

    const newOrder: FarmOrder = {
      ...orderData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      userProgress
    };

    setOrders([...orders, newOrder]);
  };

  const handleDeleteOrder = (orderId: string) => {
    setOrders(orders.filter(o => o.id !== orderId));
  };

  const handleConfirmOrder = (orderId: string, userId: string) => {
    setOrders(orders.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          userProgress: order.userProgress.map(progress => {
            if (progress.userId === userId) {
              return {
                ...progress,
                status: 'confirmed',
                confirmedAt: new Date().toISOString(),
                confirmedBy: currentUser?.id
              };
            }
            return progress;
          })
        };
      }
      return order;
    }));
  };

  const handleAcceptOrder = (orderId: string) => {
    if (!currentUser) return;

    setOrders(orders.map(order => {
      if (order.id === orderId) {
        const existingProgress = order.userProgress.find(p => p.userId === currentUser.id);
        if (!existingProgress) {
          return {
            ...order,
            userProgress: [...order.userProgress, {
              userId: currentUser.id,
              status: 'accepted',
              completedItems: []
            }]
          };
        }
      }
      return order;
    }));
  };

  const handleUpdateProgress = (orderId: string, blockId: string, amount: number) => {
    if (!currentUser) return;

    setOrders(orders.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          userProgress: order.userProgress.map(progress => {
            if (progress.userId === currentUser.id) {
              const existingItem = progress.completedItems.find(ci => ci.blockId === blockId);
              let newCompletedItems;
              
              if (existingItem) {
                newCompletedItems = progress.completedItems.map(ci => 
                  ci.blockId === blockId ? { ...ci, amount } : ci
                );
              } else {
                newCompletedItems = [...progress.completedItems, { blockId, amount }];
              }

              const totalRequired = order.items.reduce((sum, item) => sum + item.amount, 0);
              const totalCompleted = newCompletedItems.reduce((sum, item) => sum + item.amount, 0);
              
              return {
                ...progress,
                completedItems: newCompletedItems,
                status: totalCompleted >= totalRequired ? 'in_progress' : 'accepted'
              };
            }
            return progress;
          })
        };
      }
      return order;
    }));
  };

  const handleSubmitOrder = (orderId: string) => {
    if (!currentUser) return;

    setOrders(orders.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          userProgress: order.userProgress.map(progress => {
            if (progress.userId === currentUser.id) {
              return {
                ...progress,
                status: 'submitted',
                submittedAt: new Date().toISOString()
              };
            }
            return progress;
          })
        };
      }
      return order;
    }));
  };

  const handleCreateAbsence = (startDate: string, endDate: string, reason: string) => {
    if (!currentUser) return;

    const newAbsence: AbsenceRequest = {
      id: Date.now().toString(),
      userId: currentUser.id,
      username: currentUser.username,
      startDate,
      endDate,
      reason,
      status: 'pending',
      requestedAt: new Date().toISOString()
    };

    setAbsences([...absences, newAbsence]);
  };

  const handleApproveAbsence = (requestId: string) => {
    setAbsences(absences.map(a => 
      a.id === requestId ? { ...a, status: 'approved' } : a
    ));
  };

  const handleRejectAbsence = (requestId: string) => {
    setAbsences(absences.map(a => 
      a.id === requestId ? { ...a, status: 'rejected' } : a
    ));
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="flex items-center gap-3">
          <Sprout className="w-8 h-8 text-emerald-500 animate-pulse" />
          <span className="text-white text-xl">Laden...</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Header currentUser={currentUser} onLogout={handleLogout} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-slate-800 mb-6">
            <TabsTrigger value="dashboard" className="text-white data-[state=active]:bg-emerald-600 text-xs sm:text-sm">
              <LayoutDashboard className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden">Dash</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="text-white data-[state=active]:bg-emerald-600 text-xs sm:text-sm">
              <Package className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Aufträge</span>
              <span className="sm:hidden">Auf</span>
            </TabsTrigger>
            {currentUser.role === 'admin' && (
              <TabsTrigger value="users" className="text-white data-[state=active]:bg-emerald-600 text-xs sm:text-sm">
                <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Benutzer</span>
                <span className="sm:hidden">User</span>
              </TabsTrigger>
            )}
            <TabsTrigger value="absences" className="text-white data-[state=active]:bg-emerald-600 text-xs sm:text-sm">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Abwesenheit</span>
              <span className="sm:hidden">Abw</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-0">
            <Dashboard 
              orders={orders} 
              users={users} 
              absences={absences}
              currentUser={currentUser}
            />
          </TabsContent>

          <TabsContent value="orders" className="mt-0">
            {currentUser.role === 'admin' ? (
              <FarmOrdersManager
                orders={orders}
                users={users}
                currentUser={currentUser}
                onCreateOrder={handleCreateOrder}
                onDeleteOrder={handleDeleteOrder}
                onConfirmOrder={handleConfirmOrder}
              />
            ) : (
              <FarmerView
                orders={orders}
                currentUser={currentUser}
                onAcceptOrder={handleAcceptOrder}
                onUpdateProgress={handleUpdateProgress}
                onSubmitOrder={handleSubmitOrder}
              />
            )}
          </TabsContent>

          {currentUser.role === 'admin' && (
            <TabsContent value="users" className="mt-0">
              <UserManagement
                users={users}
                orders={orders}
                absences={absences}
                currentUser={currentUser}
                onCreateUser={handleCreateUser}
                onDeleteUser={handleDeleteUser}
              />
            </TabsContent>
          )}

          <TabsContent value="absences" className="mt-0">
            <AbsenceRequests
              requests={absences}
              currentUser={currentUser}
              onCreateRequest={handleCreateAbsence}
              onApproveRequest={currentUser.role === 'admin' ? handleApproveAbsence : undefined}
              onRejectRequest={currentUser.role === 'admin' ? handleRejectAbsence : undefined}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default App;
