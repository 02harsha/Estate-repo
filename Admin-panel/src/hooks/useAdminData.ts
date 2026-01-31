import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  city: string | null;
  region: string | null;
  role: 'buyer' | 'seller' | 'agent' | 'broker' | 'builder' | 'admin';
  account_status: 'active' | 'disabled' | 'pending';
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface FeatureToggle {
  id: string;
  user_id: string;
  feature_key: string;
  feature_name: string;
  is_enabled: boolean;
  updated_at: string;
  updated_by: string | null;
}

export interface AuditLog {
  id: string;
  admin_id: string;
  action: string;
  target_user_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

// Mock Data
const MOCK_PROFILES: Profile[] = [
  {
    id: '1',
    user_id: '1',
    full_name: 'John Doe',
    email: 'john@example.com',
    phone: '1234567890',
    city: 'New York',
    region: 'NY',
    role: 'buyer',
    account_status: 'active',
    last_login: new Date().toISOString(),
    created_at: new Date(Date.now() - 10000000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: '2',
    full_name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '0987654321',
    city: 'Los Angeles',
    region: 'CA',
    role: 'agent',
    account_status: 'active',
    last_login: new Date().toISOString(),
    created_at: new Date(Date.now() - 5000000).toISOString(),
    updated_at: new Date().toISOString(),
  }
];

const MOCK_TOGGLES: FeatureToggle[] = [];
const MOCK_LOGS: AuditLog[] = [];

export function useProfiles(filters?: { status?: string; role?: string; search?: string }) {
  return useQuery({
    queryKey: ['profiles', filters],
    queryFn: async () => {
      let url = 'http://localhost:3000/api/admin/users';
      const params = new URLSearchParams();

      if (filters?.search) {
        params.append('search', filters.search);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      return response.json();
    },
  });
}

export function useFeatureToggles(userId?: string) {
  return useQuery({
    queryKey: ['feature-toggles', userId],
    queryFn: async () => {
      return MOCK_TOGGLES;
    },
    enabled: !!userId || userId === undefined,
  });
}

export function useAuditLogs(filters?: { action?: string; limit?: number }) {
  return useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: async () => {
      return MOCK_LOGS;
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      updates,
      adminId
    }: {
      userId: string;
      updates: Partial<Profile>;
      adminId: string;
    }) => {
      // Mock update
      console.log('Updating profile', userId, updates);
      await new Promise(resolve => setTimeout(resolve, 500));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
    },
  });
}

export function useUpdateFeatureToggle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      toggleId,
      isEnabled,
      userId,
      adminId,
    }: {
      toggleId: string;
      isEnabled: boolean;
      userId: string;
      adminId: string;
    }) => {
      console.log('Updating toggle', toggleId, isEnabled);
      await new Promise(resolve => setTimeout(resolve, 500));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-toggles'] });
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
    },
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3000/api/admin/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }
      return response.json();
    },
  });
}
