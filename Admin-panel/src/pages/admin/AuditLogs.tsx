import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AuditLogTable } from '@/components/admin/AuditLogTable';
import { useAuditLogs } from '@/hooks/useAdminData';
import { Skeleton } from '@/components/ui/skeleton';

export default function AuditLogs() {
  const [actionFilter, setActionFilter] = useState('all');
  
  const { data: logs, isLoading } = useAuditLogs({ 
    action: actionFilter === 'all' ? undefined : actionFilter 
  });

  return (
    <AdminLayout 
      title="Audit Logs"
      description="View all system activity and security events"
    >
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      ) : (
        <AuditLogTable 
          logs={logs || []} 
          actionFilter={actionFilter}
          onActionFilterChange={setActionFilter}
        />
      )}
    </AdminLayout>
  );
}