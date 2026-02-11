import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Users, Calendar, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import type { User } from '@/types';
import { useOrders } from '@/hooks/useOrders';
import { useUsers } from '@/hooks/useUsers';
import { useAbsences } from '@/hooks/useAbsences';

interface DashboardProps {
  currentUser: User;
}

export function Dashboard({ currentUser }: DashboardProps) {
  const { orders } = useOrders();
  const { users } = useUsers();
  const { absences } = useAbsences();

  const totalOrders = orders.length;
  const openOrders = orders.filter(o => o.status === 'open').length;

  const totalFarmers = users.filter(u => u.role === 'farmer').length;
  const pendingAbsences = absences.filter(a => a.status === 'pending').length;

  const myOrders = orders.filter(o =>
    o.userProgress.some(p => p.userId === currentUser.id)
  );
  const myActiveOrders = myOrders.filter(o => {
    const progress = o.userProgress.find(p => p.userId === currentUser.id);
    return progress && ['accepted', 'in_progress'].includes(progress.status);
  });
  const mySubmittedOrders = myOrders.filter(o => {
    const progress = o.userProgress.find(p => p.userId === currentUser.id);
    return progress && progress.status === 'submitted';
  });
  const myConfirmedOrders = myOrders.filter(o => {
    const progress = o.userProgress.find(p => p.userId === currentUser.id);
    return progress && progress.status === 'confirmed';
  });

  const pendingConfirmations = orders.flatMap(o =>
    o.userProgress.filter(p => p.status === 'submitted')
  ).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {currentUser.role === 'admin' ? (
          <>
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Gesamtaufträge</p>
                    <p className="text-2xl font-bold text-white">{totalOrders}</p>
                  </div>
                  <Package className="w-8 h-8 text-emerald-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Offene Aufträge</p>
                    <p className="text-2xl font-bold text-white">{openOrders}</p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Farmer</p>
                    <p className="text-2xl font-bold text-white">{totalFarmers}</p>
                  </div>
                  <Users className="w-8 h-8 text-emerald-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Abwesenheiten</p>
                    <p className="text-2xl font-bold text-white">{pendingAbsences}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            {pendingConfirmations > 0 && (
              <Card className="bg-slate-800 border-slate-700 border-l-4 border-l-purple-500 col-span-2 lg:col-span-4">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Ausstehende Bestätigungen</p>
                      <p className="text-2xl font-bold text-white">{pendingConfirmations}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <>
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Meine Aufträge</p>
                    <p className="text-2xl font-bold text-white">{myOrders.length}</p>
                  </div>
                  <Package className="w-8 h-8 text-emerald-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Aktiv</p>
                    <p className="text-2xl font-bold text-white">{myActiveOrders.length}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Abgegeben</p>
                    <p className="text-2xl font-bold text-white">{mySubmittedOrders.length}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Bestätigt</p>
                    <p className="text-2xl font-bold text-white">{myConfirmedOrders.length}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Recent Activity */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-lg">Aktuelle Aufträge</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-slate-400 text-center py-4">Keine Aufträge vorhanden</p>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 5).map(order => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                  <div>
                    <p className="text-white text-sm">
                      {order.items.length} Block(s) - Deadline: {new Date(order.deadline).toLocaleDateString('de-DE')}
                    </p>
                    <p className="text-slate-400 text-xs">
                      {order.userProgress.length} Farmer zugewiesen
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    order.status === 'open' ? 'bg-blue-600 text-white' :
                    order.status === 'in_progress' ? 'bg-yellow-600 text-white' :
                    'bg-green-600 text-white'
                  }`}>
                    {order.status === 'open' ? 'Offen' :
                     order.status === 'in_progress' ? 'In Bearbeitung' : 'Abgeschlossen'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
