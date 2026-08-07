import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  (import.meta as any).env?.VITE_SUPABASE_URL ||
  (typeof process !== 'undefined' ? process.env.VITE_SUPABASE_URL : '') ||
  '';
const supabaseAnonKey =
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
  (typeof process !== 'undefined' ? process.env.VITE_SUPABASE_ANON_KEY : '') ||
  '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('your-supabase-project') &&
  !supabaseUrl.includes('example.com') &&
  supabaseAnonKey.length > 10
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: true },
    })
  : null;

// Multi-device Broadcast Sync engine (works across windows, tabs, browsers, and devices)
const syncChannel = typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined'
  ? new BroadcastChannel('nexovira_realtime_admin_events')
  : null;

export const realtimeSync = {
  notifyChange(
    eventType: 'products' | 'prices' | 'orders' | 'categories' | 'announcements' | 'coupons' | 'settings' | 'paystack',
    payload?: any
  ) {
    // 1. Dispatch local browser window event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('nexovira-data-sync', { detail: { eventType, payload } }));
      window.dispatchEvent(new CustomEvent('nexovira-realtime-admin-change', { detail: { eventType, payload } }));
    }

    // 2. Dispatch cross-tab / cross-window BroadcastChannel event
    if (syncChannel) {
      syncChannel.postMessage({ eventType, payload, timestamp: Date.now() });
    }

    // 3. Dispatch Supabase Realtime broadcast if configured
    if (supabase) {
      supabase
        .channel('store-realtime-updates')
        .send({
          type: 'broadcast',
          event: eventType,
          payload: { eventType, payload, timestamp: Date.now() },
        })
        .catch((err) => console.warn('Supabase realtime broadcast error:', err));
    }
  },

  subscribeToChanges(callback: (event: { eventType: string; payload?: any }) => void) {
    // 1. Local window listener
    const localHandler = (e: any) => {
      callback(e.detail || { eventType: 'general' });
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('nexovira-realtime-admin-change', localHandler);
      window.addEventListener('nexovira-data-sync', localHandler);
    }

    // 2. BroadcastChannel cross-tab listener
    const broadcastHandler = (e: MessageEvent) => {
      if (e.data && e.data.eventType) {
        callback({ eventType: e.data.eventType, payload: e.data.payload });
      }
    };
    if (syncChannel) {
      syncChannel.addEventListener('message', broadcastHandler);
    }

    // 3. Supabase Realtime subscription (Broadcast + Postgres Changes)
    let supabaseBroadcastSub: any = null;
    let supabasePostgresSub: any = null;

    if (supabase) {
      supabaseBroadcastSub = supabase
        .channel('store-realtime-updates')
        .on('broadcast', { event: '*' }, (payload) => {
          callback({ eventType: payload.event, payload: payload.payload });
        })
        .subscribe();

      supabasePostgresSub = supabase
        .channel('public:products')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'products' },
          (payload) => {
            console.log('[Supabase Realtime Postgres Change]:', payload);
            callback({ eventType: 'products', payload: { action: payload.eventType, new: payload.new, old: payload.old } });
          }
        )
        .subscribe();
    }

    // 4. Global Server-Sent Events (SSE) Stream listener (/api/realtime/stream)
    let eventSource: EventSource | null = null;
    if (typeof window !== 'undefined' && typeof EventSource !== 'undefined') {
      try {
        eventSource = new EventSource('/api/realtime/stream');
        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data && data.eventType) {
              callback({ eventType: data.eventType, payload: data.payload });
            }
          } catch {}
        };
        eventSource.onerror = () => {
          // Keep connection silent on reconnects
        };
      } catch (sseErr) {
        console.warn('SSE EventSource setup warning:', sseErr);
      }
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('nexovira-realtime-admin-change', localHandler);
        window.removeEventListener('nexovira-data-sync', localHandler);
      }
      if (syncChannel) {
        syncChannel.removeEventListener('message', broadcastHandler);
      }
      if (supabase) {
        if (supabaseBroadcastSub) supabase.removeChannel(supabaseBroadcastSub);
        if (supabasePostgresSub) supabase.removeChannel(supabasePostgresSub);
      }
      if (eventSource) {
        eventSource.close();
      }
    };
  },
};


