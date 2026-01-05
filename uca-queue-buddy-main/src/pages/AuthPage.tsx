import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MainLayout } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Lock, Mail, LogIn, UserPlus, ShieldCheck, Users, Info } from 'lucide-react';
import { useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const authSchema = z.object({
  email: z.string().trim().email({ message: 'Email tidak valid' }).max(255),
  password: z.string().min(6, { message: 'Password minimal 6 karakter' }).max(100),
});

type AuthFormData = z.infer<typeof authSchema>;

const AuthPage = () => {
  const navigate = useNavigate();
  const { signIn, signUp, user, isLoading, isAdmin } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [registerType, setRegisterType] = useState<'user' | 'admin'>('user');

  const form = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (user && !isLoading) {
      navigate('/officer');
    }
  }, [user, isLoading, navigate]);

  const handleLogin = async (data: AuthFormData) => {
    setIsSubmitting(true);
    const { error } = await signIn(data.email, data.password);
    setIsSubmitting(false);

    if (error) {
      let message = 'Gagal masuk. Silakan coba lagi.';
      if (error.message.includes('Invalid login credentials')) {
        message = 'Email atau password salah';
      } else if (error.message.includes('Email not confirmed')) {
        message = 'Email belum dikonfirmasi';
      }
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } else {
      toast({ title: 'Berhasil', description: 'Selamat datang!' });
      navigate('/officer');
    }
  };

  const handleSignUp = async (data: AuthFormData) => {
    setIsSubmitting(true);
    const { error } = await signUp(data.email, data.password);
    setIsSubmitting(false);

    if (error) {
      let message = 'Gagal mendaftar. Silakan coba lagi.';
      if (error.message.includes('User already registered')) {
        message = 'Email sudah terdaftar';
      }
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } else {
      if (registerType === 'admin') {
        toast({ 
          title: 'Berhasil', 
          description: 'Akun berhasil dibuat! Untuk menjadi admin, hubungi admin yang sudah ada untuk memberikan akses.',
        });
      } else {
        toast({ title: 'Berhasil', description: 'Akun berhasil dibuat! Silakan login.' });
      }
      setActiveTab('login');
      form.reset();
    }
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

  return (
    <MainLayout>
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Login Sistem</CardTitle>
            <CardDescription>Masuk atau daftar untuk mengakses sistem antrian</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Masuk</TabsTrigger>
                <TabsTrigger value="register">Daftar</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input placeholder="email@bank.com" className="pl-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input type="password" placeholder="••••••" className="pl-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full gradient-primary" disabled={isSubmitting}>
                      <LogIn className="h-4 w-4 mr-2" />
                      {isSubmitting ? 'Memproses...' : 'Masuk'}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="register" className="space-y-4">
                {/* Register Type Selection */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRegisterType('user')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      registerType === 'user' 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Users className={`h-8 w-8 mx-auto mb-2 ${registerType === 'user' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <p className={`font-medium text-sm ${registerType === 'user' ? 'text-primary' : 'text-foreground'}`}>User / Petugas</p>
                    <p className="text-xs text-muted-foreground mt-1">Akses halaman petugas</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegisterType('admin')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      registerType === 'admin' 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <ShieldCheck className={`h-8 w-8 mx-auto mb-2 ${registerType === 'admin' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <p className={`font-medium text-sm ${registerType === 'admin' ? 'text-primary' : 'text-foreground'}`}>Admin</p>
                    <p className="text-xs text-muted-foreground mt-1">Kelola user & sistem</p>
                  </button>
                </div>

                {registerType === 'admin' && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Informasi Pendaftaran Admin</AlertTitle>
                    <AlertDescription className="text-sm">
                      Setelah mendaftar, Anda perlu menghubungi admin yang sudah ada untuk mendapatkan akses admin. 
                      Jika ini adalah akun admin pertama, hubungi pengelola sistem.
                    </AlertDescription>
                  </Alert>
                )}

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSignUp)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input placeholder="email@bank.com" className="pl-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input type="password" placeholder="••••••" className="pl-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full gradient-primary" disabled={isSubmitting}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      {isSubmitting ? 'Memproses...' : `Daftar sebagai ${registerType === 'admin' ? 'Admin' : 'User'}`}
                    </Button>
                  </form>
                </Form>

                <p className="text-xs text-center text-muted-foreground">
                  {registerType === 'user' 
                    ? 'User dapat mengakses halaman petugas untuk melayani antrian.' 
                    : 'Admin dapat mengelola user, memberikan akses admin, dan mengatur sistem.'}
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AuthPage;
