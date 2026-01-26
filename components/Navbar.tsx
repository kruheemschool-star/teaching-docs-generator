"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Sparkles, Tent } from 'lucide-react';
import { ModeToggle } from './ModeToggle';

export const Navbar = () => {
    const router = useRouter();
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

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
                    </div>
                </div>
            </div>
        </nav>
    );
};
