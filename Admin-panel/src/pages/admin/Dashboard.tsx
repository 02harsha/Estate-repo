import { AdminLayout } from '@/components/admin/AdminLayout';
import { StatsCard } from '@/components/admin/StatsCard';
import { useDashboardStats, useAuditLogs, useProfiles } from '@/hooks/useAdminData';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  TrendingUp,
  Activity
} from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentLogs } = useAuditLogs({ limit: 5 });
  const { data: recentUsers } = useProfiles({});

  return (
    <AdminLayout 
      title="Dashboard"
      description="Overview of your real estate platform"
    >
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
        {statsLoading ? (
          <>
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </>
        ) : (
          <>
            <StatsCard
              title="Total Users"
              value={stats?.totalUsers ?? 0}
              icon={Users}
              variant="primary"
              href="/admin/users"
              description="All registered users"
            />
            <StatsCard
              title="Active Users"
              value={stats?.activeUsers ?? 0}
              icon={UserCheck}
              href="/admin/users"
              trend={{ value: 12, isPositive: true }}
            />
            <StatsCard
              title="Daily Users"
              value={stats?.dailyUsers ?? 0}
              icon={UserCheck}
             href="/admin/users"
            />
            <StatsCard
              title="Weekly Growth"
              value={stats?.weeklyGrowth ?? 0}
              icon={TrendingUp}
              variant="accent"
              trend={{ value: 8, isPositive: true }}
              description="New registrations"
              href="/admin/users"
            />
            <StatsCard
              title="Monthly Logins"
              value={stats?.monthlyGrowth ?? 0}
              icon={Clock}
              description="Last 30 days"
              href="/admin/users"
            />
          </>
        )}
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        {/* <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
            <Activity className="h-5 w-5 text-muted-foreground" />
          </div>
          
          <div className="space-y-4">
            {recentLogs?.slice(0, 5).map((log) => (
              <div 
                key={log.id}
                className="flex items-center gap-3 text-sm"
              >
                <div className="h-2 w-2 rounded-full bg-accent" />
                <span className="flex-1 text-muted-foreground">
                  {log.action.replace(/_/g, ' ')}
                </span>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(log.created_at), 'HH:mm')}
                </span>
              </div>
            ))}
            
            {(!recentLogs || recentLogs.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No recent activity
              </p>
            )}
          </div>
        </div> */}

        {/* Recent Users */}
        {/* <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Users</h2>
            <Users className="h-5 w-5 text-muted-foreground" />
          </div>
          
          <div className="space-y-3">
            {recentUsers?.slice(0, 5).map((user) => (
              <div 
                key={user.id}
                className="flex items-center gap-3"
              >
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-semibold text-primary">
                    {user.full_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.full_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <span className={`status-${user.account_status}`}>
                  {user.account_status}
                </span>
              </div>
            ))}
            
            {(!recentUsers || recentUsers.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No users yet
              </p>
            )}
          </div>
        </div> */}
      </div>
    </AdminLayout>
  );
}