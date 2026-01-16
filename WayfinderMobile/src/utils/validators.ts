/**
 * Validate QR code format (UUID expected)
 */
export const isValidQRCode = (qrCode: string): boolean => {
    if (!qrCode || typeof qrCode !== "string") return false;

    // UUID v4 format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(qrCode);
};

/**
 * Validate node coordinates
 */
export const isValidCoordinate = (value: number): boolean => {
    return typeof value === "number" && isFinite(value);
};

/**
 * Validate required string field
 */
export const isNonEmptyString = (value: unknown): value is string => {
    return typeof value === "string" && value.trim().length > 0;
};

/**
 * Validate UUID format
 */
export const isValidUUID = (value: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
};
