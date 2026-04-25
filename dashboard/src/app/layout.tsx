import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Estación Meteorológica - Dashboard Futurista",
  description: "Monitoreo de estación meteorológica en tiempo real",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full" suppressHydrationWarning>
      <body dir="ltr" className="antialiased flex min-h-screen bg-[#020617] text-slate-200">
        <Sidebar />
        <main className="flex-1 ml-64 p-8 relative">
          {/* Background Decorative Element */}
          <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-cyan-900/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
          <div className="fixed bottom-0 left-64 w-[300px] h-[300px] bg-purple-900/10 rounded-full blur-[100px] -z-10 pointer-events-none" />
          
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
