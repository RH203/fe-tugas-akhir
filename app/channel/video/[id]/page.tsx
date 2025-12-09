"use client";

import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  MessageCircle,
  Eye,
  ChevronLeft,
  ShieldAlert,
  Ban,
  CheckCircle,
  Trash2,
  AlertTriangle,
  ScanSearch,
  X,
  Info,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// --- IMPORT ALERT DIALOG (Untuk Konfirmasi Hapus) ---
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// --- TIPE DATA ---
interface VideoDetail {
  id: string;
  snippet: {
    title: string;
    description: string;
    channelTitle: string;
    publishedAt: string;
    thumbnails: {
      high: { url: string };
      medium: { url: string };
    };
  };
  statistics: {
    viewCount: string;
    likeCount: string;
    commentCount: string;
  };
}

interface AnalysisResult {
  isGambling: boolean;
  confidence: string;
  rawScore: number;
}

interface CommentThread {
  id: string;
  snippet: {
    topLevelComment: {
      id: string;
      snippet: {
        authorDisplayName: string;
        authorProfileImageUrl: string;
        textDisplay: string;
        publishedAt: string;
        likeCount: number;
      };
    };
  };
  analysis?: AnalysisResult;
}

// Tipe untuk Feedback Alert
interface FeedbackMessage {
  type: "success" | "error" | "info";
  title: string;
  message: string;
}

