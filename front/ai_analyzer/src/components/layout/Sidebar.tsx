import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Coins,
    Bot,
    Settings,
    LogOut,
    ShieldAlert
} from 'lucide-react';

export function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();

    const [collapsed, setCollapsed] = useState(false);

    const menuItems = [
        { id: '/overview', label: 'Overview', icon: LayoutDashboard },
        { id: '/exchange', label: 'Exchange', icon: Coins },
        { id: '/ai-trading', label: 'AI Trading Hub', icon: Bot, badge: 'LIVE' },
        { id: '/football-ai', label: 'Football AI Analyzer', icon: ShieldAlert, badge: 'AI' },
    ];

    return (
        <aside
            className={`relative bg-gray-950 border-r border-gray-800 flex flex-col justify-between h-[calc(100vh-64px)] transition-all duration-300 ${
                collapsed ? 'w-20' : 'w-64'
            }`}
        >
            {/* TOGGLE BUTTON (curved middle edge like trading UI) */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute top-1/2 -right-3 -translate-y-1/2 z-50
                           w-8 h-16 bg-gray-900 border border-gray-700
                           rounded-r-xl flex items-center justify-center
                           text-white hover:bg-gray-800 transition-all"
            >
                {collapsed ? '›' : '‹'}
            </button>

            {/* TOP MENU */}
            <div className="p-4 space-y-1">
                <p className={`text-[11px] font-bold text-gray-600 uppercase tracking-widest mb-3 px-3 ${
                    collapsed ? 'hidden' : 'block'
                }`}>
                    Core Systems
                </p>

                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => navigate(item.id)}
                            className={`w-full flex items-center transition-all duration-200 group ${
                                collapsed ? 'justify-center px-2 py-3' : 'justify-between px-4 py-3'
                            } rounded-xl ${
                                isActive
                                    ? 'bg-gradient-to-r from-emerald-950 to-gray-900 border border-emerald-500/30 text-green-400'
                                    : 'text-gray-400 hover:bg-gray-900/45 hover:text-white'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <Icon
                                    className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                                        isActive
                                            ? 'text-green-400'
                                            : 'text-gray-500 group-hover:text-gray-300'
                                    }`}
                                />

                                {!collapsed && (
                                    <span className="text-sm">
                                        {item.label}
                                    </span>
                                )}
                            </div>

                            {!collapsed && item.badge && (
                                <span className="text-[9px] font-black bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded-md animate-pulse">
                                    {item.badge}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* BOTTOM */}
            <div className="p-4 border-t border-gray-900 space-y-2">
                <button className={`w-full flex items-center gap-3 px-4 py-2.5 text-gray-500 hover:text-white text-sm transition-colors rounded-lg ${
                    collapsed ? 'justify-center' : ''
                }`}>
                    <Settings className="h-4 w-4" />
                    {!collapsed && <span>System Settings</span>}
                </button>

                <button className={`w-full flex items-center gap-3 px-4 py-2.5 text-red-400/70 hover:text-red-400 text-sm transition-colors rounded-lg ${
                    collapsed ? 'justify-center' : ''
                }`}>
                    <LogOut className="h-4 w-4" />
                    {!collapsed && <span>Terminate Session</span>}
                </button>
            </div>
        </aside>
    );
}