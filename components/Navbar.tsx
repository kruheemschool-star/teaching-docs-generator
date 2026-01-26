"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Plus, Sparkles, LayoutDashboard, FolderPlus, Tent } from 'lucide-react';
import { ModeToggle } from './ModeToggle';

export const Navbar = () => {
    const router = useRouter();
    const pathname = usePathname();

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const isActive = (path: string) => pathname === path;

    const handleCreateNew = () => {
        const newId = crypto.randomUUID();
        router.push(`/editor/${newId}`);
        setIsMenuOpen(false);
    };

    return (
        <nav className="bg-white dark:bg-zinc-950 border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-50 shadow-sm print:hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Left: Branding & Nav Links */}
                    <div className="flex items-center gap-8">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="w-8 h-8 bg-black dark:bg-white text-white dark:text-black rounded-lg flex items-center justify-center font-bold text-lg group-hover:bg-gray-800 dark:group-hover:bg-gray-200 transition">T</div>
                            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Teaching Docs</span>
                        </Link>

                        {/* Desktop Nav Items */}
                        <div className="hidden md:flex items-center gap-2">
                            <Link
                                href="/"
                                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition ${isActive('/')
                                    ? 'bg-gray-100 dark:bg-zinc-800 text-black dark:text-white'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-800'
                                    }`}
                            >
                                <Tent className="w-4 h-4" />
                                Base Camp
                            </Link>
                            <Link
                                href="/prompt-builder"
                                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition ${isActive('/prompt-builder')
                                    ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                                    }`}
                            >
                                <Sparkles className="w-4 h-4" />
                                AI Prompt Builder
                            </Link>
                        </div>
                    </div>

                    {/* Right: Global Actions */}
                    <div className="flex items-center gap-3">
                        <ModeToggle />
                        <div className="h-4 w-px bg-gray-200 dark:bg-zinc-700 mx-1"></div>

                        <div className="relative">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                onBlur={() => setTimeout(() => setIsMenuOpen(false), 200)}
                                className="bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black text-sm px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition shadow-sm"
                            >
                                <Plus className="w-4 h-4" />
                                <span className="hidden sm:inline">สร้างใหม่</span>
                            </button>

                            {/* Dropdown Menu */}
                            {isMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-gray-200 dark:border-zinc-800 py-1 z-50 animate-in fade-in zoom-in duration-200 origin-top-right">
                                    <button
                                        onClick={handleCreateNew}
                                        className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-2"
                                    >
                                        <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center">
                                            <LayoutDashboard className="w-3.5 h-3.5" />
                                        </div>
                                        <span>สร้างเอกสาร</span>
                                    </button>

                                    <Link href="/" className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-2">
                                        <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg flex items-center justify-center">
                                            <FolderPlus className="w-3.5 h-3.5" />
                                        </div>
                                        <span>สร้างโฟลเดอร์</span>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};
