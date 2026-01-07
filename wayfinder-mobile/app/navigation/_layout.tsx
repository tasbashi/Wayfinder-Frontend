/**
 * Navigation Routes Layout
 * 
 * Stack layout for navigation flow screens.
 */

import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function NavigationLayout() {
    const { t } = useTranslation();

    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen name="select-start" />
            <Stack.Screen name="select-end" />
            <Stack.Screen name="result" />
            <Stack.Screen
                name="active"
                options={{
                    animation: 'fade',
                    gestureEnabled: false,
                }}
            />
        </Stack>
    );
}
