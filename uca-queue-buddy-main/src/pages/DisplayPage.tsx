import { useEffect, useState } from 'react';
import { useQueue } from '@/context/QueueContext';
import { SERVICE_TYPES, getServiceTypeInfo } from '@/types/queue';
import { Building2, Volume2 } from 'lucide-react';

const DisplayPage = () => {
  const { counters, getWaitingTickets, getCurrentServing } = useQueue();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastCalledTicket, setLastCalledTicket] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentlyServing = getCurrentServing();

  // Animate when new ticket is called
  useEffect(() => {
    if (currentlyServing.length > 0) {
      const latestTicket = currentlyServing[currentlyServing.length - 1];
      if (lastCalledTicket !== latestTicket.id) {
        setLastCalledTicket(latestTicket.id);
      }
    }
  }, [currentlyServing]);

  const activeCounters = counters.filter(c => c.isActive);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sidebar to-sidebar-accent text-sidebar-foreground">
      {/* Header */}
      <header className="bg-sidebar-accent/50 border-b border-sidebar-border px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary">
              <Building2 className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Bank UCA</h1>
              <p className="text-sm text-sidebar-foreground/70">Sistem Antrian Digital</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold tabular-nums">
              {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <p className="text-sm text-sidebar-foreground/70">
              {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      </header>

      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Display - Currently Serving */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Volume2 className="h-5 w-5 text-primary" />
              Sedang Dipanggil
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeCounters.map((counter) => {
                const serviceInfo = getServiceTypeInfo(counter.serviceType);
                const hasTicket = counter.currentTicket;
                const isNewlyCaleld = hasTicket && counter.currentTicket?.id === lastCalledTicket;

                return (
                  <div
                    key={counter.id}
                    className={`
                      rounded-2xl p-6 transition-all duration-500
                      ${hasTicket 
                        ? 'bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/50' 
                        : 'bg-sidebar-accent/30 border border-sidebar-border'
                      }
                      ${isNewlyCaleld ? 'animate-pulse-slow ring-4 ring-primary/50' : ''}
                    `}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-sidebar-foreground/70">
                        {counter.name}
                      </span>
                      <span className="px-2 py-1 rounded-md text-xs font-medium bg-sidebar-accent text-sidebar-foreground">
                        {serviceInfo.name}
                      </span>
                    </div>

                    {hasTicket ? (
                      <div className="text-center">
                        <div className={`text-6xl font-bold mb-2 ${isNewlyCaleld ? 'animate-number-change text-primary' : 'text-sidebar-foreground'}`}>
                          {counter.currentTicket?.displayNumber}
                        </div>
                        {counter.officerName && (
                          <p className="text-sm text-sidebar-foreground/70">
                            Petugas: {counter.officerName}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <div className="text-2xl text-sidebar-foreground/40">---</div>
                        <p className="text-sm text-sidebar-foreground/50 mt-2">Menunggu</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Waiting Queue */}
          <div>
            <h2 className="text-xl font-semibold mb-6">Antrian Berikutnya</h2>

            <div className="space-y-4">
              {SERVICE_TYPES.map((service) => {
                const waitingTickets = getWaitingTickets(service.id).slice(0, 5);

                return (
                  <div key={service.id} className="bg-sidebar-accent/30 rounded-xl p-4 border border-sidebar-border">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                          <span className="text-sm font-bold text-primary-foreground">{service.prefix}</span>
                        </div>
                        <span className="font-medium">{service.name}</span>
                      </div>
                      <span className="text-sm text-sidebar-foreground/70">
                        {waitingTickets.length} antrian
                      </span>
                    </div>

                    {waitingTickets.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {waitingTickets.map((ticket, index) => (
                          <span
                            key={ticket.id}
                            className={`
                              px-3 py-1 rounded-lg text-sm font-medium
                              ${index === 0 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-sidebar-accent text-sidebar-foreground'
                              }
                            `}
                          >
                            {ticket.displayNumber}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-sidebar-foreground/50 text-center py-2">
                        Tidak ada antrian
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Scrolling Info */}
      <div className="fixed bottom-0 left-0 right-0 bg-primary text-primary-foreground py-3 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap">
          <span className="mx-8">Selamat datang di Bank UCA</span>
          <span className="mx-8">•</span>
          <span className="mx-8">Harap perhatikan nomor antrian Anda</span>
          <span className="mx-8">•</span>
          <span className="mx-8">Segera menuju loket saat nomor dipanggil</span>
          <span className="mx-8">•</span>
          <span className="mx-8">Terima kasih telah menggunakan layanan kami</span>
        </div>
      </div>
    </div>
  );
};

export default DisplayPage;
