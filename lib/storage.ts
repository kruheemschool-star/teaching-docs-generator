import { CourseDocument, DocumentMetadata, Folder } from '../types';

const INDEX_KEY = 'teaching-docs-index';
const DOCUMENT_PREFIX = 'teaching-docs-content-';

// Helper to get all metadata
export const getAllDocuments = (): DocumentMetadata[] => {
    if (typeof window === 'undefined') return [];
    try {
        const indexJson = localStorage.getItem(INDEX_KEY);
        if (!indexJson) return [];
        return JSON.parse(indexJson);
    } catch (e) {
        console.error('Failed to load document index', e);
        return [];
    }
};

// Helper to save index
const saveIndex = (index: DocumentMetadata[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(INDEX_KEY, JSON.stringify(index));
};

// Get single document content
export const getDocument = (id: string): CourseDocument | null => {
    if (typeof window === 'undefined') return null;
    try {
        const contentJson = localStorage.getItem(`${DOCUMENT_PREFIX}${id}`);
        if (!contentJson) return null;
        return JSON.parse(contentJson);
    } catch (e) {
        console.error(`Failed to load document ${id}`, e);
        return null;
    }
};

// Save document content and update metadata
export const saveDocument = (doc: CourseDocument) => {
    if (typeof window === 'undefined') return;

    // 1. Save Content
    try {
        localStorage.setItem(`${DOCUMENT_PREFIX}${doc.documentMetadata.id}`, JSON.stringify(doc));
    } catch (e) {
        console.error('Failed to save document content', e);
        // Quota exceeded handling could go here
    }

    // 2. Update Index
    const index = getAllDocuments();
    const metadata = doc.documentMetadata;
    const existingIdx = index.findIndex(d => d.id === metadata.id);

    // Update timestamp
    const updatedMetadata = {
        ...metadata,
        updatedAt: new Date().toISOString()
    };

    if (existingIdx >= 0) {
        index[existingIdx] = updatedMetadata;
    } else {
        index.unshift(updatedMetadata); // Add to top
    }

    saveIndex(index);
};

// Create new empty document
export const createDocument = (
    title: string,
    classLevel: string = "ม.1",
    semester: string = "เทอม 1"
): CourseDocument => {
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
            instructor: "AI Teacher"
        },
        sections: []
    };

    saveDocument(newDoc);
    return newDoc;
};

// Delete document
export const deleteDocument = (id: string) => {
    if (typeof window === 'undefined') return;

    // 1. Remove Content
    localStorage.removeItem(`${DOCUMENT_PREFIX}${id}`);

    // 2. Remove from Index
    const index = getAllDocuments();
    const newIndex = index.filter(d => d.id !== id);
    saveIndex(newIndex);
};

// --- Folder Logic ---

const FOLDER_INDEX_KEY = 'teaching-docs-folders';

export const getAllFolders = (): Folder[] => {
    if (typeof window === 'undefined') return [];
    try {
        const foldersJson = localStorage.getItem(FOLDER_INDEX_KEY);
        if (!foldersJson) return [];
        return JSON.parse(foldersJson);
    } catch (e) {
        console.error('Failed to load folders', e);
        return [];
    }
};

const saveFolders = (folders: Folder[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(FOLDER_INDEX_KEY, JSON.stringify(folders));
}

export const createFolder = (name: string): Folder => {
    const folders = getAllFolders();
    const newFolder: Folder = {
        id: crypto.randomUUID(),
        name,
        createdAt: new Date().toISOString()
    };
    folders.unshift(newFolder);
    saveFolders(folders);
    return newFolder;
};

export const deleteFolder = (id: string) => {
    // 1. Delete folder
    const folders = getAllFolders();
    const newFolders = folders.filter(f => f.id !== id);
    saveFolders(newFolders);

    // 2. Move contained documents to root
    const documents = getAllDocuments();
    let docUpdated = false;
    const updatedDocs = documents.map(doc => {
        if (doc.folderId === id) {
            docUpdated = true;
            return { ...doc, folderId: null };
        }
        return doc;
    });

    if (docUpdated) {
        saveIndex(updatedDocs);
    }
};

export const moveDocumentToFolder = (docId: string, folderId: string | null) => {
    const doc = getDocument(docId);
    if (doc) {
        doc.documentMetadata.folderId = folderId;
        saveDocument(doc);
    }
};

export const updateDocumentTitle = (id: string, newTitle: string) => {
    const doc = getDocument(id);
    if (doc) {
        doc.documentMetadata.title = newTitle;
        saveDocument(doc);
    }
};

export const duplicateDocument = (id: string): CourseDocument | null => {
    const original = getDocument(id);
    if (!original) return null;

    const newId = crypto.randomUUID();
    const now = new Date().toISOString();
    const newDoc: CourseDocument = {
        ...original,
        documentMetadata: {
            ...original.documentMetadata,
            id: newId,
            title: `${original.documentMetadata.title} (สำเนา)`,
            updatedAt: now
        }
    };
    saveDocument(newDoc);
    return newDoc;
};
