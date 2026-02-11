import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { LoginForm } from './sections/LoginForm';
import { Header } from './sections/Header';
import { Dashboard } from './sections/Dashboard';
import { FarmOrdersManager } from './sections/FarmOrdersManager';
import { FarmerView } from './sections/FarmerView';
import { UserManagement } from './sections/UserManagement';
import { AbsenceRequests } from './sections/AbsenceRequests';
import { LayoutDashboard, Package, Users, Calendar, Sprout } from 'lucide-react';

function AppContent() {
  const { user, loading, signIn, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="flex items-center gap-3">
          <Sprout className="w-8 h-8 text-emerald-500 animate-pulse" />
          <span className="text-white text-xl">Laden...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm onLogin={signIn} />;
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Header currentUser={user} onLogout={signOut} />

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
            {user.role === 'admin' && (
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
            <Dashboard currentUser={user} />
          </TabsContent>

          <TabsContent value="orders" className="mt-0">
            {user.role === 'admin' ? (
              <FarmOrdersManager currentUser={user} />
            ) : (
              <FarmerView currentUser={user} />
            )}
          </TabsContent>

          {user.role === 'admin' && (
            <TabsContent value="users" className="mt-0">
              <UserManagement currentUser={user} />
            </TabsContent>
          )}

          <TabsContent value="absences" className="mt-0">
            <AbsenceRequests currentUser={user} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