export default function VideoDetailPage() {
  const params = useParams();
  const videoId = params?.id as string;
  const { data: session, status } = useSession();

  // State Data
  const [video, setVideo] = useState<VideoDetail | null>(null);
  const [rawComments, setRawComments] = useState<CommentThread[]>([]);

  // State Kategori Komentar
  const [safeComments, setSafeComments] = useState<CommentThread[]>([]);
  const [reviewComments, setReviewComments] = useState<CommentThread[]>([]);
  const [spamComments, setSpamComments] = useState<CommentThread[]>([]);

  // State UI
  const [loading, setLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [isScanned, setIsScanned] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCommentsDisabled, setIsCommentsDisabled] = useState(false);

  // --- STATE BARU: PENGGANTI TOAST ---
  const [feedbackAlert, setFeedbackAlert] = useState<FeedbackMessage | null>(
    null
  );

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

  useEffect(() => {
    if (status === "loading") return;
    // @ts-ignore
    const accessToken = session?.accessToken;

    if (!accessToken) {
      setError("Akses token tidak valid. Silakan login ulang.");
      setLoading(false);
      return;
    }

    if (!videoId) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setIsCommentsDisabled(false);

      try {
        const videoRes = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        const videoData = await videoRes.json();
        if (!videoRes.ok) throw new Error(videoData.error?.message);

        const commentRes = await fetch(
          `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=50&order=time`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        const commentData = await commentRes.json();

        if (!commentRes.ok) {
          if (
            commentData.error?.code === 403 &&
            commentData.error?.errors?.[0]?.reason === "commentsDisabled"
          ) {
            setIsCommentsDisabled(true);
            setRawComments([]);
          } else {
            throw new Error(commentData.error?.message);
          }
        } else {
          if (commentData.items) {
            setRawComments(commentData.items);
            setSafeComments(commentData.items);
          }
        }

        if (videoData.items?.length > 0) setVideo(videoData.items[0]);
        else setError("Video tidak ditemukan.");
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Gagal memuat data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [videoId, session, status]);

  const handleScanComments = async () => {
    if (rawComments.length === 0) return;

    setIsScanning(true);
    setFeedbackAlert(null); // Reset alert sebelumnya
    setSafeComments([]);
    setReviewComments([]);
    setSpamComments([]);

    try {
      const analyzedResults = await Promise.all(
        rawComments.map(async (comment) => {
          const text = comment.snippet.topLevelComment.snippet.textDisplay;
          try {
            const res = await fetch(`${API_URL}/predict`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text }),
            });
            const data = await res.json();
            return {
              ...comment,
              analysis: {
                isGambling: data.is_gambling,
                confidence: data.confidence,
                rawScore: data.raw_score,
              },
            };
          } catch (e) {
            return comment;
          }
        })
      );

      const safe: CommentThread[] = [];
      const review: CommentThread[] = [];
      const spam: CommentThread[] = [];

      analyzedResults.forEach((c) => {
        if (!c.analysis?.isGambling) {
          safe.push(c);
        } else {
          const score = c.analysis.rawScore;
          if (score > 0.9) {
            spam.push(c);
          } else {
            review.push(c);
          }
        }
      });

      setSafeComments(safe);
      setReviewComments(review);
      setSpamComments(spam);
      setIsScanned(true);

      // GANTI TOAST DENGAN ALERT
      setFeedbackAlert({
        type: "success",
        title: "Scan Selesai",
        message: `Ditemukan ${spam.length} spam berbahaya dan ${review.length} perlu review.`,
      });
    } catch (err) {
      console.error("Scan Error", err);
      setSafeComments(rawComments);
      setFeedbackAlert({
        type: "error",
        title: "Gagal Scan",
        message: "Terjadi kesalahan saat menghubungi server AI.",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const rejectCommentFromYouTube = async (commentId: string) => {
    // @ts-ignore
    const accessToken = session?.accessToken;
    console.log(`[API START] Rejecting Comment ID: ${commentId}`);

    if (!accessToken) return false;

    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/comments/setModerationStatus?id=${commentId}&moderationStatus=rejected`,
        {
          method: "POST", 
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Length": "0" 
          },
        }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        console.error("[API FAIL] Google Response:", JSON.stringify(errorData, null, 2));
        
        setFeedbackAlert({
            type: "error",
            title: `Gagal (${res.status})`,
            message: errorData?.error?.message || "Gagal menolak komentar."
        });
        return false;
      }

      console.log("[API SUCCESS] Comment Rejected (Hidden from public)");
      return true;

    } catch (error) {
      console.error("[NETWORK ERROR]", error);
      return false;
    }
  };

  const handleApprove = (id: string) => {
    const target = reviewComments.find((c) => c.id === id);
    if (target) {
      setReviewComments((prev) => prev.filter((c) => c.id !== id));
      setSafeComments((prev) => [target, ...prev]);

      // Feedback Alert
      setFeedbackAlert({
        type: "success",
        title: "Disetujui",
        message: "Komentar ditandai aman.",
      });
    }
  };

  const handleDelete = async (threadId: string) => {
    console.log(`[UI] User menghapus Thread ID: ${threadId}`);
    setFeedbackAlert(null);

    const target =
      reviewComments.find((c) => c.id === threadId) ||
      spamComments.find((c) => c.id === threadId);

    if (!target) {
      console.error("Komentar tidak ditemukan di state");
      return;
    }

    const realCommentId = target.snippet.topLevelComment.id;
    console.log(`[UI] Real Comment ID untuk API: ${realCommentId}`);

    const success = await rejectCommentFromYouTube(realCommentId);

    if (success) {
      // 4. Hapus dari UI menggunakan Thread ID (karena key di React pakai threadId)
      if (target) {
        setReviewComments((prev) => prev.filter((c) => c.id !== threadId));
        setSpamComments((prev) => [target, ...prev]); // Pindah ke history spam (opsional)

        setFeedbackAlert({
          type: "success",
          title: "Berhasil Dihapus",
          message: "Komentar telah dihapus dari YouTube.",
        });
      }
    } else {
      setFeedbackAlert({
        type: "error",
        title: "Gagal Menghapus",
        message: "Terjadi kesalahan (400 Bad Request). Cek Console.",
      });
    }
  };

  const handleBulkDeleteSpam = async () => {
    if (spamComments.length === 0) return;

    setLoading(true);
    setFeedbackAlert(null);
    let deletedCount = 0;

    for (const comment of spamComments) {
      // AMBIL ID ASLI
      const realCommentId = comment.snippet.topLevelComment.id;

      const success = await rejectCommentFromYouTube(realCommentId);

      if (success) {
        deletedCount++;
        // Update UI pakai Thread ID (comment.id)
        setSpamComments((prev) => prev.filter((c) => c.id !== comment.id));
      }
    }

    setLoading(false); // Pastikan ini terpanggil agar loading spinner hilang

    if (deletedCount > 0) {
      setFeedbackAlert({
        type: "success",
        title: "Pembersihan Selesai",
        message: `Berhasil memusnahkan ${deletedCount} komentar spam.`,
      });
    } else {
      setFeedbackAlert({
        type: "error",
        title: "Gagal",
        message: "Gagal menghapus komentar. Pastikan token valid.",
      });
    }
  };

  // --- COMPONENT CARD ---
  const CommentCard = ({
    data,
    type,
  }: {
    data: CommentThread;
    type: "safe" | "review" | "spam";
  }) => {
    const snippet = data.snippet.topLevelComment.snippet;

    return (
      <Card
        className={`border-l-4 shadow-sm ${
          type === "review"
            ? "border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/10"
            : type === "spam"
            ? "border-l-destructive bg-red-50/50 dark:bg-red-900/10"
            : "border-l-green-500 hover:bg-muted/20"
        }`}
      >
        <CardHeader className="p-4 flex flex-row gap-3 space-y-0 items-start">
          <div className="h-8 w-8 relative rounded-full overflow-hidden flex-shrink-0 bg-muted border">
            <Image
              src={snippet.authorProfileImageUrl}
              alt={snippet.authorDisplayName}
              fill
              className="object-cover"
              unoptimized
            />
          </div>

          <div className="w-full space-y-1">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold">
                  {snippet.authorDisplayName}
                </p>
                <span className="text-xs text-muted-foreground">
                  {new Date(snippet.publishedAt).toLocaleDateString("id-ID")}
                </span>
              </div>
              {data.analysis && (
                <Badge
                  variant={
                    type === "safe"
                      ? "outline"
                      : type === "review"
                      ? "secondary"
                      : "destructive"
                  }
                  className="text-[10px]"
                >
                  AI: {data.analysis.confidence}
                </Badge>
              )}
            </div>

            <p className="text-sm text-foreground/90">{snippet.textDisplay}</p>

            {/* ACTION BUTTONS */}
            {type === "review" && (
              <div className="flex gap-2 pt-2 mt-2 border-t border-yellow-200 dark:border-yellow-900">
                <Button
                  size="sm"
                  variant="default"
                  className="h-7 text-xs bg-green-600 hover:bg-green-700"
                  onClick={() => handleApprove(data.id)}
                >
                  <CheckCircle className="w-3 h-3 mr-1" /> Bukan Judi
                </Button>

                {/* ALERT DIALOG DELETE (Untuk Konfirmasi) */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-7 text-xs"
                    >
                      <Trash2 className="w-3 h-3 mr-1" /> Hapus (Spam)
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Hapus Komentar?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tindakan ini akan menghapus komentar dari YouTube secara
                        permanen.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(data.id)}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Ya, Hapus
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}

            {type === "spam" && (
              <div className="pt-1">
                <span className="text-xs text-destructive font-medium flex items-center gap-1">
                  <Ban className="w-3 h-3" /> Ditandai untuk dihapus otomatis
                </span>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>
    );
  };

  // --- LOADING STATES ---
  if (status === "loading" || loading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">
          Sedang mengambil data dari YouTube...
        </p>
      </div>
    );
  }

  if (error || !video)
    return (
      <div className="p-8 text-center text-destructive">
        {error || "Video tidak ditemukan"}
      </div>
    );

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl space-y-8">
      {/* Tombol Back */}
      <Link href="/channel/video">
        <Button variant="ghost" className="pl-0">
          <ChevronLeft className="h-4 w-4 mr-2" /> Kembali
        </Button>
      </Link>

      {/* GLOBAL FEEDBACK ALERT (Pengganti Toast) */}
      {feedbackAlert && (
        <Alert
          variant={feedbackAlert.type === "error" ? "destructive" : "default"}
          className={`animate-in slide-in-from-top-5 shadow-md ${
            feedbackAlert.type === "success"
              ? "border-green-500 bg-green-50 text-green-900 dark:bg-green-900/20 dark:text-green-100"
              : ""
          }`}
        >
          {feedbackAlert.type === "error" ? (
            <Ban className="h-4 w-4" />
          ) : feedbackAlert.type === "success" ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <Info className="h-4 w-4" />
          )}
          <AlertTitle>{feedbackAlert.title}</AlertTitle>
          <AlertDescription className="flex justify-between items-center w-full">
            {feedbackAlert.message}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 ml-4"
              onClick={() => setFeedbackAlert(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Header Info */}
      <div className="flex gap-6 items-start">
        <div className="relative w-48 aspect-video bg-muted rounded-lg overflow-hidden flex-shrink-0 border">
          <Image
            src={video.snippet.thumbnails.medium.url}
            alt="Thumb"
            fill
            className="object-cover"
          />
        </div>
        <div>
          <h1 className="text-xl font-bold line-clamp-2">
            {video.snippet.title}
          </h1>
          <div className="flex gap-3 mt-2">
            <Badge variant="secondary">
              <Eye className="w-3 h-3 mr-1" />{" "}
              {Number(video.statistics.viewCount).toLocaleString()}
            </Badge>
            <Badge variant="secondary">
              <MessageCircle className="w-3 h-3 mr-1" />{" "}
              {Number(video.statistics.commentCount).toLocaleString()}
            </Badge>
          </div>
        </div>
      </div>

      <Separator />

      {/* SCANNER SECTION */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <ShieldAlert className="h-6 w-6 text-primary" />
              Scan Komentar
            </h2>
            <p className="text-muted-foreground text-sm">
              Deteksi promosi judi online menggunakan AI.
            </p>
          </div>

          <Button
            size="lg"
            onClick={handleScanComments}
            disabled={
              isScanning || isCommentsDisabled || rawComments.length === 0
            }
            className={`min-w-[180px] ${
              isScanned
                ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                : "bg-primary"
            }`}
          >
            {isScanning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sedang
                Menganalisis...
              </>
            ) : (
              <>
                <ScanSearch className="w-4 h-4 mr-2" />{" "}
                {isScanned ? "Scan Ulang" : "Mulai Scan AI"}
              </>
            )}
          </Button>
        </div>

        {!isScanned ? (
          <div className="bg-muted/20 border-2 border-dashed rounded-xl p-12 text-center text-muted-foreground">
            <ScanSearch className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-foreground">
              Siap Menganalisis {rawComments.length} Komentar
            </h3>
            <p>
              Klik tombol "Mulai Scan AI" di atas untuk mendeteksi spam secara
              otomatis.
            </p>
          </div>
        ) : (
          <Tabs
            defaultValue={reviewComments.length > 0 ? "review" : "safe"}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger
                value="safe"
                className="data-[state=active]:bg-green-100 data-[state=active]:text-green-900 dark:data-[state=active]:bg-green-900/30 dark:data-[state=active]:text-green-100"
              >
                <CheckCircle className="w-4 h-4 mr-2" /> Aman (
                {safeComments.length})
              </TabsTrigger>
              <TabsTrigger
                value="review"
                className="relative data-[state=active]:bg-yellow-100 data-[state=active]:text-yellow-900 dark:data-[state=active]:bg-yellow-900/30 dark:data-[state=active]:text-yellow-100"
              >
                <AlertTriangle className="w-4 h-4 mr-2" /> Butuh Tinjauan (
                {reviewComments.length})
                {reviewComments.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full animate-bounce">
                    {reviewComments.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="spam"
                className="data-[state=active]:bg-red-100 data-[state=active]:text-red-900 dark:data-[state=active]:bg-red-900/30 dark:data-[state=active]:text-red-100"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Auto Spam (
                {spamComments.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="safe"
              className="space-y-4 animate-in fade-in slide-in-from-bottom-2"
            >
              {safeComments.length === 0 && (
                <p className="text-center py-8 text-muted-foreground">
                  Tidak ada komentar aman.
                </p>
              )}
              {safeComments.map((c) => (
                <CommentCard key={c.id} data={c} type="safe" />
              ))}
            </TabsContent>

            <TabsContent
              value="review"
              className="space-y-4 animate-in fade-in slide-in-from-bottom-2"
            >
              <Alert
                variant="warning"
                className="bg-yellow-50 border-yellow-200 text-yellow-900 dark:bg-yellow-900/10 dark:text-yellow-100 dark:border-yellow-900 mb-4"
              >
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Perhatian Diperlukan</AlertTitle>
                <AlertDescription>
                  AI mendeteksi potensi judi tapi skor keyakinan belum mencapai
                  90%. Silakan review manual.
                </AlertDescription>
              </Alert>
              {reviewComments.length === 0 && (
                <div className="text-center py-12 bg-muted/20 rounded-lg">
                  <CheckCircle className="h-10 w-10 mx-auto text-green-500 mb-2" />
                  <p className="font-medium">
                    Bersih! Tidak ada komentar yang meragukan.
                  </p>
                </div>
              )}
              {reviewComments.map((c) => (
                <CommentCard key={c.id} data={c} type="review" />
              ))}
            </TabsContent>

            <TabsContent
              value="spam"
              className="space-y-4 animate-in fade-in slide-in-from-bottom-2"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <Alert variant="destructive" className="flex-1">
                  <Ban className="h-4 w-4" />
                  <AlertTitle>
                    Terdeteksi Berbahaya (High Confidence)
                  </AlertTitle>
                  <AlertDescription>
                    AI yakin {">"}90% ini adalah judi.
                  </AlertDescription>
                </Alert>

                {spamComments.length > 0 && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        className="w-full md:w-auto shadow-lg hover:bg-red-700 whitespace-nowrap"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Musnahkan Semua ({spamComments.length})
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Musnahkan {spamComments.length} Spam?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Anda akan menghapus semua komentar yang terdeteksi
                          spam secara permanen.
                          <br />
                          <br />
                          <span className="font-bold text-red-500">
                            Peringatan:
                          </span>{" "}
                          Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleBulkDeleteSpam}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          Ya, Musnahkan
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
              {spamComments.length === 0 && (
                <p className="text-center py-8 text-muted-foreground">
                  Tidak ada spam terdeteksi.
                </p>
              )}
              {spamComments.map((c) => (
                <CommentCard key={c.id} data={c} type="spam" />
              ))}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
