import { db } from './firebase';
import {
    collection,
    doc,
    setDoc,
    deleteDoc,
    getDocs,
    getDoc,
    writeBatch,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { CourseDocument, Folder } from '@/types';
import { createBackup } from './backup';

const COLLECTION_DOCS = 'documents';
const COLLECTION_FOLDERS = 'folders';

// --- Migration Logic ---

export const migrateToFirestore = async () => {
    try {
        const backup = createBackup();
        const batch = writeBatch(db);
        let count = 0;

        // 1. Migrate Folders
        for (const folder of backup.folders) {
            const ref = doc(db, COLLECTION_FOLDERS, folder.id);
            batch.set(ref, {
                ...folder,
                migratedAt: serverTimestamp()
            });
            count++;
        }

        // 2. Migrate Documents
        for (const d of backup.documents) {
            const ref = doc(db, COLLECTION_DOCS, d.documentMetadata.id);
            batch.set(ref, {
                ...d,
                migratedAt: serverTimestamp()
            });
            count++;
        }

        await batch.commit();
        return { success: true, count };
    } catch (error) {
        console.error("Migration failed:", error);
        return { success: false, error };
    }
};

export const getDocumentFromFirestore = async (id: string): Promise<CourseDocument | null> => {
    try {
        const docRef = doc(db, COLLECTION_DOCS, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data() as CourseDocument;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching document:", error);
        return null;
    }
};

// --- CRUD Operations ---

export const createDocumentInFirestore = async (
    title: string,
    classLevel: string = "ม.1",
    semester: string = "เทอม 1",
    topic: string = "อื่นๆ" // Default topic
): Promise<CourseDocument | null> => {
    try {
        const id = crypto.randomUUID();
        const now = new Date().toISOString();

        const newDoc: CourseDocument = {
            documentMetadata: {
                id,
                title,
                classLevel,
                semester,
                updatedAt: now,
                date: new Date().getFullYear().toString(),
                instructor: "AI Teacher",
                topic: topic
            },
            sections: []
        };

        // Save to Firestore
        await setDoc(doc(db, COLLECTION_DOCS, id), {
            ...newDoc,
            createdAt: serverTimestamp(),
            lastModified: serverTimestamp()
        });

        return newDoc;
    } catch (error) {
        console.error("Error creating document:", error);
        return null;
    }
};

export const saveDocumentToFirestore = async (docData: CourseDocument) => {
    try {
        const ref = doc(db, COLLECTION_DOCS, docData.documentMetadata.id);
        const payload = {
            ...docData,
            documentMetadata: {
                ...docData.documentMetadata,
                updatedAt: new Date().toISOString()
            },
            lastModified: serverTimestamp()
        };
        await setDoc(ref, payload, { merge: true });
        return true;
    } catch (error) {
        console.error("Error saving document:", error);
        return false;
    }
};

export const deleteDocumentFromFirestore = async (id: string) => {
    try {
        await deleteDoc(doc(db, COLLECTION_DOCS, id));
        return true;
    } catch (error) {
        console.error("Error deleting document:", error);
        return false;
    }
};

export const createFolderInFirestore = async (name: string) => {
    try {
        const id = crypto.randomUUID();
        const newFolder: Folder = {
            id,
            name,
            createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, COLLECTION_FOLDERS, id), newFolder);
        return newFolder;
    } catch (error) {
        console.error("Error creating folder:", error);
        return null;
    }
};

export const deleteFolderFromFirestore = async (id: string) => {
    try {
        await deleteDoc(doc(db, COLLECTION_FOLDERS, id));
        return true;
    } catch (error) {
        console.error("Error deleting folder:", error);
        return false;
    }
};

export const moveDocumentInFirestore = async (docId: string, folderId: string | null) => {
    try {
        const ref = doc(db, COLLECTION_DOCS, docId);
        await setDoc(ref, {
            documentMetadata: {
                folderId: folderId
            }
        }, { merge: true });
        return true;
    } catch (error) {
        console.error("Error moving document:", error);
        return false;
    }
};

export const updateDocumentTitleInFirestore = async (docId: string, newTitle: string) => {
    try {
        const ref = doc(db, COLLECTION_DOCS, docId);
        await setDoc(ref, {
            documentMetadata: {
                title: newTitle,
                updatedAt: new Date().toISOString()
            },
            lastModified: serverTimestamp()
        }, { merge: true });
        return true;
    } catch (error) {
        console.error("Error updating document title:", error);
        return false;
    }
};

export const duplicateDocumentInFirestore = async (docId: string): Promise<CourseDocument | null> => {
    try {
        // 1. Fetch the original document
        const originalRef = doc(db, COLLECTION_DOCS, docId);
        const originalSnap = await getDoc(originalRef);

        if (!originalSnap.exists()) {
            console.error("Original document not found:", docId);
            return null;
        }

        const originalData = originalSnap.data() as CourseDocument;

        // 2. Create a new document with a new ID
        const newId = crypto.randomUUID();
        const now = new Date().toISOString();

        const duplicatedDoc: CourseDocument = {
            ...originalData,
            documentMetadata: {
                ...originalData.documentMetadata,
                id: newId,
                title: `${originalData.documentMetadata.title} (สำเนา)`,
                updatedAt: now
            }
        };

        // 3. Save to Firestore
        await setDoc(doc(db, COLLECTION_DOCS, newId), {
            ...duplicatedDoc,
            createdAt: serverTimestamp(),
            lastModified: serverTimestamp()
        });

        return duplicatedDoc;
    } catch (error) {
        console.error("Error duplicating document:", error);
        return null;
    }
};
