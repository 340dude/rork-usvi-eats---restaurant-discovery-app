import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export type AnalyticsEventType = 'view' | 'call' | 'directions';

interface AnalyticsEvent {
  type: AnalyticsEventType;
  created_at: string;
}

// Fire-and-forget: tracking should never block or interrupt the user.
export async function logAnalyticsEvent(restaurantId: string, type: AnalyticsEventType) {
  const { error } = await supabase.from('analytics_events').insert({ restaurant_id: restaurantId, type });
  if (error) console.warn('Failed to log analytics event:', error.message);
}

// Fetches a trailing 30 days of raw events; period totals and the 7-day
// chart are both derived from this same set client-side (see aggregateAnalytics).
export const useAnalyticsEvents = (restaurantId: string | undefined) => {
  return useQuery({
    queryKey: ['analytics-events', restaurantId],
    queryFn: async () => {
      const since = new Date();
      since.setHours(0, 0, 0, 0);
      since.setDate(since.getDate() - 29);

      const { data, error } = await supabase
        .from('analytics_events')
        .select('type, created_at')
        .eq('restaurant_id', restaurantId)
        .gte('created_at', since.toISOString());

      if (error) throw error;
      return data as AnalyticsEvent[];
    },
    enabled: !!restaurantId,
  });
};

export interface DailyCount {
  day: string;
  views: number;
  calls: number;
  directions: number;
}

export interface AnalyticsSummary {
  profileViews: number;
  callTaps: number;
  directionTaps: number;
  dailyBreakdown: DailyCount[];
}

// Local (not UTC) calendar-day key, so an event logged late in the evening
// buckets into the viewer's actual day rather than shifting to the next UTC day.
const localDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export function aggregateAnalytics(events: AnalyticsEvent[], period: 'day' | 'week' | 'month'): AnalyticsSummary {
  const periodStart = new Date();
  periodStart.setHours(0, 0, 0, 0);
  if (period === 'week') periodStart.setDate(periodStart.getDate() - 6);
  if (period === 'month') periodStart.setDate(periodStart.getDate() - 29);

  // Chart always covers the last 7 days, independent of the selected period.
  const days: DailyCount[] = [];
  const dayIndex = new Map<string, number>();
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    dayIndex.set(localDateKey(d), days.length);
    days.push({ day: d.toLocaleDateString('en-US', { weekday: 'short' }), views: 0, calls: 0, directions: 0 });
  }

  const summary: AnalyticsSummary = { profileViews: 0, callTaps: 0, directionTaps: 0, dailyBreakdown: days };

  for (const event of events) {
    const eventDate = new Date(event.created_at);

    if (eventDate >= periodStart) {
      if (event.type === 'view') summary.profileViews++;
      if (event.type === 'call') summary.callTaps++;
      if (event.type === 'directions') summary.directionTaps++;
    }

    const idx = dayIndex.get(localDateKey(eventDate));
    if (idx !== undefined) {
      if (event.type === 'view') days[idx].views++;
      if (event.type === 'call') days[idx].calls++;
      if (event.type === 'directions') days[idx].directions++;
    }
  }

  return summary;
}
