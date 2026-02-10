import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, CheckCircle, Clock, Calendar, Play, Upload, CheckSquare } from 'lucide-react';
import type { FarmOrder, User } from '@/types';
import { getBlockById } from '@/types';

interface FarmerViewProps {
  orders: FarmOrder[];
  currentUser: User;
  onAcceptOrder: (orderId: string) => void;
  onUpdateProgress: (orderId: string, blockId: string, amount: number) => void;
  onSubmitOrder: (orderId: string) => void;
}

export function FarmerView({ orders, currentUser, onAcceptOrder, onUpdateProgress, onSubmitOrder }: FarmerViewProps) {
  const [activeTab, setActiveTab] = useState('available');

  const availableOrders = orders.filter(order => 
    order.status === 'open' && 
    !order.userProgress.some(p => p.userId === currentUser.id)
  );

  const myOrders = orders.filter(order => {
    const progress = order.userProgress.find(p => p.userId === currentUser.id);
    return progress && ['accepted', 'in_progress'].includes(progress.status);
  });

  const submittedOrders = orders.filter(order => {
    const progress = order.userProgress.find(p => p.userId === currentUser.id);
    return progress && progress.status === 'submitted';
  });

  const confirmedOrders = orders.filter(order => {
    const progress = order.userProgress.find(p => p.userId === currentUser.id);
    return progress && progress.status === 'confirmed';
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-blue-600 text-white">Verfügbar</Badge>;
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

  const calculateProgress = (order: FarmOrder) => {
    const progress = order.userProgress.find(p => p.userId === currentUser.id);
    if (!progress) return 0;
    
    const totalItems = order.items.reduce((sum, item) => sum + item.amount, 0);
    const completedItems = progress.completedItems.reduce((sum, item) => sum + item.amount, 0);
    
    return Math.round((completedItems / totalItems) * 100);
  };

  const getCompletedAmount = (order: FarmOrder, blockId: string) => {
    const progress = order.userProgress.find(p => p.userId === currentUser.id);
    return progress?.completedItems.find(ci => ci.blockId === blockId)?.amount || 0;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('de-DE');
  };

  const isOverdue = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 bg-slate-700 w-full">
          <TabsTrigger value="available" className="text-white data-[state=active]:bg-blue-600 text-xs sm:text-sm">
            <Package className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            <span className="hidden sm:inline">Verfügbar</span>
            <span className="sm:hidden">({availableOrders.length})</span>
          </TabsTrigger>
          <TabsTrigger value="active" className="text-white data-[state=active]:bg-yellow-600 text-xs sm:text-sm">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            <span className="hidden sm:inline">Meine</span>
            <span className="sm:hidden">({myOrders.length})</span>
          </TabsTrigger>
          <TabsTrigger value="submitted" className="text-white data-[state=active]:bg-purple-600 text-xs sm:text-sm">
            <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            <span className="hidden sm:inline">Abgegeben</span>
            <span className="sm:hidden">({submittedOrders.length})</span>
          </TabsTrigger>
          <TabsTrigger value="confirmed" className="text-white data-[state=active]:bg-green-600 text-xs sm:text-sm">
            <CheckSquare className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            <span className="hidden sm:inline">Bestätigt</span>
            <span className="sm:hidden">({confirmedOrders.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="mt-4">
          {availableOrders.length === 0 ? (
            <p className="text-slate-400 text-center py-8">Keine verfügbaren Aufträge</p>
          ) : (
            <div className="space-y-4">
              {availableOrders.map(order => (
                <Card key={order.id} className="bg-slate-800 border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                      <div>
                        {getStatusBadge('open')}
                        <div className="mt-2 space-y-1">
                          {order.items.map((item, idx) => {
                            const block = getBlockById(item.blockId);
                            return (
                              <p key={idx} className="text-white text-sm">
                                {block?.name || item.blockId}: {item.amount} {item.unit === 'dk' ? 'DK' : 'Kisten'}
                              </p>
                            );
                          })}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => onAcceptOrder(order.id)}
                        className="bg-blue-600 hover:bg-blue-500 text-white"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Annehmen
                      </Button>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(order.startDate)} - {formatDate(order.deadline)}
                      </span>
                      {isOverdue(order.deadline) && (
                        <Badge className="bg-red-600 text-white text-xs">Überfällig</Badge>
                      )}
                    </div>
                    {order.notes && (
                      <p className="text-slate-400 text-sm mt-2">{order.notes}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active" className="mt-4">
          {myOrders.length === 0 ? (
            <p className="text-slate-400 text-center py-8">Keine aktiven Aufträge</p>
          ) : (
            <div className="space-y-4">
              {myOrders.map(order => {
                const progress = calculateProgress(order);
                return (
                  <Card key={order.id} className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4">
                      <div className="mb-3">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          {getStatusBadge('in_progress')}
                          {isOverdue(order.deadline) && (
                            <Badge className="bg-red-600 text-white text-xs">Überfällig</Badge>
                          )}
                        </div>
                        <div className="space-y-2">
                          {order.items.map((item, idx) => {
                            const block = getBlockById(item.blockId);
                            const completed = getCompletedAmount(order, item.blockId);
                            return (
                              <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-2">
                                <span className="text-white text-sm flex-1">
                                  {block?.name || item.blockId}:
                                </span>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    min="0"
                                    max={item.amount}
                                    value={completed}
                                    onChange={(e) => onUpdateProgress(order.id, item.blockId, parseInt(e.target.value) || 0)}
                                    className="w-20 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                                  />
                                  <span className="text-slate-400 text-sm">/ {item.amount} {item.unit === 'dk' ? 'DK' : 'Kisten'}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-400">Fortschritt</span>
                          <span className="text-white">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2 bg-slate-700" />
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <span className="flex items-center gap-1 text-sm text-slate-400">
                          <Calendar className="w-4 h-4" />
                          Deadline: {formatDate(order.deadline)}
                        </span>
                        <Button
                          size="sm"
                          onClick={() => onSubmitOrder(order.id)}
                          disabled={progress < 100}
                          className="bg-purple-600 hover:bg-purple-500 text-white disabled:bg-slate-600"
                        >
                          <Upload className="w-4 h-4 mr-1" />
                          Als abgegeben markieren
                        </Button>
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
            <p className="text-slate-400 text-center py-8">Keine abgegebenen Aufträge</p>
          ) : (
            <div className="space-y-4">
              {submittedOrders.map(order => (
                <Card key={order.id} className="bg-slate-800 border-slate-700 border-l-4 border-l-purple-500">
                  <CardContent className="p-4">
                    <div className="mb-3">
                      {getStatusBadge('submitted')}
                      <div className="mt-2 space-y-1">
                        {order.items.map((item, idx) => {
                          const block = getBlockById(item.blockId);
                          return (
                            <p key={idx} className="text-white text-sm">
                              {block?.name || item.blockId}: {item.amount} {item.unit === 'dk' ? 'DK' : 'Kisten'}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-slate-400">
                      <Calendar className="w-4 h-4" />
                      Abgegeben am: {formatDate(order.userProgress.find(p => p.userId === currentUser.id)?.submittedAt || '')}
                    </div>
                    <p className="text-slate-500 text-sm mt-2">
                      Warte auf Bestätigung durch Admin...
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="confirmed" className="mt-4">
          {confirmedOrders.length === 0 ? (
            <p className="text-slate-400 text-center py-8">Keine bestätigten Aufträge</p>
          ) : (
            <div className="space-y-4">
              {confirmedOrders.map(order => (
                <Card key={order.id} className="bg-slate-800 border-slate-700 border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <div className="mb-3">
                      {getStatusBadge('confirmed')}
                      <div className="mt-2 space-y-1">
                        {order.items.map((item, idx) => {
                          const block = getBlockById(item.blockId);
                          return (
                            <p key={idx} className="text-white text-sm">
                              {block?.name || item.blockId}: {item.amount} {item.unit === 'dk' ? 'DK' : 'Kisten'}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-slate-400">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Bestätigt am: {formatDate(order.userProgress.find(p => p.userId === currentUser.id)?.confirmedAt || '')}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
