import { AppRouter } from './app/router';

export default function App() {
  return (
    <div className="bg-[#0B0E11] text-white min-h-screen font-sans">
      {/* 🔹 ហៅ AppRouter ដើម្បីគ្រប់គ្រង Layout, Sidebar និងការផ្លាស់ប្តូរទំព័រ Dashboard/Crypto/AI */}
      <AppRouter />
    </div>
  );
}