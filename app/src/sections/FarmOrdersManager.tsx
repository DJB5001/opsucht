import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Plus, Trash2, Package, Calendar, Users, CheckCircle, X } from 'lucide-react';
import type { FarmOrder, OrderItem, User, UserOrderProgress } from '@/types';
import { MINECRAFT_BLOCKS, BLOCK_CATEGORIES, getBlocksByCategory } from '@/types';
import { useOrders } from '@/hooks/useOrders';
import { useUsers } from '@/hooks/useUsers';

interface FarmOrdersManagerProps {
  currentUser: User;
}

export function FarmOrdersManager({ currentUser }: FarmOrdersManagerProps) {
  const { orders, createOrder, deleteOrder, confirmOrder } = useOrders();
  const { users } = useUsers();

  const [items, setItems] = useState<OrderItem[]>([{ blockId: '', amount: 1, unit: 'dk' }]);
  const [startDate, setStartDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [autoAssign, setAutoAssign] = useState(false);
  const [notes, setNotes] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<FarmOrder | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmationData, setConfirmationData] = useState<{ orderId: string; userId: string; username: string } | null>(null);

  const handleAddItem = () => {
    setItems([...items, { blockId: '', amount: 1, unit: 'dk' }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof OrderItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleCategoryChange = (index: number, category: string) => {
    setSelectedCategory(category);
    handleItemChange(index, 'blockId', '');
  };

  const handleSubmit = async () => {
    if (items.some(i => !i.blockId) || !startDate || !deadline) return;

    await createOrder({
      items,
      startDate,
      deadline,
      status: 'open',
      autoAssign,
      createdBy: currentUser.id,
      notes,
    });

    setItems([{ blockId: '', amount: 1, unit: 'dk' }]);
    setStartDate('');
    setDeadline('');
    setAutoAssign(false);
    setNotes('');
    setSelectedCategory('');
  };

  const handleDeleteClick = (order: FarmOrder) => {
    setOrderToDelete(order);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteOrder = async () => {
    if (orderToDelete) {
      await deleteOrder(orderToDelete.id);
      setDeleteDialogOpen(false);
      setOrderToDelete(null);
    }
  };

  const handleConfirmClick = (orderId: string, userId: string, username: string) => {
    setConfirmationData({ orderId, userId, username });
    setConfirmDialogOpen(true);
  };

  const handleConfirmOrder = async () => {
    if (confirmationData) {
      await confirmOrder(confirmationData.orderId, confirmationData.userId);
      setConfirmDialogOpen(false);
      setConfirmationData(null);
    }
  };

  const getBlockName = (blockId: string) => {
    return MINECRAFT_BLOCKS.find(b => b.id === blockId)?.name || blockId;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-blue-600 text-white">Offen</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-600 text-white">In Bearbeitung</Badge>;
      case 'completed':
        return <Badge className="bg-green-600 text-white">Abgeschlossen</Badge>;
      default:
        return <Badge className="bg-slate-600 text-white">Unbekannt</Badge>;
    }
  };

  const getUserProgressBadge = (progress: UserOrderProgress) => {
    switch (progress.status) {
      case 'accepted':
        return <Badge className="bg-blue-600 text-white text-xs">Angenommen</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-600 text-white text-xs">In Bearbeitung</Badge>;
      case 'submitted':
        return <Badge className="bg-purple-600 text-white text-xs">Abgegeben</Badge>;
      case 'confirmed':
        return <Badge className="bg-green-600 text-white text-xs">Bestätigt</Badge>;
      default:
        return <Badge className="bg-slate-600 text-white text-xs">Unbekannt</Badge>;
    }
  };

  const pendingConfirmations = orders.flatMap(order =>
    order.userProgress
      .filter(p => p.status === 'submitted')
      .map(p => ({
        order,
        progress: p,
        username: users.find(u => u.id === p.userId)?.username || 'Unbekannt'
      }))
  );

  return (
    <div className="space-y-6">
      {/* Create Order Form */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Plus className="w-5 h-5 text-emerald-500" />
            Neuen Auftrag erstellen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-3 bg-slate-700 rounded-lg">
                <div className="sm:col-span-3">
                  <Select
                    value={selectedCategory}
                    onValueChange={(v) => handleCategoryChange(index, v)}
                  >
                    <SelectTrigger className="bg-slate-600 border-slate-500 text-white text-sm">
                      <SelectValue placeholder="Kategorie" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600 max-h-60">
                      {BLOCK_CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat} className="text-white text-sm">{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-4">
                  <Select
                    value={item.blockId}
                    onValueChange={(v) => handleItemChange(index, 'blockId', v)}
                    disabled={!selectedCategory}
                  >
                    <SelectTrigger className="bg-slate-600 border-slate-500 text-white text-sm">
                      <SelectValue placeholder={selectedCategory ? "Block wählen" : "Zuerst Kategorie"} />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600 max-h-60">
                      {selectedCategory && getBlocksByCategory(selectedCategory).map(block => (
                        <SelectItem key={block.id} value={block.id} className="text-white text-sm">{block.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2">
                  <Input
                    type="number"
                    min="1"
                    value={item.amount}
                    onChange={(e) => handleItemChange(index, 'amount', parseInt(e.target.value) || 1)}
                    className="bg-slate-600 border-slate-500 text-white text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Select
                    value={item.unit}
                    onValueChange={(v) => handleItemChange(index, 'unit', v as 'dk' | 'kisten')}
                  >
                    <SelectTrigger className="bg-slate-600 border-slate-500 text-white text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="dk" className="text-white text-sm">DK</SelectItem>
                      <SelectItem value="kisten" className="text-white text-sm">Kisten</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-1 flex justify-end">
                  {items.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(index)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/30"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddItem}
              className="border-slate-600 text-white hover:bg-slate-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Block hinzufügen
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Startdatum</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Deadline</label>
              <Input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-1 block">Notizen (optional)</label>
            <Input
              placeholder="Zusätzliche Informationen..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="autoAssign"
              checked={autoAssign}
              onCheckedChange={(checked) => setAutoAssign(checked as boolean)}
              className="border-slate-500 data-[state=checked]:bg-emerald-600"
            />
            <label htmlFor="autoAssign" className="text-sm text-slate-300">
              Automatisch allen Farmern zuweisen
            </label>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={items.some(i => !i.blockId) || !startDate || !deadline}
            className="bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            <Package className="w-4 h-4 mr-2" />
            Auftrag erstellen
          </Button>
        </CardContent>
      </Card>

      {/* Pending Confirmations */}
      {pendingConfirmations.length > 0 && (
        <Card className="bg-slate-800 border-slate-700 border-l-4 border-l-purple-500">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-purple-500" />
              Ausstehende Bestätigungen ({pendingConfirmations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingConfirmations.map(({ order, progress, username }) => (
                <div key={`${order.id}-${progress.userId}`} className="p-4 bg-slate-700 rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-white font-medium">{username}</p>
                      <p className="text-slate-400 text-sm">
                        {order.items.map(i => getBlockName(i.blockId)).join(', ')}
                      </p>
                      <p className="text-slate-500 text-xs">
                        Abgegeben: {progress.submittedAt ? new Date(progress.submittedAt).toLocaleDateString('de-DE') : '-'}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleConfirmClick(order.id, progress.userId, username)}
                      className="bg-purple-600 hover:bg-purple-500 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Bestätigen
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Orders List */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-500" />
            Alle Aufträge
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders.length === 0 ? (
              <p className="text-slate-400 text-center py-4">Keine Aufträge vorhanden</p>
            ) : (
              orders.map(order => (
                <div key={order.id} className="p-4 bg-slate-700 rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {getStatusBadge(order.status)}
                        {order.autoAssign && (
                          <Badge className="bg-emerald-600 text-white text-xs">Auto-Zuweisung</Badge>
                        )}
                      </div>
                      <div className="space-y-1">
                        {order.items.map((item, idx) => (
                          <p key={idx} className="text-white text-sm">
                            {getBlockName(item.blockId)}: {item.amount} {item.unit === 'dk' ? 'DK' : 'Kisten'}
                          </p>
                        ))}
                      </div>
                      {order.notes && (
                        <p className="text-slate-400 text-sm mt-2">{order.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(order)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(order.startDate).toLocaleDateString('de-DE')} - {new Date(order.deadline).toLocaleDateString('de-DE')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {order.userProgress.length} Farmer
                    </span>
                  </div>

                  {order.userProgress.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-600">
                      <p className="text-slate-400 text-sm mb-2">Farmer Status:</p>
                      <div className="flex flex-wrap gap-2">
                        {order.userProgress.map(progress => {
                          const username = users.find(u => u.id === progress.userId)?.username || 'Unbekannt';
                          return (
                            <div key={progress.userId} className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded">
                              <span className="text-white text-xs">{username}</span>
                              {getUserProgressBadge(progress)}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
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
            <DialogTitle className="text-white">Auftrag löschen</DialogTitle>
            <DialogDescription className="text-slate-400">
              Möchtest du diesen Auftrag wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
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
              onClick={confirmDeleteOrder}
            >
              Löschen
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Order Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Auftrag bestätigen</DialogTitle>
            <DialogDescription className="text-slate-400">
              Möchtest du den Auftrag von "{confirmationData?.username}" wirklich als abgegeben bestätigen?
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
              className="border-slate-600 text-white hover:bg-slate-700"
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleConfirmOrder}
              className="bg-purple-600 hover:bg-purple-500 text-white"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Bestätigen
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
