import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Plus, CheckCircle, XCircle, Clock } from 'lucide-react';
import type { User } from '@/types';
import { useAbsences } from '@/hooks/useAbsences';

interface AbsenceRequestsProps {
  currentUser: User;
}

export function AbsenceRequests({ currentUser }: AbsenceRequestsProps) {
  const { absences, createAbsence, approveAbsence, rejectAbsence } = useAbsences();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async () => {
    if (!startDate || !endDate || !reason) return;
    await createAbsence(startDate, endDate, reason);
    setStartDate('');
    setEndDate('');
    setReason('');
    setShowForm(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-600 text-white">Genehmigt</Badge>;
      case 'rejected':
        return <Badge className="bg-red-600 text-white">Abgelehnt</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-600 text-white">Ausstehend</Badge>;
      default:
        return <Badge className="bg-slate-600 text-white">Unbekannt</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('de-DE');
  };

  const myRequests = absences.filter(r => r.userId === currentUser.id);
  const pendingRequests = absences.filter(r => r.status === 'pending');

  return (
    <div className="space-y-6">
      {/* Create Request Form */}
      {currentUser.role !== 'viewer' && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-500" />
              Abwesenheitsantrag
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!showForm ? (
              <Button
                onClick={() => setShowForm(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Neuen Antrag stellen
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-400 mb-1 block">Von</label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 mb-1 block">Bis</label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Grund</label>
                  <Textarea
                    placeholder="Warum bist du abwesend?"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleSubmit}
                    disabled={!startDate || !endDate || !reason}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white"
                  >
                    Antrag stellen
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowForm(false)}
                    className="border-slate-600 text-white hover:bg-slate-700"
                  >
                    Abbrechen
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Admin: Pending Requests */}
      {currentUser.role === 'admin' && pendingRequests.length > 0 && (
        <Card className="bg-slate-800 border-slate-700 border-l-4 border-l-yellow-500">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              Ausstehende Anträge ({pendingRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingRequests.map(request => (
                <div key={request.id} className="p-4 bg-slate-700 rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusBadge(request.status)}
                        <span className="text-white font-medium">{request.username}</span>
                      </div>
                      <p className="text-slate-400 text-sm">
                        {formatDate(request.startDate)} - {formatDate(request.endDate)}
                      </p>
                      <p className="text-white text-sm mt-2">{request.reason}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => approveAbsence(request.id)}
                        className="bg-green-600 hover:bg-green-500 text-white"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Genehmigen
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => rejectAbsence(request.id)}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Ablehnen
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* My Requests */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-500" />
            Meine Anträge
          </CardTitle>
        </CardHeader>
        <CardContent>
          {myRequests.length === 0 ? (
            <p className="text-slate-400 text-center py-4">Keine Anträge vorhanden</p>
          ) : (
            <div className="space-y-3">
              {myRequests.map(request => (
                <div key={request.id} className="p-4 bg-slate-700 rounded-lg">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    {getStatusBadge(request.status)}
                  </div>
                  <p className="text-slate-400 text-sm">
                    {formatDate(request.startDate)} - {formatDate(request.endDate)}
                  </p>
                  <p className="text-white text-sm mt-2">{request.reason}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Requests (Admin only) */}
      {currentUser.role === 'admin' && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-500" />
              Alle Anträge
            </CardTitle>
          </CardHeader>
          <CardContent>
            {absences.length === 0 ? (
              <p className="text-slate-400 text-center py-4">Keine Anträge vorhanden</p>
            ) : (
              <div className="space-y-3">
                {absences.map(request => (
                  <div key={request.id} className="p-4 bg-slate-700 rounded-lg">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      {getStatusBadge(request.status)}
                      <span className="text-white font-medium">{request.username}</span>
                    </div>
                    <p className="text-slate-400 text-sm">
                      {formatDate(request.startDate)} - {formatDate(request.endDate)}
                    </p>
                    <p className="text-white text-sm mt-2">{request.reason}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
