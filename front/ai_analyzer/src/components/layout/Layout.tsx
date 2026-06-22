import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Outlet } from 'react-router-dom';

export function Layout() {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="flex bg-zinc-950 text-white">

            <Sidebar />

            {/* MAIN CONTENT */}
            <div className="flex flex-col flex-1 transition-all duration-300">

                <Header />

                <main
                    className={`transition-all duration-300 ${
                        collapsed ? 'ml-0' : 'ml-64'
                    }`}
                >
                    <Outlet />
                </main>

            </div>
        </div>
    );
}