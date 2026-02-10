import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ClipboardList, 
  Users, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Package
} from 'lucide-react';
import type { FarmOrder, AbsenceRequest, User } from '@/types';

interface DashboardProps {
  orders: FarmOrder[];
  absences: AbsenceRequest[];
  user: User;
  users: User[];
  onClaimOrder: (orderId: string) => void;
}

export function Dashboard({ orders, absences, user, users, onClaimOrder }: DashboardProps) {
  const isAdmin = user.role === 'admin';
  
  const stats = {
    totalOrders: orders.length,
    openOrders: orders.filter(o => o.status === 'open').length,
    inProgressOrders: orders.filter(o => o.status === 'in_progress').length,
    completedOrders: orders.filter(o => o.status === 'completed').length,
    totalFarmers: users.filter(u => u.role === 'farmer').length,
    pendingAbsences: absences.filter(a => a.status === 'pending').length,
  };

  const myOrders = orders.filter(o => o.assignedTo?.includes(user.username));
  const availableOrders = orders.filter(o => o.status === 'open' && !o.assignedTo?.includes(user.username));

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <Clock className="w-4 h-4 text-blue-400" />;
      case 'in_progress': return <TrendingUp className="w-4 h-4 text-yellow-400" />;
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'overdue': return <AlertCircle className="w-4 h-4 text-red-400" />;
      default: return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return 'Offen';
      case 'in_progress': return 'In Bearbeitung';
      case 'completed': return 'Abgeschlossen';
      case 'overdue': return 'Überfällig';
      default: return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'in_progress': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'overdue': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('de-DE');
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <Card className="bg-slate-900/80 border-indigo-500/20">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-slate-400">Gesamtaufträge</p>
                <p className="text-xl sm:text-3xl font-bold text-white">{stats.totalOrders}</p>
              </div>
              <ClipboardList className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-900/80 border-indigo-500/20">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-slate-400">Offen</p>
                <p className="text-xl sm:text-3xl font-bold text-white">{stats.openOrders}</p>
              </div>
              <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-900/80 border-indigo-500/20">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-slate-400">In Bearbeitung</p>
                <p className="text-xl sm:text-3xl font-bold text-white">{stats.inProgressOrders}</p>
              </div>
              <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-900/80 border-indigo-500/20">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-slate-400">Abgeschlossen</p>
                <p className="text-xl sm:text-3xl font-bold text-white">{stats.completedOrders}</p>
              </div>
              <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats for Admin */}
      {isAdmin && (
        <div className="grid grid-cols-2 gap-2 sm:gap-4">
          <Card className="bg-slate-900/80 border-indigo-500/20">
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-slate-400">Farmer</p>
                  <p className="text-xl sm:text-2xl font-bold text-white">{stats.totalFarmers}</p>
                </div>
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-900/80 border-indigo-500/20">
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-slate-400">Abwesenheitsanträge</p>
                  <p className="text-xl sm:text-2xl font-bold text-white">{stats.pendingAbsences}</p>
                </div>
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Available Orders for Farmers */}
      {(user.role === 'farmer' || isAdmin) && availableOrders.length > 0 && (
        <Card className="bg-slate-900/80 border-indigo-500/20">
          <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-4">
            <CardTitle className="text-base sm:text-lg text-white flex items-center gap-2">
              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
              Verfügbare Aufträge
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <ScrollArea className="h-auto max-h-48 sm:max-h-64">
              <div className="space-y-2">
                {availableOrders.slice(0, 5).map((order) => (
                  <div 
                    key={order.id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-2 sm:p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 gap-2"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getStatusIcon(order.status)}
                        <span className="text-white font-medium text-sm truncate">
                          {order.items.length} Block-Typ(en)
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusClass(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Deadline: {formatDate(order.deadline)}
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => onClaimOrder(order.id)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs w-full sm:w-auto"
                    >
                      Übernehmen
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* My Orders */}
      {(user.role === 'farmer' || isAdmin) && myOrders.length > 0 && (
        <Card className="bg-slate-900/80 border-indigo-500/20">
          <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-4">
            <CardTitle className="text-base sm:text-lg text-white flex items-center gap-2">
              <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
              Meine Aufträge
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <ScrollArea className="h-auto max-h-48 sm:max-h-64">
              <div className="space-y-2">
                {myOrders.slice(0, 5).map((order) => (
                  <div 
                    key={order.id} 
                    className="flex items-center justify-between p-2 sm:p-3 bg-slate-800/50 rounded-lg border border-slate-700/50"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getStatusIcon(order.status)}
                        <span className="text-white font-medium text-sm truncate">
                          {order.items.length} Block-Typ(en)
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusClass(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Deadline: {formatDate(order.deadline)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Recent Orders */}
      <Card className="bg-slate-900/80 border-indigo-500/20">
        <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-4">
          <CardTitle className="text-base sm:text-lg text-white flex items-center gap-2">
            <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
            Neueste Aufträge
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          {orders.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <ClipboardList className="w-10 h-10 sm:w-12 sm:h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">Noch keine Aufträge vorhanden</p>
            </div>
          ) : (
            <ScrollArea className="h-auto max-h-48 sm:max-h-64">
              <div className="space-y-2">
                {orders.slice(-5).reverse().map((order) => (
                  <div 
                    key={order.id} 
                    className="flex items-center justify-between p-2 sm:p-3 bg-slate-800/50 rounded-lg border border-slate-700/50"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getStatusIcon(order.status)}
                        <span className="text-white font-medium text-sm truncate">
                          {order.items.length} Block-Typ(en)
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusClass(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Erstellt: {formatDate(order.createdAt)} | Deadline: {formatDate(order.deadline)}
                      </p>
                    </div>
                    {order.assignedTo && order.assignedTo.length > 0 && (
                      <div className="hidden sm:flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-500" />
                        <span className="text-xs text-slate-400">{order.assignedTo.length}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
