import { MainLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQueue } from '@/context/QueueContext';
import { SERVICE_TYPES } from '@/types/queue';
import { Users, Clock, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['hsl(220, 80%, 50%)', 'hsl(160, 70%, 45%)', 'hsl(45, 100%, 50%)'];

const StatisticsPage = () => {
  const { todayStats } = useQueue();

  const serviceData = SERVICE_TYPES.map((service, i) => ({
    name: service.name,
    total: todayStats.byService[service.id].total,
    served: todayStats.byService[service.id].served,
    skipped: todayStats.byService[service.id].skipped,
    color: COLORS[i],
  }));

  const hourlyData = todayStats.hourlyData.filter(h => h.count > 0 || (h.hour >= 8 && h.hour <= 17));

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Statistik Antrian</h1>
          <p className="text-muted-foreground">Laporan dan analisis hari ini</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-3xl font-bold">{todayStats.totalServed + todayStats.totalSkipped}</p>
              <p className="text-sm text-muted-foreground">Total Antrian</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-success" />
              <p className="text-3xl font-bold">{todayStats.totalServed}</p>
              <p className="text-sm text-muted-foreground">Terlayani</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <XCircle className="h-8 w-8 mx-auto mb-2 text-destructive" />
              <p className="text-3xl font-bold">{todayStats.totalSkipped}</p>
              <p className="text-sm text-muted-foreground">Dilewati</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-warning" />
              <p className="text-3xl font-bold">{Math.round(todayStats.averageWaitTime)}</p>
              <p className="text-sm text-muted-foreground">Rata-rata Tunggu (mnt)</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* By Service */}
          <Card>
            <CardHeader><CardTitle>Per Layanan</CardTitle></CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={serviceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="served" name="Terlayani" fill="hsl(160, 70%, 45%)" />
                    <Bar dataKey="skipped" name="Dilewati" fill="hsl(0, 75%, 55%)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Hourly */}
          <Card>
            <CardHeader><CardTitle>Per Jam</CardTitle></CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" tickFormatter={(h) => `${h}:00`} fontSize={12} />
                    <YAxis />
                    <Tooltip labelFormatter={(h) => `${h}:00`} />
                    <Bar dataKey="count" name="Antrian" fill="hsl(220, 80%, 50%)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default StatisticsPage;
