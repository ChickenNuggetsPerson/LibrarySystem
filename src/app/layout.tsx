import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import { Toaster } from "react-hot-toast";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
    title: "Library System",
    description: "",
    icons: {
        icon: '/favicon.png', // /public path
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    return (
        <html lang="en" style={{ scrollbarWidth: "none" }} className={cn("font-sans", geist.variable)}>
            <body className="text-foreground bg-background">
                <Toaster
                    toastOptions={{
                        className: 'card',
                        style: {
                            background: "var(--color-card)",
                            color: "var(--color-text)"
                        },
                    }}
                />
                <Header />

                <div>
                    {children}
                </div>
            </body>
        </html>
    );
}
