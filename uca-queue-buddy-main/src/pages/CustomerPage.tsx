import { useState } from 'react';
import { MainLayout } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useQueue } from '@/context/QueueContext';
import { SERVICE_TYPES, ServiceType, QueueTicket } from '@/types/queue';
import { Banknote, HeadphonesIcon, FileText, Printer, Clock, Users } from 'lucide-react';

const iconMap = {
  Banknote,
  HeadphonesIcon,
  FileText,
};

const CustomerPage = () => {
  const { takeTicket, getWaitingCount } = useQueue();
  const [ticketDialog, setTicketDialog] = useState<QueueTicket | null>(null);

  const handleTakeTicket = (serviceType: ServiceType) => {
    const ticket = takeTicket(serviceType);
    setTicketDialog(ticket);
  };

  const getIcon = (iconName: string) => {
    const Icon = iconMap[iconName as keyof typeof iconMap] || Banknote;
    return Icon;
  };

  return (
    <MainLayout>
      <div className="container py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Ambil Nomor Antrian
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Pilih layanan yang Anda butuhkan untuk mendapatkan nomor antrian
          </p>
        </div>

        {/* Service Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {SERVICE_TYPES.map((service) => {
            const Icon = getIcon(service.icon);
            const waitingCount = getWaitingCount(service.id);

            return (
              <Card 
                key={service.id}
                className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50"
                onClick={() => handleTakeTicket(service.id)}
              >
                <CardContent className="p-8 text-center">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="h-10 w-10 text-primary-foreground" />
                  </div>
                  
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    {service.name}
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    {service.description}
                  </p>

                  <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mb-6">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{waitingCount} menunggu</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>±{service.estimatedTime} menit</span>
                    </div>
                  </div>

                  <Button className="w-full gradient-primary text-primary-foreground hover:opacity-90 transition-opacity" size="lg">
                    Ambil Antrian {service.prefix}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tips Section */}
        <div className="mt-12 max-w-2xl mx-auto">
          <Card className="bg-secondary/50">
            <CardContent className="p-6">
              <h3 className="font-semibold text-foreground mb-3">Tips:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Pastikan Anda memilih layanan yang sesuai dengan kebutuhan</li>
                <li>• Simpan nomor antrian Anda dan perhatikan layar display</li>
                <li>• Segera menuju loket saat nomor Anda dipanggil</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Ticket Dialog */}
      <Dialog open={!!ticketDialog} onOpenChange={() => setTicketDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-lg">Nomor Antrian Anda</DialogTitle>
          </DialogHeader>
          
          {ticketDialog && (
            <div className="text-center py-6">
              <div className="w-32 h-32 mx-auto mb-6 rounded-2xl gradient-primary flex items-center justify-center">
                <span className="text-5xl font-bold text-primary-foreground">
                  {ticketDialog.displayNumber}
                </span>
              </div>
              
              <p className="text-lg text-foreground font-medium mb-2">
                {SERVICE_TYPES.find(s => s.id === ticketDialog.serviceType)?.name}
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                {new Date(ticketDialog.createdAt).toLocaleString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>

              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => setTicketDialog(null)}>
                  Tutup
                </Button>
                <Button className="gradient-primary text-primary-foreground">
                  <Printer className="h-4 w-4 mr-2" />
                  Cetak
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default CustomerPage;
