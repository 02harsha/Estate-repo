import { format } from 'date-fns';
import { AuditLog } from '@/hooks/useAdminData';
import { 
  UserCog, 
  ToggleLeft, 
  LogIn, 
  AlertTriangle,
  Shield,
  KeyRound,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AuditLogTableProps {
  logs: AuditLog[];
  actionFilter: string;
  onActionFilterChange: (action: string) => void;
}

const actionIcons: Record<string, typeof UserCog> = {
  user_status_change: UserCog,
  button_access_change: ToggleLeft,
  admin_login: LogIn,
  admin_login_failed: AlertTriangle,
  admin_2fa_failed: Shield,
  password_change: KeyRound,
  username_change: User,
  role_change: UserCog,
};

const actionLabels: Record<string, string> = {
  user_status_change: 'User Status Changed',
  button_access_change: 'Feature Access Updated',
  admin_login: 'Admin Login',
  admin_login_failed: 'Login Failed',
  admin_2fa_failed: '2FA Failed',
  password_change: 'Password Changed',
  username_change: 'Username Changed',
  role_change: 'Role Changed',
};

const actionColors: Record<string, string> = {
  user_status_change: 'bg-info/10 text-info',
  button_access_change: 'bg-accent/10 text-accent',
  admin_login: 'bg-success/10 text-success',
  admin_login_failed: 'bg-destructive/10 text-destructive',
  admin_2fa_failed: 'bg-warning/10 text-warning',
  password_change: 'bg-primary/10 text-primary',
  username_change: 'bg-secondary text-secondary-foreground',
  role_change: 'bg-muted text-muted-foreground',
};

export function AuditLogTable({ logs, actionFilter, onActionFilterChange }: AuditLogTableProps) {
  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex items-center gap-3">
        <Select value={actionFilter} onValueChange={onActionFilterChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="user_status_change">User Status Changes</SelectItem>
            <SelectItem value="button_access_change">Feature Access</SelectItem>
            <SelectItem value="admin_login">Admin Logins</SelectItem>
            <SelectItem value="admin_login_failed">Failed Logins</SelectItem>
            <SelectItem value="admin_2fa_failed">Failed 2FA</SelectItem>
            <SelectItem value="password_change">Password Changes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Log List */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="divide-y divide-border">
          {logs.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              No audit logs found
            </div>
          ) : (
            logs.map((log, index) => {
              const Icon = actionIcons[log.action] || UserCog;
              
              return (
                <div 
                  key={log.id}
                  className="flex items-start gap-4 p-4 hover:bg-muted/30 transition-colors animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                    actionColors[log.action] || 'bg-muted text-muted-foreground'
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">
                        {actionLabels[log.action] || log.action}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(log.created_at), 'MMM d, yyyy HH:mm:ss')}
                      </span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mt-1">
                      Admin ID: {log.admin_id.slice(0, 8)}...
                      {log.target_user_id && (
                        <> • Target: {log.target_user_id.slice(0, 8)}...</>
                      )}
                    </p>

                    {log.details && Object.keys(log.details).length > 0 && (
                      <pre className="mt-2 text-xs bg-muted/50 p-2 rounded-md overflow-x-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    )}

                    {log.ip_address && (
                      <p className="text-xs text-muted-foreground mt-2">
                        IP: {log.ip_address}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}