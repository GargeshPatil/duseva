/**
 * Shared utility to sanitize incoming text data.
 * Replaces the Unicode Replacement Character (U+FFFD) and other typical 
 * unwanted encoding artifacts with standard characters or removes them.
 */
export function sanitizeText(text: string | undefined | null): string {
    if (!text) return "";
    
    // Replace the Unicode replacement character (\uFFFD) with a standard apostrophe
    // This often happens when smart quotes or apostrophes are malformed during import
    let cleanedText = text.replace(/\uFFFD/g, "'");

    return cleanedText;
}

export function sanitizeObject<T>(obj: T): T {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'string') {
        return sanitizeText(obj) as unknown as T;
    }
    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item)) as unknown as T;
    }
    if (typeof obj === 'object') {
        const result: any = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                result[key] = sanitizeObject((obj as any)[key]);
            }
        }
        return result as T;
    }
    return obj;
}
