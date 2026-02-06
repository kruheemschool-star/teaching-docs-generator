import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, orderBy, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { CourseDocument, DocumentMetadata, Folder } from '@/types';

// ... types

export function useDocuments() {
    const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const q = query(collection(db, "documents"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const docs: DocumentMetadata[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data() as CourseDocument;
                if (data.documentMetadata) {
                    docs.push(data.documentMetadata);
                }
            });
            docs.sort((a, b) => {
                // Primary sort: Order (ascending)
                const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
                const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
                if (orderA !== orderB) return orderA - orderB;

                // Secondary sort: UpdatedAt (descending)
                return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
            });

            setDocuments(docs);
            setLoading(false);
            setError(null);
        }, (err) => {
            console.error("Firestore Error (Documents):", err);
            setError(err.message);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { documents, loading, error };
}

export function useFolders() {
    const [folders, setFolders] = useState<Folder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const q = query(collection(db, "folders"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const foldersData: Folder[] = [];
            snapshot.forEach((doc) => {
                foldersData.push(doc.data() as Folder);
            });
            foldersData.sort((a, b) => {
                // Primary sort: Order (ascending)
                const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
                const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
                if (orderA !== orderB) return orderA - orderB;

                // Secondary sort: CreatedAt (descending)
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });

            setFolders(foldersData);
            setLoading(false);
            setError(null);
        }, (err) => {
            console.error("Firestore Error (Folders):", err);
            setError(err.message);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { folders, loading, error };
}
