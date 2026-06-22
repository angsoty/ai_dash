import {
    Search,
    Bell,
    UserCircle,
    ChevronDown
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

export function Header() {
    const headerRef = useRef<HTMLDivElement>(null);
    const [isCompact, setIsCompact] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const checkSize = () => {
            if (!headerRef.current) return;

            const width = headerRef.current.offsetWidth;
            setIsCompact(width < 650); // trigger dropdown mode
        };

        checkSize();
        window.addEventListener("resize", checkSize);

        return () => window.removeEventListener("resize", checkSize);
    }, []);

    const navItems = [
        { name: "Dashboard", path: "/dashboard" },
        { name: "Markets", path: "/exchange" },
        { name: "AI Trading", path: "/ai-trading" },
        { name: "Football AI", path: "/football-ai" },
        { name: "Portfolio", path: "/portfolio" },
    ];

    return (
        <header
            ref={headerRef}
            className="h-14 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between px-3 lg:px-6 relative"
        >

            {/* LEFT */}
            <div className="flex items-center gap-4 min-w-0">

                <Link to="/dashboard" className="flex items-center gap-2 shrink-0">
                    <div className="w-8 h-8 rounded-md bg-green-500 flex items-center justify-center font-bold text-black">
                        T
                    </div>

                    <span className="font-bold text-white whitespace-nowrap">
                        KHOM-TRADE<span className="font-bold text-blue-500 whitespace-nowrap">
                        -MEH
                    </span>
                    </span>
                </Link>

                {/* NAV DESKTOP */}
                {!isCompact && (
                    <nav className="flex items-center gap-4 text-sm">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className="text-zinc-400 hover:text-white transition"
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                )}

                {/* NAV MOBILE → DASHBOARD DROPDOWN */}
                {isCompact && (
                    <div className="relative">
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="flex items-center gap-1 text-white text-sm bg-zinc-900 px-3 py-1 rounded-lg border border-zinc-800"
                        >
                            Dashboard
                            <ChevronDown size={14} />
                        </button>

                        {menuOpen && (
                            <div className="absolute top-10 left-0 bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg w-48 z-50">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setMenuOpen(false)}
                                        className="block px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}

            </div>

            {/* CENTER SEARCH */}
            <div className="flex items-center">

                <div className={`
                    flex items-center bg-zinc-900 border border-zinc-800 rounded-lg px-3 h-9
                    ${isCompact ? "w-[140px]" : "w-[165px]"}
                `}>
                    <Search size={14} className="text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-transparent outline-none px-2 text-sm text-white w-full"
                    />
                </div>

            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-3">

                <button className="w-9 h-9 flex items-center justify-center hover:bg-zinc-900 rounded-lg">
                    <Bell size={18} className="text-zinc-400" />
                </button>

                <button className="hidden sm:flex items-center bg-green-500 hover:bg-green-400 text-black font-semibold px-4 h-9 rounded-lg text-sm">
                    Connect Wallet
                </button>

                <button className="w-9 h-9 flex items-center justify-center hover:bg-zinc-900 rounded-lg">
                    <UserCircle size={26} className="text-zinc-400" />
                </button>

            </div>

        </header>
    );
}