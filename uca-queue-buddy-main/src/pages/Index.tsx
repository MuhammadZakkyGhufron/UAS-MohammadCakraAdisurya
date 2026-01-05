import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQueue } from '@/context/QueueContext';
import { SERVICE_TYPES } from '@/types/queue';
import { Ticket, Monitor, Users, BarChart3, ArrowRight, Clock, CheckCircle } from 'lucide-react';

const Index = () => {
  const { getWaitingCount, getCurrentServing, todayStats } = useQueue();

  const totalWaiting = getWaitingCount();
  const currentlyServing = getCurrentServing().length;

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-5" />
        <div className="container py-16 md:py-24 relative">
          <div className="text-center max-w-3xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-8 animate-fade-in">
              <Ticket className="h-4 w-4" />
              <span className="text-sm font-medium">Sistem Antrian Cerdas dengan AI</span>
            </div>
            
            {/* Main Title */}
            <h1 className="text-4xl md:text-6xl font-bold mb-8 animate-slide-up">
              <span className="inline-block px-6 py-3 rounded-lg gradient-primary text-white">
                Sistem Antrian Bank UCA
              </span>
            </h1>
            
            {/* Description */}
            <p className="text-lg md:text-xl text-muted-foreground mb-8 animate-fade-in max-w-2xl mx-auto">
              Nikmati pengalaman antrian bank modern dengan sistem digital cerdas,
              dan layanan pelanggan AI yang siap membantu 24/7.
            </p>
            
            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
              <Button asChild size="lg" className="gradient-primary text-primary-foreground hover:opacity-90 px-8">
                <Link to="/customer">
                  Ambil Nomor Antrian
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="px-8">
                <Link to="/display">
                  Cek Antrian
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Live Stats */}
      <section className="py-12 bg-card border-y border-border">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                {totalWaiting}
              </div>
              <p className="text-sm text-muted-foreground">Menunggu</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-accent mb-2">
                {currentlyServing}
              </div>
              <p className="text-sm text-muted-foreground">Sedang Dilayani</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-success mb-2">
                {todayStats.totalServed}
              </div>
              <p className="text-sm text-muted-foreground">Terlayani Hari Ini</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-warning mb-2">
                {Math.round(todayStats.averageWaitTime)}
              </div>
              <p className="text-sm text-muted-foreground">Rata-rata Tunggu (menit)</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Layanan Kami</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Pilih layanan sesuai kebutuhan Anda
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {SERVICE_TYPES.map((service) => {
              const waiting = getWaitingCount(service.id);
              
              return (
                <Card key={service.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                        <span className="text-xl font-bold text-primary-foreground">{service.prefix}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-foreground">{waiting}</span>
                        <p className="text-xs text-muted-foreground">menunggu</p>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">{service.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{service.description}</p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>Estimasi {service.estimatedTime} menit</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Access */}
      <section className="py-16 bg-secondary/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Akses Cepat</h2>
            <p className="text-muted-foreground">Menu untuk nasabah dan petugas</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Ticket, title: 'Ambil Antrian', desc: 'Untuk nasabah', path: '/customer', color: 'bg-primary' },
              { icon: Monitor, title: 'Display Antrian', desc: 'Layar informasi', path: '/display', color: 'bg-info' },
              { icon: Users, title: 'Panel Petugas', desc: 'Kelola antrian', path: '/officer', color: 'bg-accent' },
              { icon: BarChart3, title: 'Statistik', desc: 'Laporan & analisis', path: '/statistics', color: 'bg-success' },
            ].map((item) => (
              <Link key={item.path} to={item.path}>
                <Card className="h-full hover:shadow-lg transition-all hover:-translate-y-1 group">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <item.icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{item.desc}</p>
                    <div className="flex items-center text-primary text-sm font-medium">
                      Buka
                      <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Mengapa Memilih Kami?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { icon: Clock, title: 'Hemat Waktu', desc: 'Ambil nomor antrian tanpa perlu mengantri fisik' },
              { icon: Monitor, title: 'Real-time', desc: 'Pantau status antrian secara langsung di layar' },
              { icon: CheckCircle, title: 'Efisien', desc: 'Sistem terorganisir untuk pelayanan lebih cepat' },
            ].map((feature, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Index;
