import { firestoreService } from "@/services/firestoreService";
import { CMSContent } from "@/types/admin";
import { SYLLABUS_DATA } from "@/data/syllabus";

export async function handlePrefillCUET2026Util(
    content: CMSContent[],
    setContent: (c: CMSContent[]) => void,
    setSaving: (saving: boolean) => void
) {
    setSaving(true);
    try {
        const flatSyllabus: any[] = [];
        SYLLABUS_DATA.forEach(category => {
            let domain = "General Test";
            if (category.category.includes("Science")) domain = "Science";
            else if (category.category.includes("Commerce")) domain = "Commerce";
            else if (category.category.includes("Humanities")) domain = "Humanities";
            else if (category.category.includes("Vocational") || category.category.includes("Other")) domain = "Vocational";
            else if (category.category.includes("Language")) domain = "Language";

            category.subjects.forEach(subject => {
                flatSyllabus.push({
                    id: Math.random().toString(36).substring(2, 9),
                    subject: subject.name,
                    domain: domain,
                    topics: subject.topics.map(t => ({
                        title: t.title,
                        subtopics: t.subtopics || []
                    })),
                    difficulty: 'medium'
                });
            });
        });

        const defaultKeys = [
            { key: 'syllabus_content', value: JSON.stringify(flatSyllabus) },
            { key: 'exam_strategy_content', value: JSON.stringify([{ id: '1', title: 'Understand the Syllabus', description: 'Start by thoroughly reviewing the official CUET syllabus for your chosen domains.', icon: 'BookOpen' }]) },
            { key: 'important_dates_content', value: JSON.stringify([{ id: '1', date: 'Feb 2026', title: 'Application Form Release', description: 'Online submission of application forms begins.', type: 'registration' }]) },
            { key: 'college_preferences_content', value: JSON.stringify([{ id: '1', tier: 'Tier 1', description: 'Top North Campus Colleges', colleges: ['SRCC', 'Hindu', 'Stephen\'s'] }]) }
        ];

        let added = 0;
        for (const def of defaultKeys) {
            const exists = content.find(c => c.section === 'cuet2026' && c.key === def.key);
            if (!exists) {
                await firestoreService.createCMSContent({
                    section: 'cuet2026',
                    key: def.key,
                    value: def.value,
                    editableBy: 'admin'
                });
                added++;
            }
        }

        if (added > 0) {
            alert(`Successfully prefilled ${added} sections. Reloading...`);
            const data = await firestoreService.getCMSContent();
            setContent(data);
        } else {
            alert("All sections are already present.");
        }
    } catch (error) {
        console.error("Prefill Error:", error);
        alert("Failed to prefill CUET 2026 data.");
    } finally {
        setSaving(false);
    }
}

export async function handlePrefillLandingUtil(
    content: CMSContent[],
    setContent: (c: CMSContent[]) => void,
    setSaving: (saving: boolean) => void
) {
    setSaving(true);
    try {
        const defaultKeys = [
            { key: 'student_stories', value: JSON.stringify([{ id: '1', url: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=400&h=400&fit=crop', altText: 'Student Success', name: 'Aaditya', college: 'SRCC' }]) }
        ];

        let added = 0;
        for (const def of defaultKeys) {
            const exists = content.find(c => c.section === 'landing' && c.key === def.key);
            if (!exists) {
                await firestoreService.createCMSContent({
                    section: 'landing',
                    key: def.key,
                    value: def.value,
                    editableBy: 'admin'
                });
                added++;
            }
        }

        if (added > 0) {
            alert(`Successfully prefilled ${added} sections. Reloading...`);
            const data = await firestoreService.getCMSContent();
            setContent(data);
        } else {
            alert("All sections are already present.");
        }
    } catch (error) {
        console.error("Prefill Error:", error);
        alert("Failed to prefill Landing Page data.");
    } finally {
        setSaving(false);
    }
}
