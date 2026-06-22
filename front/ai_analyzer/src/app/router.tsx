import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ExchangeLayout } from '../components/layout/ExchangeLayout';

import { AITrading } from '../components/layout/menuSidebar/AITrading';
import { FootballAI } from '../components/layout/menuSidebar/FootballAI';
import { Exchange } from '../components/layout/menuSidebar/Exchange';
import { Portfolio } from '../components/layout/menuSidebar/Portfolio';
import { Overview } from '../components/layout/menuSidebar/Overview';
import { Dashboard } from '../pages/Dashboard';

export function AppRouter() {
    return (
        <BrowserRouter>
            <ExchangeLayout>
                <Routes>
                    {/* 🔹 បើចូលមកទំព័រដើមទទេ ឱ្យវាទាត់ទៅ /overview ស្វ័យប្រវត្ត */}
                    <Route path="/" element={<Navigate to="/overview" replace />} />
                    
                    {/* 🔹 កំណត់ផ្លូវ URL នីមួយៗឱ្យច្បាស់លាស់ */}
                    <Route path="/overview" element={<Overview />} />
                    <Route path="/exchange" element={<Exchange />} />
                    <Route path="/ai-trading" element={<AITrading />} />
                    <Route path="/football-ai" element={<FootballAI />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/portfolio" element={<Portfolio />} />
                    
                    {/* 🔹 បើវាយ URL ខុស ឱ្យបង្វែរមក /overview វិញ */}
                    <Route path="*" element={<Navigate to="/overview" replace />} />
                </Routes>
            </ExchangeLayout>
        </BrowserRouter>
    );
}