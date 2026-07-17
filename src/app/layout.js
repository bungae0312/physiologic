import "./globals.css";

export const metadata = {
  title: "FitCRM · 트레이너 회원 관리",
  description: "트레이너를 위한 프리미엄 회원 관리(CRM) 대시보드",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#6366f1",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* Apply saved theme before paint to avoid flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('fitcrm.theme');var m=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(m)document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body className="font-sans bg-slate-50 text-slate-900 dark:bg-[#0b0c10] dark:text-slate-100 transition-colors">
        {children}
      </body>
    </html>
  );
}
