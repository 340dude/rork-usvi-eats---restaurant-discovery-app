import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { SpecialHours } from '@/types/restaurant';

interface SpecialHoursRow {
  id: string;
  restaurant_id: string;
  date: string;
  reason: string;
  closed: boolean;
  open_time: string | null;
  close_time: string | null;
  created_at: string;
}

const rowToSpecialHours = (row: SpecialHoursRow): SpecialHours => ({
  id: row.id,
  restaurantId: row.restaurant_id,
  date: row.date,
  reason: row.reason,
  closed: row.closed,
  openTime: row.open_time ?? undefined,
  closeTime: row.close_time ?? undefined,
  createdAt: row.created_at,
});

export const useSpecialHours = (restaurantId?: string) => {
  return useQuery({
    queryKey: ['special-hours', restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('special_hours')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('date', { ascending: true });

      if (error) throw error;
      return (data as SpecialHoursRow[]).map(rowToSpecialHours);
    },
    enabled: !!restaurantId,
  });
};

type NewSpecialHours = {
  restaurantId: string;
  date: string;
  reason: string;
  closed: boolean;
  openTime?: string;
  closeTime?: string;
};

export const useAddSpecialHours = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entry: NewSpecialHours) => {
      const { data, error } = await supabase
        .from('special_hours')
        .insert({
          restaurant_id: entry.restaurantId,
          date: entry.date,
          reason: entry.reason,
          closed: entry.closed,
          open_time: entry.closed ? null : entry.openTime,
          close_time: entry.closed ? null : entry.closeTime,
        })
        .select('*')
        .single();

      if (error) throw error;
      return rowToSpecialHours(data as SpecialHoursRow);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['special-hours', variables.restaurantId] });
    },
  });
};

export const useDeleteSpecialHours = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: string; restaurantId: string }) => {
      const { error } = await supabase.from('special_hours').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['special-hours', variables.restaurantId] });
    },
  });
};
