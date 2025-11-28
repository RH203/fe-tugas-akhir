"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Loader2,
  ShieldAlert,
  ShieldCheck,
  Eraser,
  Search,
} from "lucide-react";




export default function DetectorPage() {
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    isGambling: boolean;
    confidence: string;
  } | null>(null);

  // TODO Func untuk check model
  const handleAnalyze = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    setResult(null);

    setTimeout(() => {
      const lowerText = inputText.toLowerCase();
      const isGambling = /slot|gacor|depo|maxwin/.test(lowerText);

      setResult({
        isGambling: isGambling,
        confidence: isGambling ? "98.5%" : "99.1%",
      });

      setIsLoading(false);
    }, 1500);
  };

  const handleClear = () => {
    setInputText("");
    setResult(null);
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">AI Detector</h1>
          <p className="text-muted-foreground">
            Paste komentar atau teks di bawah untuk mendeteksi indikasi promosi
            judi online.
          </p>
        </div>

        {/* Input Card */}
        <Card className="shadow-lg border-muted">
          <CardHeader>
            <CardTitle>Input Teks</CardTitle>
            <CardDescription>
              Masukkan minimal 1 kalimat untuk hasil yang akurat.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Contoh: Ayo gabung sekarang, dijamin gacor parah..."
              className="min-h-[150px] text-base resize-none focus-visible:ring-primary"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </CardContent>
          <CardFooter className="flex justify-between items-center bg-muted/20 py-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={!inputText || isLoading}
            >
              <Eraser className="w-4 h-4 mr-2" />
              Bersihkan
            </Button>
            <Button
              onClick={handleAnalyze}
              disabled={!inputText || isLoading}
              className="w-32"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Proses...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Analisis
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Result Section*/}
        {result && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Alert
              variant={result.isGambling ? "destructive" : "default"}
              className={`${
                result.isGambling
                  ? "border-red-500 bg-red-50 dark:bg-red-900/10"
                  : "border-green-500 bg-green-50 dark:bg-green-900/10"
              }`}
            >

              {result.isGambling ? (
                <ShieldAlert className="h-4 w-4" />
              ) : (
                <ShieldCheck className="h-4 w-4" />
              )}

              <AlertTitle
                className={`text-lg font-bold ${
                  result.isGambling ? "text-red-700" : "text-green-700"
                }`}
              >
                {result.isGambling ? "Terdeteksi Judi Online!" : "Konten Aman"}
              </AlertTitle>

              <AlertDescription className="text-muted-foreground">
                Sistem mendeteksi teks ini dengan tingkat keyakinan
                (confidence):
                <span className="font-bold ml-1 text-foreground">
                  {result.confidence}
                </span>
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    </div>
  );
}
