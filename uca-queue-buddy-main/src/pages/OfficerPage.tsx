import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useQueue } from '@/context/QueueContext';
import { getServiceTypeInfo } from '@/types/queue';
import { PhoneForwarded, CheckCircle, SkipForward, Users, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const OfficerPage = () => {
  const navigate = useNavigate();
  const { counters, callNext, completeService, skipTicket, setCounterActive, getWaitingCount } = useQueue();
  const { toast } = useToast();
  const { user, isLoading, signOut } = useAuth();
  const [selectedCounter, setSelectedCounter] = useState<number | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    toast({ title: 'Berhasil keluar' });
    navigate('/');
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return null;
  }

  const handleCallNext = (counterId: number) => {
    const ticket = callNext(counterId);
    if (ticket) {
      toast({ title: 'Memanggil', description: `Nomor ${ticket.displayNumber} ke ${counters.find(c => c.id === counterId)?.name}` });
    } else {
      toast({ title: 'Tidak ada antrian', variant: 'destructive' });
    }
  };

  const handleComplete = (counterId: number) => {
    completeService(counterId);
    toast({ title: 'Selesai', description: 'Layanan telah diselesaikan' });
  };

  const handleSkip = (counterId: number) => {
    skipTicket(counterId);
    toast({ title: 'Dilewati', description: 'Nomor antrian dilewati' });
  };

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Panel Petugas</h1>
            <p className="text-muted-foreground">Kelola antrian dan panggil nasabah • {user.email}</p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" /> Keluar
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {counters.map((counter) => {
            const serviceInfo = getServiceTypeInfo(counter.serviceType);
            const waitingCount = getWaitingCount(counter.serviceType);

            return (
              <Card key={counter.id} className={`${counter.isActive ? 'border-primary/50' : 'opacity-60'}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{counter.name}</CardTitle>
                    <Switch checked={counter.isActive} onCheckedChange={(v) => setCounterActive(counter.id, v)} />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="px-2 py-0.5 rounded bg-secondary">{serviceInfo.name}</span>
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" />{waitingCount}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  {counter.currentTicket ? (
                    <div className="text-center mb-4 p-4 rounded-xl bg-primary/10">
                      <p className="text-sm text-muted-foreground mb-1">Sedang Melayani</p>
                      <p className="text-4xl font-bold text-primary">{counter.currentTicket.displayNumber}</p>
                    </div>
                  ) : (
                    <div className="text-center mb-4 p-4 rounded-xl bg-secondary">
                      <p className="text-muted-foreground">Tidak ada nasabah</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    {counter.currentTicket ? (
                      <div className="grid grid-cols-2 gap-2">
                        <Button onClick={() => handleComplete(counter.id)} className="bg-success hover:bg-success/90">
                          <CheckCircle className="h-4 w-4 mr-1" /> Selesai
                        </Button>
                        <Button onClick={() => handleSkip(counter.id)} variant="destructive">
                          <SkipForward className="h-4 w-4 mr-1" /> Lewati
                        </Button>
                      </div>
                    ) : (
                      <Button onClick={() => handleCallNext(counter.id)} disabled={!counter.isActive} className="w-full gradient-primary text-primary-foreground">
                        <PhoneForwarded className="h-4 w-4 mr-2" /> Panggil Berikutnya
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
};

export default OfficerPage;
