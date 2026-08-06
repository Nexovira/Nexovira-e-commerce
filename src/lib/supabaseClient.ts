import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-supabase-project'));

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Multi-device Broadcast Sync engine (works across windows, tabs, and devices)
const syncChannel = new BroadcastChannel('nexovira_realtime_admin_events');

export const realtimeSync = {
  notifyChange(eventType: 'products' | 'prices' | 'orders' | 'categories' | 'announcements' | 'coupons' | 'settings' | 'paystack', payload?: any) {
    // 1. Dispatch local browser event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('nexovira-data-sync', { detail: { eventType, payload } }));
      window.dispatchEvent(new CustomEvent('nexovira-realtime-admin-change', { detail: { eventType, payload } }));
    }

    // 2. Dispatch cross-tab / cross-window BroadcastChannel event
    syncChannel.postMessage({ eventType, payload, timestamp: Date.now() });

    // 3. Dispatch Supabase Realtime broadcast if configured
    if (supabase) {
      supabase.channel('store-realtime-updates').send({
        type: 'broadcast',
        event: eventType,
        payload: { eventType, payload, timestamp: Date.now() },
      }).catch((err) => console.warn('Supabase realtime broadcast error:', err));
    }
  },

  subscribeToChanges(callback: (event: { eventType: string; payload?: any }) => void) {
    // Local window listener
    const localHandler = (e: any) => {
      callback(e.detail || { eventType: 'general' });
    };
    window.addEventListener('nexovira-realtime-admin-change', localHandler);
    window.addEventListener('nexovira-data-sync', localHandler);

    // BroadcastChannel cross-tab listener
    const broadcastHandler = (e: MessageEvent) => {
      if (e.data && e.data.eventType) {
        callback({ eventType: e.data.eventType, payload: e.data.payload });
      }
    };
    syncChannel.addEventListener('message', broadcastHandler);

    // Supabase Realtime subscription
    let supabaseSub: any = null;
    if (supabase) {
      supabaseSub = supabase
        .channel('store-realtime-updates')
        .on('broadcast', { event: '*' }, (payload) => {
          callback({ eventType: payload.event, payload: payload.payload });
        })
        .subscribe();
    }

    return () => {
      window.removeEventListener('nexovira-realtime-admin-change', localHandler);
      window.removeEventListener('nexovira-data-sync', localHandler);
      syncChannel.removeEventListener('message', broadcastHandler);
      if (supabaseSub && supabase) {
        supabase.removeChannel(supabaseSub);
      }
    };
  }
};

