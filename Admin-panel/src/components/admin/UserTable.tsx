import { useState } from 'react';
import {
  Search,
  Filter,
  MoreVertical,
  UserCheck,
  UserX,
  Settings,
  ChevronDown,
  Download
} from 'lucide-react';
import { Profile, useUpdateProfile, useFeatureToggles, useUpdateFeatureToggle } from '@/hooks/useAdminData';
import { useAuth } from '@/lib/auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface UserTableProps {
  users: Profile[];
  onFilterChange: (filters: { status?: string; role?: string; search?: string }) => void;
  filters: { status?: string; role?: string; search?: string };
}

const roleColors: Record<string, string> = {
  admin: 'role-admin',
  agent: 'role-agent',
  broker: 'bg-info/10 text-info',
  builder: 'bg-warning/10 text-warning',
  seller: 'bg-accent/10 text-accent',
  buyer: 'role-default',
};

const statusColors: Record<string, string> = {
  active: 'status-active',
  disabled: 'status-disabled',
  pending: 'status-pending',
};

export function UserTable({ users, onFilterChange, filters }: UserTableProps) {
  const { user: adminUser } = useAuth();
  const updateProfile = useUpdateProfile();
  const updateToggle = useUpdateFeatureToggle();
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [showFeatureDialog, setShowFeatureDialog] = useState(false);

  const { data: featureToggles } = useFeatureToggles(selectedUser?.user_id);

  const handleStatusChange = async (userId: string, newStatus: 'active' | 'disabled') => {
    if (!adminUser) return;

    try {
      await updateProfile.mutateAsync({
        userId,
        updates: { account_status: newStatus },
        adminId: adminUser.id,
      });
      toast.success(`User ${newStatus === 'active' ? 'activated' : 'disabled'} successfully`);
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const handleToggleFeature = async (toggleId: string, isEnabled: boolean) => {
    if (!adminUser || !selectedUser) return;

    try {
      await updateToggle.mutateAsync({
        toggleId,
        isEnabled,
        userId: selectedUser.user_id,
        adminId: adminUser.id,
      });
      toast.success(`Feature ${isEnabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error('Failed to update feature');
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/admin/users/export');
      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users_export_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Export downloaded successfully');
    } catch (error) {
      toast.error('Failed to download export');
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users by name..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            className="pl-10"
          />
        </div>

        {/* <Select
          value={filters.status || 'all'}
          onValueChange={(value) => onFilterChange({ ...filters, status: value })}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="disabled">Disabled</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select> */}

        <Button variant="outline" className="gap-2" onClick={handleExport}>
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                {/* <th>Role</th> */}
                <th>Status</th>
                {/* <th>Last Login</th> */}
                <th>Created</th>
                {/* <th className="text-right">Actions</th> */}
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="animate-fade-in">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            {user.full_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{user.full_name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    {/* <td>
                      <span className={cn('role-badge', roleColors[user.role] || 'role-default')}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td> */}
                    <td>
                      <span className={cn(statusColors[user.account_status])}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {user.account_status.charAt(0).toUpperCase() + user.account_status.slice(1)}
                      </span>
                    </td>
                    {/* <td className="text-muted-foreground text-sm">
                      {user.last_login 
                        ? format(new Date(user.last_login), 'MMM d, yyyy HH:mm')
                        : 'Never'
                      }
                    </td> */}
                    <td className="text-muted-foreground text-sm">
                      {format(new Date(user.created_at), 'MMM d, yyyy')}
                    </td>
                    {/* <td className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user);
                              setShowFeatureDialog(true);
                            }}
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            Feature Access
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {user.account_status === 'active' ? (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(user.user_id, 'disabled')}
                              className="text-destructive focus:text-destructive"
                            >
                              <UserX className="h-4 w-4 mr-2" />
                              Disable User
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(user.user_id, 'active')}
                              className="text-success focus:text-success"
                            >
                              <UserCheck className="h-4 w-4 mr-2" />
                              Activate User
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td> */}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Feature Toggle Dialog */}
      <Dialog open={showFeatureDialog} onOpenChange={setShowFeatureDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Feature Access Control</DialogTitle>
            <DialogDescription>
              Manage feature access for {selectedUser?.full_name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {featureToggles?.map((toggle) => (
              <div
                key={toggle.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30"
              >
                <div>
                  <p className="font-medium">{toggle.feature_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {toggle.feature_key}
                  </p>
                </div>
                <Switch
                  checked={toggle.is_enabled}
                  onCheckedChange={(checked) => handleToggleFeature(toggle.id, checked)}
                />
              </div>
            ))}

            {(!featureToggles || featureToggles.length === 0) && (
              <p className="text-center py-8 text-muted-foreground">
                No feature toggles available
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}