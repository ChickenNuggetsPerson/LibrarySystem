



export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    return (
        <div className="flex justify-center pt-10">
            {children}
        </div>
    );
}
