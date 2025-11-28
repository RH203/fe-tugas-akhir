import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted/40 flex flex-col items-center justify-center p-4">
      {/* Tombol Balik ke Home */}
      <div className="absolute top-4 left-4 md:top-8 md:left-8">
        <Link href="/">
          <Button variant="ghost" className="gap-2">
            ← Kembali ke Beranda
          </Button>
        </Link>
      </div>

      {/* Logo di atas form */}
      <div className="mb-8 flex flex-col items-center space-y-2 text-center">
        <div className="flex items-center gap-2 font-bold text-2xl">
          <ShieldCheck className="h-8 w-8 text-primary" />
          <span>AntiJudi<span className="text-primary">Detector</span></span>
        </div>
        <p className="text-sm text-muted-foreground">
          Sistem Deteksi Komentar Spam & Judi Online
        </p>
      </div>

      {/* Konten Halaman (Login/Register Form) */}
      {children}
    </div>
  );
}