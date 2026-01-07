/**
 * Buildings Routes Layout
 * 
 * Stack layout for building detail screens.
 */

import { Stack } from 'expo-router';

export default function BuildingsLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen name="[id]/index" />
            <Stack.Screen name="[id]/floor/[floorId]" />
        </Stack>
    );
}
