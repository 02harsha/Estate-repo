// Mock Supabase client since Supabase has been removed
export const supabase = {
  auth: {
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
    getSession: async () => ({ data: { session: null } }),
    signInWithPassword: async () => ({ error: { message: 'Supabase is removed' } }),
    signUp: async () => ({ error: { message: 'Supabase is removed' } }),
    signOut: async () => { },
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        maybeSingle: async () => ({ data: null }),
        eq: () => ({ maybeSingle: async () => ({ data: null }) }),
        order: () => ({ limit: () => Promise.resolve({ data: [], error: null }) }),
      }),
      order: () => Promise.resolve({ data: [], error: null }),
      insert: async () => ({ error: null }),
      update: () => ({ eq: async () => ({ error: null }) }),
    }),
  }),
} as any;
