"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, QueryDocumentSnapshot, DocumentData } from "firebase/firestore";

export default function FirestoreDemo() {
    const [items, setItems] = useState<DocumentData[]>([]);
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");

    // Example 1: READ Data (ดึงข้อมูล)
    const fetchData = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, "test-collection"));
            const data = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setItems(data);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Example 2: WRITE Data (เพิ่มข้อมูล)
    const addData = async () => {
        setLoading(true);
        try {
            const docRef = await addDoc(collection(db, "test-collection"), {
                name: "Example Item",
                timestamp: new Date(),
                randomValue: Math.floor(Math.random() * 100),
            });
            setSuccessMsg(`Added document with ID: ${docRef.id}`);
            fetchData(); // Refresh list
        } catch (error) {
            console.error("Error adding document:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="p-6 border rounded-lg bg-white/5 shadow-sm space-y-4">
            <h2 className="text-xl font-bold">🔥 Firestore Demo</h2>

            <div className="flex gap-2">
                <button
                    onClick={addData}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? "Working..." : "Add Test Data"}
                </button>

                <button
                    onClick={fetchData}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                    Refresh List
                </button>
            </div>

            {successMsg && (
                <p className="text-green-500 text-sm">{successMsg}</p>
            )}

            <div className="space-y-2">
                <h3 className="font-semibold text-lg">Current Data:</h3>
                {items.length === 0 ? (
                    <p className="text-gray-500 italic">No data found in 'test-collection'</p>
                ) : (
                    <ul className="list-disc pl-5 space-y-1">
                        {items.map((item: any) => (
                            <li key={item.id} className="text-sm">
                                <span className="font-mono text-xs bg-gray-200 dark:bg-gray-800 px-1 rounded mr-2">
                                    {item.id}
                                </span>
                                Name: {item.name} (Value: {item.randomValue})
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
