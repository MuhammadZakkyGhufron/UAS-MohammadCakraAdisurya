import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck, ShieldOff, UserPlus, Search } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ProfileWithRole {
  id: string;
  user_id: string;
  email: string | null;
  created_at: string;
  is_admin: boolean;
}

const AdminManagementPage = () => {
  const navigate = useNavigate();
  const { user, isLoading, isAdmin } = useAuth();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<ProfileWithRole[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    } else if (!isLoading && !isAdmin) {
      navigate('/officer');
      toast({
        title: "Akses Ditolak",
        description: "Anda tidak memiliki izin untuk mengakses halaman ini",
        variant: "destructive",
      });
    }
  }, [user, isLoading, isAdmin, navigate, toast]);

  const fetchProfiles = async () => {
    try {
      setLoadingProfiles(true);
      
      // Fetch all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (profilesError) throw profilesError;

      // Fetch all admin roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');
      
      if (rolesError) throw rolesError;

      const adminUserIds = new Set(rolesData?.map(r => r.user_id) || []);

      const profilesWithRole = (profilesData || []).map(profile => ({
        ...profile,
        is_admin: adminUserIds.has(profile.user_id),
      }));

      setProfiles(profilesWithRole);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data user",
        variant: "destructive",
      });
    } finally {
      setLoadingProfiles(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchProfiles();
    }
  }, [isAdmin]);

  const handleToggleAdmin = async (userId: string, email: string | null, currentlyAdmin: boolean) => {
    try {
      if (currentlyAdmin) {
        // Remove admin role
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', 'admin');

        if (error) throw error;

        toast({
          title: "Berhasil",
          description: `Role admin untuk ${email || userId} berhasil dihapus`,
        });
      } else {
        // Add admin role
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: 'admin' });

        if (error) throw error;

        toast({
          title: "Berhasil",
          description: `${email || userId} berhasil dijadikan admin`,
        });
      }

      fetchProfiles();
    } catch (error) {
      console.error('Error toggling admin role:', error);
      toast({
        title: "Error",
        description: "Gagal mengubah role admin",
        variant: "destructive",
      });
    }
  };

  const filteredProfiles = profiles.filter(profile => 
    profile.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const adminCount = profiles.filter(p => p.is_admin).length;

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p>Loading...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <CardTitle>Kelola Admin</CardTitle>
            </div>
            <CardDescription>
              Tambah atau hapus role admin untuk user. Saat ini ada {adminCount} admin.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari berdasarkan email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {loadingProfiles ? (
              <p className="text-center py-4">Memuat data...</p>
            ) : filteredProfiles.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">
                {searchQuery ? 'Tidak ada user yang cocok' : 'Belum ada user terdaftar'}
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProfiles.map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell className="font-medium">
                        {profile.email || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {profile.is_admin ? (
                          <Badge className="bg-primary">
                            <ShieldCheck className="h-3 w-3 mr-1" />
                            Admin
                          </Badge>
                        ) : (
                          <Badge variant="secondary">User</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {profile.user_id !== user?.id ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant={profile.is_admin ? "destructive" : "default"}
                                size="sm"
                              >
                                {profile.is_admin ? (
                                  <>
                                    <ShieldOff className="h-4 w-4 mr-1" />
                                    Hapus Admin
                                  </>
                                ) : (
                                  <>
                                    <UserPlus className="h-4 w-4 mr-1" />
                                    Jadikan Admin
                                  </>
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  {profile.is_admin ? 'Hapus Role Admin?' : 'Jadikan Admin?'}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {profile.is_admin 
                                    ? `Anda yakin ingin menghapus role admin dari ${profile.email}?`
                                    : `Anda yakin ingin menjadikan ${profile.email} sebagai admin?`
                                  }
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleToggleAdmin(profile.user_id, profile.email, profile.is_admin)}
                                >
                                  {profile.is_admin ? 'Hapus Admin' : 'Jadikan Admin'}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          <Badge variant="outline">Anda</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AdminManagementPage;
