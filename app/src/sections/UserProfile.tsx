import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User as UserIcon, Package, CheckCircle, Clock, Calendar } from 'lucide-react';
import type { User, FarmOrder, AbsenceRequest } from '@/types';
import { getBlockById } from '@/types';

interface UserProfileProps {
  user: User;
  orders: FarmOrder[];
  absences: AbsenceRequest[];
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfile({ user, orders, absences, isOpen, onClose }: UserProfileProps) {
  const userOrders = orders.filter(order =>
    order.userProgress.some(progress => progress.userId === user.id)
  );

  const acceptedOrders = userOrders.filter(order => {
    const progress = order.userProgress.find(p => p.userId === user.id);
    return progress && ['accepted', 'in_progress'].includes(progress.status);
  });

  const submittedOrders = userOrders.filter(order => {
    const progress = order.userProgress.find(p => p.userId === user.id);
    return progress && progress.status === 'submitted';
  });

  const confirmedOrders = userOrders.filter(order => {
    const progress = order.userProgress.find(p => p.userId === user.id);
    return progress && progress.status === 'confirmed';
  });

  const userAbsences = absences.filter(a => a.userId === user.id);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-blue-600 text-white">Angenommen</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-600 text-white">In Bearbeitung</Badge>;
      case 'submitted':
        return <Badge className="bg-purple-600 text-white">Abgegeben</Badge>;
      case 'confirmed':
        return <Badge className="bg-green-600 text-white">Bestätigt</Badge>;
      default:
        return <Badge className="bg-slate-600 text-white">Unbekannt</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('de-DE');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-white" />
            </div>
            Benutzerprofil: {user.username}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Info Card */}
          <Card className="bg-slate-700 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white text-lg">Benutzerinformationen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-sm">Benutzername</p>
                  <p className="text-white font-medium">{user.username}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Rolle</p>
                  <p className="text-white font-medium capitalize">{user.role}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Erstellt am</p>
                  <p className="text-white font-medium">{formatDate(user.createdAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Orders Tabs */}
          <Tabs defaultValue="accepted" className="w-full">
            <TabsList className="grid grid-cols-4 bg-slate-700">
              <TabsTrigger value="accepted" className="text-white data-[state=active]:bg-emerald-600">
                <Clock className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Aktiv</span>
                <span className="sm:hidden">({acceptedOrders.length})</span>
              </TabsTrigger>
              <TabsTrigger value="submitted" className="text-white data-[state=active]:bg-purple-600">
                <Package className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Abgegeben</span>
                <span className="sm:hidden">({submittedOrders.length})</span>
              </TabsTrigger>
              <TabsTrigger value="confirmed" className="text-white data-[state=active]:bg-green-600">
                <CheckCircle className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Bestätigt</span>
                <span className="sm:hidden">({confirmedOrders.length})</span>
              </TabsTrigger>
              <TabsTrigger value="absences" className="text-white data-[state=active]:bg-orange-600">
                <Calendar className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Abwesenheit</span>
                <span className="sm:hidden">({userAbsences.length})</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="accepted" className="mt-4">
              {acceptedOrders.length === 0 ? (
                <p className="text-slate-400 text-center py-4">Keine aktiven Aufträge</p>
              ) : (
                <div className="space-y-3">
                  {acceptedOrders.map(order => {
                    const progress = order.userProgress.find(p => p.userId === user.id);
                    return (
                      <Card key={order.id} className="bg-slate-700 border-slate-600">
                        <CardContent className="p-4">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                            {getStatusBadge(progress?.status || 'accepted')}
                            <span className="text-slate-400 text-sm">
                              Deadline: {formatDate(order.deadline)}
                            </span>
                          </div>
                          <div className="space-y-1">
                            {order.items.map((item, idx) => {
                              const block = getBlockById(item.blockId);
                              const completedAmount = progress?.completedItems.find(ci => ci.blockId === item.blockId)?.amount || 0;
                              return (
                                <p key={idx} className="text-white text-sm">
                                  {block?.name || item.blockId}: {completedAmount}/{item.amount} {item.unit === 'dk' ? 'DK' : 'Kisten'}
                                </p>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="submitted" className="mt-4">
              {submittedOrders.length === 0 ? (
                <p className="text-slate-400 text-center py-4">Keine abgegebenen Aufträge</p>
              ) : (
                <div className="space-y-3">
                  {submittedOrders.map(order => {
                    const progress = order.userProgress.find(p => p.userId === user.id);
                    return (
                      <Card key={order.id} className="bg-slate-700 border-slate-600">
                        <CardContent className="p-4">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                            {getStatusBadge('submitted')}
                            <span className="text-slate-400 text-sm">
                              Abgegeben: {progress?.submittedAt ? formatDate(progress.submittedAt) : '-'}
                            </span>
                          </div>
                          <div className="space-y-1">
                            {order.items.map((item, idx) => {
                              const block = getBlockById(item.blockId);
                              return (
                                <p key={idx} className="text-white text-sm">
                                  {block?.name || item.blockId}: {item.amount} {item.unit === 'dk' ? 'DK' : 'Kisten'}
                                </p>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="confirmed" className="mt-4">
              {confirmedOrders.length === 0 ? (
                <p className="text-slate-400 text-center py-4">Keine bestätigten Aufträge</p>
              ) : (
                <div className="space-y-3">
                  {confirmedOrders.map(order => {
                    const progress = order.userProgress.find(p => p.userId === user.id);
                    return (
                      <Card key={order.id} className="bg-slate-700 border-slate-600">
                        <CardContent className="p-4">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                            {getStatusBadge('confirmed')}
                            <span className="text-slate-400 text-sm">
                              Bestätigt: {progress?.confirmedAt ? formatDate(progress.confirmedAt) : '-'}
                            </span>
                          </div>
                          <div className="space-y-1">
                            {order.items.map((item, idx) => {
                              const block = getBlockById(item.blockId);
                              return (
                                <p key={idx} className="text-white text-sm">
                                  {block?.name || item.blockId}: {item.amount} {item.unit === 'dk' ? 'DK' : 'Kisten'}
                                </p>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="absences" className="mt-4">
              {userAbsences.length === 0 ? (
                <p className="text-slate-400 text-center py-4">Keine Abwesenheitsanträge</p>
              ) : (
                <div className="space-y-3">
                  {userAbsences.map(absence => (
                    <Card key={absence.id} className="bg-slate-700 border-slate-600">
                      <CardContent className="p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <Badge className={
                            absence.status === 'approved' ? 'bg-green-600 text-white' :
                            absence.status === 'rejected' ? 'bg-red-600 text-white' :
                            'bg-yellow-600 text-white'
                          }>
                            {absence.status === 'approved' ? 'Genehmigt' :
                             absence.status === 'rejected' ? 'Abgelehnt' : 'Ausstehend'}
                          </Badge>
                          <span className="text-slate-400 text-sm">
                            {formatDate(absence.startDate)} - {formatDate(absence.endDate)}
                          </span>
                        </div>
                        <p className="text-white text-sm">{absence.reason}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
