import { CourseDocument, Folder } from '../types';
import { getAllFolders, getAllDocuments, getDocument, saveDocument, createFolder } from './storage';

export interface BackupData {
    version: number;
    timestamp: string;
    folders: Folder[];
    documents: CourseDocument[];
}

export const createBackup = (): BackupData => {
    // 1. Get all folders
    const folders = getAllFolders();

    // 2. Get all documents (Need to fetch full content for each)
    const docMetas = getAllDocuments();
    const documents: CourseDocument[] = [];

    docMetas.forEach(meta => {
        const doc = getDocument(meta.id);
        if (doc) {
            documents.push(doc);
        }
    });

    return {
        version: 1,
        timestamp: new Date().toISOString(),
        folders,
        documents
    };
};

export const restoreBackup = (data: BackupData): { success: boolean; message: string; count: number } => {
    try {
        if (!data || !Array.isArray(data.documents)) {
            throw new Error('Invalid backup file format');
        }

        let count = 0;

        // 1. Restore Folders
        // We need to check for duplicates or just merge?
        // Simple strategy: Add if not exists (by ID)
        if (Array.isArray(data.folders)) {
            const currentFolders = getAllFolders();
            const currentIds = new Set(currentFolders.map(f => f.id));

            // We can't use createFolder directly because we want to preserve IDs
            // So we'll have to manually merge and save
            // But for now, let's just use a simpler approach:
            // Since we don't have a saveFolders exposed, we might need to expose it or
            // just rely on createFolder not being able to force an ID.
            // Wait, createFolder generates a NEW ID.
            // If we want to restore exact structure, we need to save the folders exactly as is.

            // To properly restore folders with their IDs, we need to bypass createFolder
            // We can reuse the localStorage logic here carefully
            const FOLDER_KEY = 'teaching-docs-folders';
            const mergedFolders = [...currentFolders];

            data.folders.forEach(f => {
                if (!currentIds.has(f.id)) {
                    mergedFolders.push(f);
                }
            });

            localStorage.setItem(FOLDER_KEY, JSON.stringify(mergedFolders));
        }

        // 2. Restore Documents
        data.documents.forEach(doc => {
            // Check validity
            if (doc.documentMetadata && doc.documentMetadata.id) {
                saveDocument(doc);
                count++;
            }
        });

        return { success: true, message: `Restored ${count} documents successfully`, count };

    } catch (e: any) {
        console.error('Restore failed', e);
        return { success: false, message: e.message || 'Unknown error during restore', count: 0 };
    }
};
