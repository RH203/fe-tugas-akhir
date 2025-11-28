import Link from "next/link";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { GoogleButton } from "@/components/ui/google-button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <Card className="border-none shadow-xl ">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Selamat Datang</CardTitle>
        <CardDescription>
          Masuk untuk mengakses dashboard deteksi
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Tombol Google Component */}
        <div className="space-y-2">
          <GoogleButton text="Masuk dengan Google" />
        </div>

      
      </CardContent>
      <CardFooter className="flex justify-center border-t p-6">
        <p className="text-sm text-muted-foreground">
          Belum punya akun?{" "}
          <Link href="/auth/register" className="font-medium text-primary hover:underline">
            Daftar disini
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}