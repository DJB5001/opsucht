import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Clock,
  User,
  AlertCircle,
  FileText
} from 'lucide-react';
import type { AbsenceRequest, User } from '@/types';

interface AbsenceRequestsProps {
  absences: AbsenceRequest[];
  user: User;
  onAddAbsence: (absence: Omit<AbsenceRequest, 'id' | 'requestedAt' | 'status'>) => void;
  onUpdateAbsence: (absenceId: string, status: 'approved' | 'rejected') => void;
}

export function AbsenceRequests({ absences, user, onAddAbsence, onUpdateAbsence }: AbsenceRequestsProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const isAdmin = user.role === 'admin';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startDate || !endDate) {
      return;
    }

    onAddAbsence({
      username: user.username,
      startDate,
      endDate,
      reason: reason || undefined,
    });

    setStartDate('');
    setEndDate('');
    setReason('');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'approved': return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Ausstehend';
      case 'approved': return 'Genehmigt';
      case 'rejected': return 'Abgelehnt';
      default: return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'approved': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('de-DE');
  };

  const myAbsences = absences.filter(a => a.username === user.username);
  const pendingAbsences = absences.filter(a => a.status === 'pending');

  const AbsenceCard = ({ absence, showActions = false }: { absence: AbsenceRequest; showActions?: boolean }) => (
    <div className="p-3 sm:p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            {getStatusIcon(absence.status)}
            <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusClass(absence.status)}`}>
              {getStatusText(absence.status)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-slate-500" />
            <span className="text-white">{absence.username}</span>
          </div>
        </div>
        
        {showActions && absence.status === 'pending' && (
          <div className="flex gap-2 shrink-0">
            <Button
              size="sm"
              onClick={() => onUpdateAbsence(absence.id, 'approved')}
              className="bg-green-600 hover:bg-green-500 text-white text-xs"
            >
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Genehmigen
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpdateAbsence(absence.id, 'rejected')}
              className="border-red-500/50 text-red-400 hover:bg-red-500/10 text-xs"
            >
              <XCircle className="w-3 h-3 mr-1" />
              Ablehnen
            </Button>
          </div>
        )}
      </div>
      
      <div className="space-y-1 text-sm">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-400" />
          <span className="text-slate-400">Von:</span>
          <span className="text-white">{formatDate(absence.startDate)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-400" />
          <span className="text-slate-400">Bis:</span>
          <span className="text-white">{formatDate(absence.endDate)}</span>
        </div>
      </div>
      
      {absence.reason && (
        <div className="mt-3 pt-3 border-t border-slate-700/50">
          <div className="flex items-start gap-2">
            <FileText className="w-4 h-4 text-slate-500 mt-0.5" />
            <p className="text-xs text-slate-400">{absence.reason}</p>
          </div>
        </div>
      )}
      
      <div className="mt-3 pt-3 border-t border-slate-700/50">
        <p className="text-xs text-slate-500">
          Beantragt am: {formatDate(absence.requestedAt)}
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Create Absence Request Form */}
      <Card className="bg-slate-900/80 border-indigo-500/20">
        <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-4">
          <CardTitle className="text-base sm:text-lg text-white flex items-center gap-2">
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
            Abwesenheit beantragen
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-white text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  Von
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
                <Label htmlFor="endDate" className="text-white text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  Bis
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white text-sm"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-white text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                Grund (optional)
              </Label>
              <Input
                id="reason"
                type="text"
                placeholder="z.B. Urlaub, Krankheit, etc."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-600 text-sm"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
            >
              <Plus className="w-4 h-4 mr-2" />
              Antrag stellen
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Absence Requests List */}
      <Tabs defaultValue={isAdmin ? "pending" : "my-requests"} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 bg-slate-900/80 border border-indigo-500/30 p-1">
          {isAdmin && (
            <TabsTrigger 
              value="pending" 
              className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-white text-xs sm:text-sm px-1 sm:px-3"
            >
              <span className="hidden sm:inline">Ausstehend</span>
              <span className="sm:hidden">Offen</span>
              {pendingAbsences.length > 0 && (
                <span className="ml-1 sm:ml-2 text-xs bg-indigo-500/30 px-1.5 py-0.5 rounded-full">
                  {pendingAbsences.length}
                </span>
              )}
            </TabsTrigger>
          )}
          <TabsTrigger 
            value="my-requests" 
            className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-white text-xs sm:text-sm px-1 sm:px-3"
          >
            <span className="hidden sm:inline">Meine Anträge</span>
            <span className="sm:hidden">Meine</span>
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger 
              value="all" 
              className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-white text-xs sm:text-sm px-1 sm:px-3"
            >
              <span className="hidden sm:inline">Alle Anträge</span>
              <span className="sm:hidden">Alle</span>
            </TabsTrigger>
          )}
        </TabsList>

        {isAdmin && (
          <TabsContent value="pending">
            <Card className="bg-slate-900/80 border-indigo-500/20">
              <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-4">
                <CardTitle className="text-base sm:text-lg text-white flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                  Ausstehende Anträge
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                {pendingAbsences.length === 0 ? (
                  <div className="text-center py-6 sm:py-8">
                    <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">Keine ausstehenden Anträge</p>
                  </div>
                ) : (
                  <ScrollArea className="h-auto max-h-64 sm:max-h-96">
                    <div className="space-y-3">
                      {pendingAbsences
                        .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime())
                        .map((absence) => (
                          <AbsenceCard key={absence.id} absence={absence} showActions={true} />
                        ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="my-requests">
          <Card className="bg-slate-900/80 border-indigo-500/20">
            <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-4">
              <CardTitle className="text-base sm:text-lg text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
                Meine Abwesenheitsanträge
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              {myAbsences.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">Noch keine Anträge gestellt</p>
                </div>
              ) : (
                <ScrollArea className="h-auto max-h-64 sm:max-h-96">
                  <div className="space-y-3">
                    {myAbsences
                      .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime())
                      .map((absence) => (
                        <AbsenceCard key={absence.id} absence={absence} />
                      ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="all">
            <Card className="bg-slate-900/80 border-indigo-500/20">
              <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-4">
                <CardTitle className="text-base sm:text-lg text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
                  Alle Abwesenheitsanträge
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                {absences.length === 0 ? (
                  <div className="text-center py-6 sm:py-8">
                    <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">Noch keine Anträge vorhanden</p>
                  </div>
                ) : (
                  <ScrollArea className="h-auto max-h-64 sm:max-h-96">
                    <div className="space-y-3">
                      {absences
                        .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime())
                        .map((absence) => (
                          <AbsenceCard key={absence.id} absence={absence} />
                        ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
