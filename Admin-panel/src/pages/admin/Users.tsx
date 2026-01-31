import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { UserTable } from '@/components/admin/UserTable';
import { useProfiles } from '@/hooks/useAdminData';
import { Skeleton } from '@/components/ui/skeleton';

interface UserFilters {
  status: string;
  role: string;
  search: string;
}

export default function Users() {
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'all';
  
  const [filters, setFilters] = useState<UserFilters>({
    status: initialStatus,
    role: 'all',
    search: '',
  });

  const handleFilterChange = (newFilters: { status?: string; role?: string; search?: string }) => {
    setFilters({
      status: newFilters.status ?? filters.status,
      role: newFilters.role ?? filters.role,
      search: newFilters.search ?? filters.search,
    });
  };

  const { data: users, isLoading } = useProfiles(filters);

  return (
    <AdminLayout 
      title="User Management"
      description="Manage all users, their roles, and feature access"
    >
      {isLoading ? (
        <div className="space-y-4">
          <div className="flex gap-3">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-40" />
          </div>
          <Skeleton className="h-96 rounded-xl" />
        </div>
      ) : (
        <UserTable 
          users={users || []} 
          filters={filters}
          onFilterChange={handleFilterChange}
        />
      )}
    </AdminLayout>
  );
}