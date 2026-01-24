import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, orderBy, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { CourseDocument, DocumentMetadata, Folder } from '@/types';

export function useDocuments() {
    const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "documents"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const docs: DocumentMetadata[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data() as CourseDocument;
                // Ensure we extract metadata correctly
                if (data.documentMetadata) {
                    docs.push(data.documentMetadata);
                }
            });
            // Sort client-side for flexibility or rely on Firestore orderBy
            docs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

            setDocuments(docs);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { documents, loading };
}

export function useFolders() {
    const [folders, setFolders] = useState<Folder[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "folders"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const foldersData: Folder[] = [];
            snapshot.forEach((doc) => {
                foldersData.push(doc.data() as Folder);
            });
            // Sort newest first
            foldersData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            setFolders(foldersData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { folders, loading };
}
