/**
 * Normalizes a tag string to Title Case and applies specific overrides.
 * 
 * @param tag The tag string to normalize
 * @returns The normalized tag string
 */
export function normalizeTag(tag: string): string {
    if (!tag) return "";

    const trimmed = tag.trim();
    if (!trimmed) return "";

    // Specific overrides map (lowercase -> Correct Format)
    const overrides: Record<string, string> = {
        "na": "N/A",
        "n/a": "N/A",
        "cuet": "CUET",
        "english": "English",
        "math": "Mathematics",
        "maths": "Mathematics",
        "mathematics": "Mathematics",
        "physics": "Physics",
        "chemistry": "Chemistry",
        "general test": "General Test",
        "accountancy": "Accountancy",
        "business studies": "Business Studies",
        "economics": "Economics",
        "biology": "Biology",
        "history": "History",
        "political science": "Political Science",
        "geography": "Geography",
        "sociology": "Sociology",
        "psychology": "Psychology",
        "home science": "Home Science",
        "legal studies": "Legal Studies",
        "physical education": "Physical Education",
        "computer science": "Computer Science",
        "informatics practices": "Informatics Practices",
        "entrepreneurship": "Entrepreneurship",
        "teaching aptitude": "Teaching Aptitude",
        "mass media": "Mass Media",
        "agriculture": "Agriculture",
        "fine arts": "Fine Arts",
        "performing arts": "Performing Arts",
        "sanskrit": "Sanskrit",
        "hindi": "Hindi",
        "urdu": "Urdu"
    };

    const lower = trimmed.toLowerCase();
    if (overrides[lower]) {
        return overrides[lower];
    }

    // Default: Title Case (capitalize first letter of each word)
    return trimmed.replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}
