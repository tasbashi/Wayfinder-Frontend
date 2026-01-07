/**
 * DEPRECATED - Redirect to new floor detail screen
 * 
 * This file is kept for route compatibility.
 * Use /buildings/[id]/floor/[floorId] instead.
 */

import { useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function FloorDetailRedirect() {
  const router = useRouter();
  const { id, floorId } = useLocalSearchParams<{ id: string; floorId: string }>();

  useEffect(() => {
    // Redirect to new route structure
    if (id && floorId) {
      router.replace(`/buildings/${id}/floor/${floorId}`);
    } else {
      router.back();
    }
  }, [id, floorId, router]);

  return null;
}
