import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { UserReport } from '@/types/restaurant';

interface UserReportRow {
  id: string;
  restaurant_id: string;
  user_id: string | null;
  type: UserReport['type'];
  description: string;
  photo: string | null;
  status: UserReport['status'];
  created_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
}

const rowToReport = (row: UserReportRow): UserReport => ({
  id: row.id,
  restaurantId: row.restaurant_id,
  userId: row.user_id ?? undefined,
  type: row.type,
  description: row.description,
  photo: row.photo ?? undefined,
  status: row.status,
  createdAt: row.created_at,
  resolvedAt: row.resolved_at ?? undefined,
  resolvedBy: row.resolved_by ?? undefined,
});

// Owner-side: all reports filed against their restaurant.
export const useReports = (restaurantId?: string) => {
  return useQuery({
    queryKey: ['reports', restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_reports')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data as UserReportRow[]).map(rowToReport);
    },
    enabled: !!restaurantId,
  });
};

// Customer-side: file a new report. No login required.
export const useSubmitReport = () => {
  return useMutation({
    mutationFn: async (report: {
      restaurantId: string;
      type: UserReport['type'];
      description: string;
      photo?: string;
    }) => {
      const { error } = await supabase.from('user_reports').insert({
        restaurant_id: report.restaurantId,
        type: report.type,
        description: report.description,
        photo: report.photo,
      });

      if (error) throw error;
    },
  });
};

export const useUpdateReportStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'approved' | 'rejected'; restaurantId: string }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('user_reports')
        .update({ status, resolved_at: new Date().toISOString(), resolved_by: user?.id })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reports', variables.restaurantId] });
    },
  });
};
