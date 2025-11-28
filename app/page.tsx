import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ShieldCheck, 
  Zap, 
  BarChart3, 
  ArrowRight, 
  Github, 
  Target, 
  TrendingDown, 
  Award, 
  Activity,
  CheckCircle2,
  Lock
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1">
        {/* --- HERO SECTION --- */}
        <section className="py-24 md:py-32 space-y-8 text-center px-4 bg-gradient-to-b from-background to-muted/20">
          <div className="space-y-4 max-w-4xl mx-auto">
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary hover:bg-primary/20 mb-4">
              🚀 Skripsi / Tugas Akhir Edition
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
              Deteksi Komentar <span className="text-red-500">Judi Online</span> <br className="hidden md:block" />Secara Otomatis
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto leading-relaxed">
              Lindungi platform digital dari spam promosi judi online menggunakan teknologi
              <span className="font-semibold text-foreground"> Deep Learning (Bi-LSTM & Word2Vec)</span>. 
              Akurasi tinggi, respons cepat.
            </p>
          </div>

          {/* --- CTA BUTTONS --- */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link href="/detector">
              <Button size="lg" className="h-12 px-8 text-base shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all">
                Mulai Deteksi Sekarang
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="https://github.com/username/repo-skripsi" target="_blank">
              <Button variant="outline" size="lg" className="h-12 px-8">
                <Github className="mr-2 h-4 w-4" />
                Dokumentasi / Repo
              </Button>
            </Link>
          </div>
        </section>

        {/* --- MODEL METRICS SECTION --- */}
        <section className="container mx-auto px-4 py-12 -mt-16 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            
            {/* Akurasi */}
            <Card className="bg-card/50 backdrop-blur border shadow-sm hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
                <CardTitle className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Akurasi</CardTitle>
                <Target className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-2xl font-extrabold">97.64%</div>
                <p className="text-[10px] text-muted-foreground">Validation Accuracy</p>
              </CardContent>
            </Card>

            {/* Precision */}
            <Card className="bg-card/50 backdrop-blur border shadow-sm hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
                <CardTitle className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Precision</CardTitle>
                <Zap className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-2xl font-extrabold">94.00%</div>
                <p className="text-[10px] text-muted-foreground">Positive Predictive Value</p>
              </CardContent>
            </Card>

            {/* F1-Score */}
            <Card className="bg-card/50 backdrop-blur border shadow-sm hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
                <CardTitle className="text-xs font-bold uppercase text-muted-foreground tracking-wider">F1-Score</CardTitle>
                <Award className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-2xl font-extrabold">91.63%</div>
                <p className="text-[10px] text-muted-foreground">Harmonic Mean</p>
              </CardContent>
            </Card>

            {/* Recall */}
            <Card className="bg-card/50 backdrop-blur border shadow-sm hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
                <CardTitle className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Recall</CardTitle>
                <Activity className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-2xl font-extrabold">89.39%</div>
                <p className="text-[10px] text-muted-foreground">Sensitivity</p>
              </CardContent>
            </Card>

            {/* Loss */}
            <Card className="bg-card/50 backdrop-blur border shadow-sm hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
                <CardTitle className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Loss</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-2xl font-extrabold">9.2%</div>
                <p className="text-[10px] text-muted-foreground">Validation Loss</p>
              </CardContent>
            </Card>

            {/* Architecture */}
            <Card className="bg-card/50 backdrop-blur border shadow-sm hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
                <CardTitle className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Model</CardTitle>
                <ShieldCheck className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-xl font-extrabold truncate">Bi-LSTM</div>
                <p className="text-[10px] text-muted-foreground">+ Word2Vec Embedding</p>
              </CardContent>
            </Card>

          </div>
        </section>

        {/* --- WHY SECTION --- */}
        <section className="py-20 bg-muted/30 border-t">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                  Mengapa Perlu Deteksi Otomatis?
                </h2>
                <p className="text-muted-foreground text-lg">
                  Spam komentar judi online semakin masif dan menggunakan pola bahasa yang sulit dideteksi filter kata kunci biasa (keyword blocking).
                </p>
                <ul className="space-y-4">
                  {[
                    "Menghindari sensor keyword (cth: G@c0r, Sl0t)",
                    "Menjaga integritas platform dan kenyamanan user",
                    "Proses cleaning dataset lebih efisien"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Visualisasi Prediksi */}
              <div className="relative h-[300px] bg-gradient-to-tr from-primary/10 to-secondary/10 rounded-2xl border flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
                <div className="text-center p-8 bg-background/80 backdrop-blur rounded-xl shadow-lg border relative z-10 max-w-xs">
                  <Lock className="h-12 w-12 mx-auto text-primary mb-4" />
                  <div className="space-y-2">
                    <p className="font-medium text-sm text-muted-foreground">Status Komentar:</p>
                    <div className="text-2xl font-bold text-red-600 bg-red-100 px-3 py-1 rounded-md inline-block">
                      SPAM DETECTED
                    </div>
                    <p className="text-xs text-muted-foreground font-mono mt-2">
                      Confidence Score: <span className="text-primary font-bold">0.998</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}