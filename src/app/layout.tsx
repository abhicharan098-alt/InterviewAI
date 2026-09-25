import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/layout/AuthProvider";
import { GlobalIntro } from "@/components/layout/GlobalIntro";

export const metadata: Metadata = {
  title: "InterviewAI | AI-Powered Interview Preparation Platform",
  description: "Prepare for your technical and behavioral interviews with InterviewAI. Get real-time feedback and ace your dream job.",
  keywords: ["Interview Prep", "AI Interview", "Coding Interview", "Tech Interview", "InterviewAI"],
  openGraph: {
    title: "InterviewAI | Ace Your Next Interview",
    description: "The complete AI-powered interview preparation platform.",
    url: "https://interviewai.example.com",
    siteName: "InterviewAI",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full antialiased font-sans" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col bg-[#050814] text-[#F8FAFC]" suppressHydrationWarning>
        <AuthProvider>
          <GlobalIntro>
            {children}
          </GlobalIntro>
        </AuthProvider>
      </body>
    </html>
  );
}
