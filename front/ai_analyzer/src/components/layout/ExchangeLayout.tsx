import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface ExchangeLayoutProps {
    children: React.ReactNode;
    currentPage: string;
    setCurrentPage: (page: string) => void;
}

export function ExchangeLayout({
    children,
    currentPage,
    setCurrentPage
}: ExchangeLayoutProps) {
    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col font-sans overflow-hidden">

            {/* TOP HEADER */}
            <Header />

            {/* MAIN AREA */}
            <div className="flex flex-1 overflow-hidden">

                {/* SIDEBAR */}
                <Sidebar
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                />

                {/* CONTENT AREA */}
                <main className="flex-1 relative bg-gray-900/40 overflow-y-auto h-[calc(100vh-64px)]">

                    {/* subtle grid background (trading feel) */}
                    <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:18px_18px] opacity-10 pointer-events-none" />

                    {/* content wrapper */}
                    <div className="relative p-6">
                        {children}
                    </div>

                </main>
            </div>
        </div>
    );
}