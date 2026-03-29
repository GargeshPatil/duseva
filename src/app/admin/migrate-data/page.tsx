"use client";

import React, { useState } from 'react';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Button } from '@/components/ui/Button';

export default function MigrateDataPage() {
    const [status, setStatus] = useState<string>('Ready to migrate.');
    const [progress, setProgress] = useState<number>(0);
    const [isMigrating, setIsMigrating] = useState(false);

    const runMigration = async () => {
        if (!confirm("Are you sure? This will rewrite legacy questions and test structures.")) return;
        setIsMigrating(true);
        setStatus('Fetching passages...');

        try {
            // 1. Fetch all legacy passages
            const passagesSnap = await getDocs(collection(db, 'passages'));
            const passagesMap: Record<string, any> = {};
            passagesSnap.forEach(d => {
                passagesMap[d.id] = { id: d.id, ...d.data() };
            });
            setStatus(`Fetched ${Object.keys(passagesMap).length} passages. Fetching questions...`);

            // 2. Fetch all questions
            const questionsSnap = await getDocs(collection(db, 'questions'));
            const legacySubQs: any[] = [];
            const allQuestions: Record<string, any> = {};

            questionsSnap.forEach(d => {
                const data = d.data();
                allQuestions[d.id] = { id: d.id, ...data };
                
                // Identify legacy passage subquestions:
                // They have passageId defined, but are NOT new PassageQuestion blocks themselves
                // (New PassageQuestion blocks have type='passage' and inline subQuestions array)
                if (data.passageId && (!data.subQuestions || data.subQuestions.length === 0)) {
                    legacySubQs.push({ id: d.id, ...data });
                }
            });

            setStatus(`Found ${legacySubQs.length} legacy subquestions. Grouping by passage...`);

            // 3. Group by passageId
            const groupedByPassage: Record<string, any[]> = {};
            legacySubQs.forEach(q => {
                if (!groupedByPassage[q.passageId]) {
                    groupedByPassage[q.passageId] = [];
                }
                groupedByPassage[q.passageId].push(q);
            });

            const uniquePassagesCount = Object.keys(groupedByPassage).length;
            setStatus(`Grouped into ${uniquePassagesCount} distinct passages. Creating unified documents...`);

            // 4. Create New PassageQuestions and map old QID -> new PQID
            const legacyIdToNewPassageId: Record<string, string> = {};
            const newPassageDocs: any[] = [];

            for (const pId of Object.keys(groupedByPassage)) {
                const subQs = groupedByPassage[pId];
                const newDocRef = doc(collection(db, 'questions'));
                const newId = newDocRef.id;

                const passageText = passagesMap[pId]?.text || "Missing passage text";
                
                // Construct new unified PassageQuestion
                const newPQ = {
                    type: "passage",
                    questionType: "passage",
                    passageText: passageText,
                    subject: subQs[0].subject || "General",
                    difficulty: subQs[0].difficulty || "Medium",
                    marks: subQs[0].marks || 5,
                    negativeMarks: subQs[0].negativeMarks || 1,
                    stream: subQs[0].stream || "",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    subQuestions: subQs.map(sq => {
                        const sqCopy = { ...sq, isSubQuestion: true };
                        delete sqCopy.passageId;
                        delete sqCopy.id; 
                        return sqCopy;
                    })
                };

                newPassageDocs.push({ ref: newDocRef, data: newPQ });

                // Map all old sub QIDs to this single new PQID
                subQs.forEach(sq => {
                    legacyIdToNewPassageId[sq.id] = newId;
                });
            }

            // Commit new questions in batches
            setStatus(`Writing ${newPassageDocs.length} unified passage questions...`);
            let batch = writeBatch(db);
            let opCount = 0;
            for (const pDoc of newPassageDocs) {
                batch.set(pDoc.ref, pDoc.data);
                opCount++;
                if (opCount >= 400) {
                    await batch.commit();
                    batch = writeBatch(db);
                    opCount = 0;
                }
            }
            if (opCount > 0) await batch.commit();

            setStatus(`Updating Test documents...`);

            // 5. Update Tests
            const testsSnap = await getDocs(collection(db, 'tests'));
            batch = writeBatch(db);
            opCount = 0;
            let testsUpdated = 0;

            for (const tDoc of testsSnap.docs) {
                const tData = tDoc.data();
                if (!tData.questionIds) continue;

                let modified = false;
                const newQuestionIds: string[] = [];
                const seenNewIds = new Set<string>();

                for (const oldQid of tData.questionIds) {
                    if (legacyIdToNewPassageId[oldQid]) {
                        // This old QID belongs to a newly unified PassageQuestion
                        const newPQId = legacyIdToNewPassageId[oldQid];
                        if (!seenNewIds.has(newPQId)) {
                            newQuestionIds.push(newPQId);
                            seenNewIds.add(newPQId);
                            modified = true;
                        } else {
                            // We already added the parent passage, so skip duplicates
                            modified = true;
                        }
                    } else {
                        // Regular question or already new passage
                        newQuestionIds.push(oldQid);
                    }
                }

                if (modified) {
                    batch.update(tDoc.ref, { questionIds: newQuestionIds });
                    opCount++;
                    testsUpdated++;

                    if (opCount >= 400) {
                        await batch.commit();
                        batch = writeBatch(db);
                        opCount = 0;
                    }
                }
            }

            if (opCount > 0) {
                await batch.commit();
            }

            setStatus(`Migration complete! Tests updated: ${testsUpdated}. Now cleaning up legacy subquestions...`);

            // 6. Delete legacy subquestions from Question Bank
            batch = writeBatch(db);
            opCount = 0;
            let deletedCount = 0;
            for (const lsq of legacySubQs) {
                batch.delete(doc(db, 'questions', lsq.id));
                opCount++;
                deletedCount++;
                if (opCount >= 400) {
                    await batch.commit();
                    batch = writeBatch(db);
                    opCount = 0;
                }
            }
            if (opCount > 0) await batch.commit();

            setStatus(`Migration fully finished! Migrated ${uniquePassagesCount} passages, updated ${testsUpdated} tests, and purged ${deletedCount} legacy question documents.`);

        } catch (e: any) {
            console.error(e);
            setStatus(`Error: ${e.message}`);
        }
        setIsMigrating(false);
    };

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Data Migration Tool</h1>
            <p className="text-gray-600">
                This tool upgrades legacy passage subquestions arrayed across Test documents into the unified PassageQuestion schema.
                It will:
            </p>
            <ul className="list-disc pl-6 text-sm text-gray-700 space-y-1">
                <li>Find all questions with a <code>passageId</code>.</li>
                <li>Group them back into unified <code>PassageQuestion</code> documents with their source passage text.</li>
                <li>Write the new global questions to the Question Bank.</li>
                <li>Scan all Test documents, replace legacy flat question arrays with the single new PassageQuestion ID, avoiding layout duplication.</li>
                <li>Delete the old flat passage questions.</li>
            </ul>

            <div className="bg-gray-100 p-4 rounded border text-sm font-mono">
                Status: {status}
            </div>

            <Button onClick={runMigration} disabled={isMigrating} className="bg-blue-600 hover:bg-blue-700 text-white">
                {isMigrating ? "Migrating..." : "Run Migration"}
            </Button>
        </div>
    );
}
