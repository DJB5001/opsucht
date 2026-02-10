import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  Trash2, 
  Package, 
  Calendar, 
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  X
} from 'lucide-react';
import type { FarmOrder, User } from '@/types';
import { MINECRAFT_BLOCKS, BLOCK_CATEGORIES, getBlocksByCategory } from '@/types';

interface FarmOrdersManagerProps {
  orders: FarmOrder[];
  onAddOrder: (order: Omit<FarmOrder, 'id' | 'createdAt' | 'status'>) => void;
  onDeleteOrder: (orderId: string) => void;
  user: User;
}

interface OrderItemInput {
  blockId: string;
  amount: number;
  unit: 'dk' | 'kisten';
}

export function FarmOrdersManager({ orders, onAddOrder, onDeleteOrder, user }: FarmOrdersManagerProps) {
  const [items, setItems] = useState<OrderItemInput[]>([{ blockId: '', amount: 1, unit: 'dk' }]);
  const [startDate, setStartDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [autoAssign, setAutoAssign] = useState(false);
  const [notes, setNotes] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const handleAddItem = () => {
    setItems([...items, { blockId: '', amount: 1, unit: 'dk' }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: keyof OrderItemInput, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validItems = items.filter(item => item.blockId && item.amount > 0);
    
    if (validItems.length === 0) {
      return;
    }

    onAddOrder({
      items: validItems,
      startDate,
      deadline,
      autoAssign,
      createdBy: user.username,
      notes: notes || undefined,
    });

    // Reset form
    setItems([{ blockId: '', amount: 1, unit: 'dk' }]);
    setStartDate('');
    setDeadline('');
    setAutoAssign(false);
    setNotes('');
    setSelectedCategory('');
  };

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

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Create Order Form */}
      <Card className="bg-slate-900/80 border-indigo-500/20">
        <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-4">
          <CardTitle className="text-base sm:text-lg text-white flex items-center gap-2">
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
            Neuen Auftrag erstellen
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Items */}
            <div className="space-y-3">
              <Label className="text-white text-sm">Blöcke</Label>
              <ScrollArea className="h-auto max-h-64 sm:max-h-80">
                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-2 p-2 sm:p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                      <div className="flex-1 min-w-0">
                        <Select 
                          value={selectedCategory} 
                          onValueChange={(value) => {
                            setSelectedCategory(value);
                            handleItemChange(index, 'blockId', '');
                          }}
                        >
                          <SelectTrigger className="bg-slate-800 border-slate-700 text-white text-sm">
                            <SelectValue placeholder="Kategorie wählen" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700 max-h-60">
                            {BLOCK_CATEGORIES.map((category) => (
                              <SelectItem key={category} value={category} className="text-white hover:bg-slate-700">
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {selectedCategory && (
                        <div className="flex-1 min-w-0">
                          <Select 
                            value={item.blockId} 
                            onValueChange={(value) => handleItemChange(index, 'blockId', value)}
                          >
                            <SelectTrigger className="bg-slate-800 border-slate-700 text-white text-sm">
                              <SelectValue placeholder="Block wählen" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700 max-h-60">
                              {getBlocksByCategory(selectedCategory).map((block) => (
                                <SelectItem key={block.id} value={block.id} className="text-white hover:bg-slate-700">
                                  {block.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          min="1"
                          value={item.amount}
                          onChange={(e) => handleItemChange(index, 'amount', parseInt(e.target.value) || 1)}
                          className="w-16 sm:w-20 bg-slate-800 border-slate-700 text-white text-sm"
                        />
                        <Select 
                          value={item.unit} 
                          onValueChange={(value: 'dk' | 'kisten') => handleItemChange(index, 'unit', value)}
                        >
                          <SelectTrigger className="w-24 sm:w-28 bg-slate-800 border-slate-700 text-white text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700">
                            <SelectItem value="dk" className="text-white hover:bg-slate-700">DK</SelectItem>
                            <SelectItem value="kisten" className="text-white hover:bg-slate-700">Kisten</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(index)}
                        disabled={items.length === 1}
                        className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              <Button
                type="button"
                variant="outline"
                onClick={handleAddItem}
                className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white text-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Block hinzufügen
              </Button>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-white text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  Startdatum
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white text-sm"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deadline" className="text-white text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  Deadline
                </Label>
                <Input
                  id="deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white text-sm"
                  required
                />
              </div>
            </div>

            {/* Auto Assign */}
            <div className="flex items-center space-x-2 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <Checkbox
                id="autoAssign"
                checked={autoAssign}
                onCheckedChange={(checked) => setAutoAssign(checked as boolean)}
                className="border-slate-600 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
              />
              <Label htmlFor="autoAssign" className="text-white text-sm cursor-pointer flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                Automatisch allen Farmern zuweisen
              </Label>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-white text-sm">Notizen (optional)</Label>
              <Input
                id="notes"
                type="text"
                placeholder="Zusätzliche Informationen..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-600 text-sm"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
            >
              <Package className="w-4 h-4 mr-2" />
              Auftrag erstellen
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Existing Orders */}
      <Card className="bg-slate-900/80 border-indigo-500/20">
        <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-4">
          <CardTitle className="text-base sm:text-lg text-white flex items-center gap-2">
            <Package className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
            Bestehende Aufträge
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          {orders.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <Package className="w-10 h-10 sm:w-12 sm:h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">Noch keine Aufträge vorhanden</p>
            </div>
          ) : (
            <ScrollArea className="h-auto max-h-64 sm:max-h-96">
              <div className="space-y-3">
                {orders.slice().reverse().map((order) => (
                  <div 
                    key={order.id} 
                    className="p-3 sm:p-4 bg-slate-800/50 rounded-lg border border-slate-700/50"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          {getStatusIcon(order.status)}
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusClass(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                          {order.autoAssign && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                              Auto-Zuweisung
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">
                          Erstellt: {formatDate(order.createdAt)} | Start: {formatDate(order.startDate)} | Deadline: {formatDate(order.deadline)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteOrder(order.id)}
                        className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 shrink-0 self-end sm:self-start"
                      >
                        <Trash2 className="w-4 h-4" />
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
                    
                    {order.assignedTo && order.assignedTo.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-700/50">
                        <p className="text-xs text-slate-400 mb-1">Zugewiesen an:</p>
                        <div className="flex flex-wrap gap-1">
                          {order.assignedTo.map((username) => (
                            <span key={username} className="text-xs px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded-full">
                              {username}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
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
    </div>
  );
}
