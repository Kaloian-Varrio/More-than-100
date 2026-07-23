import { supabase } from './supabase-client.js';

export async function persistManagementOrder(scope, orderedIds) {
  if (!scope || !Array.isArray(orderedIds) || !orderedIds.length) {
    throw new Error('A valid ordering scope and item list are required.');
  }

  const { error } = await supabase.rpc('reorder_management_items', {
    order_scope: scope,
    ordered_ids: orderedIds,
  });
  if (error) throw error;
}
