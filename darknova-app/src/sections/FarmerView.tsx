import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ClipboardList, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  AlertCircle,
  Package,
  UserCheck,
  Play
} from 'lucide-react';
import type { FarmOrder, User } from '@/types';
import { MINECRAFT_BLOCKS } from '@/types';

interface FarmerViewProps {
  orders: FarmOrder[];
  user: User;
  onClaimOrder: (orderId: string) => void;
  onCompleteOrder: (orderId: string) => void;
}

export function FarmerView({ orders, user, onClaimOrder, onCompleteOrder }: FarmerViewProps) {
  const myOrders = orders.filter(o => o.assignedTo?.includes(user.username));
  const availableOrders = orders.filter(o => o.status === 'open');
  const completedOrders = orders.filter(o => 
    o.status === 'completed' && o.assignedTo?.includes(user.username)
  );

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

  const getBlockName = (blockId: string) => {
    const block = MINECRAFT_BLOCKS.find(b => b.id === blockId);
    return block?.name || blockId;
  };

  const isOverdue = (deadline: string) => {
    return new Date(deadline) < new Date() && new Date(deadline).setHours(0,0,0,0) !== new Date().setHours(0,0,0,0);
  };

  const OrderCard = ({ order, showActions = false }: { order: FarmOrder; showActions?: boolean }) => {
    const overdue = isOverdue(order.deadline) && order.status !== 'completed';
    
    return (
      <div className={`p-3 sm:p-4 rounded-lg border ${overdue ? 'bg-red-950/20 border-red-500/30' : 'bg-slate-800/50 border-slate-700/50'}`}>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              {getStatusIcon(order.status)}
              <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusClass(order.status)}`}>
                {getStatusText(order.status)}
              </span>
              {overdue && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                  Überfällig
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Deadline: <span className={overdue ? 'text-red-400' : ''}>{formatDate(order.deadline)}</span>
            </p>
          </div>
          
          {showActions && order.status === 'in_progress' && (
            <Button
              size="sm"
              onClick={() => onCompleteOrder(order.id)}
              className="bg-green-600 hover:bg-green-500 text-white text-xs shrink-0"
            >
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Abschliessen
            </Button>
          )}
        </div>
        
        <div className="space-y-1">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm">
              <span className="text-white">{getBlockName(item.blockId)}</span>
              <span className="text-slate-500">-</span>
              <span className="text-indigo-400 font-medium">{item.amount} {item.unit === 'dk' ? 'DK' : 'Kisten'}</span>
            </div>
          ))}
        </div>
        
        {order.notes && (
          <div className="mt-3 pt-3 border-t border-slate-700/50">
            <p className="text-xs text-slate-400">Notiz: {order.notes}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Tabs defaultValue="my-tasks" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-slate-900/80 border border-indigo-500/30 p-1">
          <TabsTrigger 
            value="my-tasks" 
            className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-white text-xs sm:text-sm px-1 sm:px-3"
          >
            <span className="hidden sm:inline">Meine Aufträge</span>
            <span className="sm:hidden">Meine</span>
            {myOrders.filter(o => o.status !== 'completed').length > 0 && (
              <span className="ml-1 sm:ml-2 text-xs bg-indigo-500/30 px-1.5 py-0.5 rounded-full">
                {myOrders.filter(o => o.status !== 'completed').length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="available" 
            className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-white text-xs sm:text-sm px-1 sm:px-3"
          >
            <span className="hidden sm:inline">Verfügbar</span>
            <span className="sm:hidden">Offen</span>
            {availableOrders.length > 0 && (
              <span className="ml-1 sm:ml-2 text-xs bg-indigo-500/30 px-1.5 py-0.5 rounded-full">
                {availableOrders.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="completed" 
            className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-white text-xs sm:text-sm px-1 sm:px-3"
          >
            <span className="hidden sm:inline">Abgeschlossen</span>
            <span className="sm:hidden">Fertig</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-tasks">
          <Card className="bg-slate-900/80 border-indigo-500/20">
            <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-4">
              <CardTitle className="text-base sm:text-lg text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
                Meine Aufträge
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              {myOrders.filter(o => o.status !== 'completed').length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <ClipboardList className="w-10 h-10 sm:w-12 sm:h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">Keine aktiven Aufträge</p>
                  <p className="text-slate-500 text-xs mt-1">Nimm einen verfügbaren Auftrag an</p>
                </div>
              ) : (
                <ScrollArea className="h-auto max-h-64 sm:max-h-96">
                  <div className="space-y-3">
                    {myOrders
                      .filter(o => o.status !== 'completed')
                      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
                      .map((order) => (
                        <OrderCard key={order.id} order={order} showActions={true} />
                      ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="available">
          <Card className="bg-slate-900/80 border-indigo-500/20">
            <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-4">
              <CardTitle className="text-base sm:text-lg text-white flex items-center gap-2">
                <Package className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
                Verfügbare Aufträge
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              {availableOrders.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <Package className="w-10 h-10 sm:w-12 sm:h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">Keine verfügbaren Aufträge</p>
                </div>
              ) : (
                <ScrollArea className="h-auto max-h-64 sm:max-h-96">
                  <div className="space-y-3">
                    {availableOrders
                      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
                      .map((order) => (
                        <div key={order.id} className="p-3 sm:p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-2">
                                {getStatusIcon(order.status)}
                                <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusClass(order.status)}`}>
                                  {getStatusText(order.status)}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400">
                                Deadline: {formatDate(order.deadline)}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => onClaimOrder(order.id)}
                              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs shrink-0"
                            >
                              <Play className="w-3 h-3 mr-1" />
                              Übernehmen
                            </Button>
                          </div>
                          
                          <div className="space-y-1">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-sm">
                                <span className="text-white">{getBlockName(item.blockId)}</span>
                                <span className="text-slate-500">-</span>
                                <span className="text-indigo-400 font-medium">{item.amount} {item.unit === 'dk' ? 'DK' : 'Kisten'}</span>
                              </div>
                            ))}
                          </div>
                          
                          {order.notes && (
                            <div className="mt-3 pt-3 border-t border-slate-700/50">
                              <p className="text-xs text-slate-400">Notiz: {order.notes}</p>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card className="bg-slate-900/80 border-indigo-500/20">
            <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-4">
              <CardTitle className="text-base sm:text-lg text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                Abgeschlossene Aufträge
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              {completedOrders.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">Noch keine abgeschlossenen Aufträge</p>
                </div>
              ) : (
                <ScrollArea className="h-auto max-h-64 sm:max-h-96">
                  <div className="space-y-3">
                    {completedOrders
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .map((order) => (
                        <OrderCard key={order.id} order={order} />
                      ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
