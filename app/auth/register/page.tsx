import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { GoogleButton } from "@/components/ui/google-button";

export default function RegisterPage() {
  return (
    <Card className="border-none shadow-xl">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Buat Akun Baru</CardTitle>
        <CardDescription>
          Mulai deteksi komentar spam dengan mudah
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <GoogleButton text="Daftar dengan Google" />

       
      </CardContent>
      <CardFooter className="flex justify-center border-t p-6">
        <p className="text-sm text-muted-foreground">
          Sudah punya akun?{" "}
          <Link href="/auth/login" className="font-medium text-primary hover:underline">
            Masuk disini
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}