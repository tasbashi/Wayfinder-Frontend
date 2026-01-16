/**
 * Format distance in meters/kilometers
 */
export const formatDistance = (meters: number): string => {
    if (meters < 1000) {
        return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
};

/**
 * Format time in minutes/hours
 */
export const formatTime = (minutes: number): string => {
    if (minutes < 60) {
        return `${Math.round(minutes)} dk`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    return `${hours} sa ${remainingMinutes} dk`;
};

/**
 * Format estimated arrival time
 */
export const formatETA = (minutes: number): string => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + minutes);
    return now.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
};

/**
 * Format coordinates for display
 */
export const formatCoordinates = (x: number, y: number): string => {
    return `(${x.toFixed(1)}, ${y.toFixed(1)})`;
};

/**
 * Format floor level for display
 */
export const formatFloorLevel = (level: number): string => {
    if (level === 0) return "Zemin Kat";
    if (level < 0) return `Bodrum ${Math.abs(level)}`;
    return `${level}. Kat`;
};

/**
 * Capitalize first letter
 */
export const capitalize = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
