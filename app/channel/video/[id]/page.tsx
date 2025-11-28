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
import { Loader2, ThumbsUp, MessageCircle, Eye, ChevronLeft, ShieldAlert, Ban } from "lucide-react";

// Tipe Data Detail Video
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

// Tipe Data Komentar
interface CommentThread {
  id: string;
  snippet: {
    topLevelComment: {
      snippet: {
        authorDisplayName: string;
        authorProfileImageUrl: string;
        textDisplay: string;
        publishedAt: string;
        likeCount: number;
      };
    };
  };
}

export default function VideoDetailPage() {
  const params = useParams(); 
  const videoId = params?.id as string;
  const { data: session, status } = useSession();

  const [video, setVideo] = useState<VideoDetail | null>(null);
  const [comments, setComments] = useState<CommentThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State khusus untuk mendeteksi apakah komentar dimatikan
  const [isCommentsDisabled, setIsCommentsDisabled] = useState(false);

  useEffect(() => {
    // 1. Cek Status Login & Token
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
      setIsCommentsDisabled(false); // Reset setiap kali fetch baru
      
      try {
        // --- FETCH 1: DETAIL VIDEO ---
        const videoRes = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        
        const videoData = await videoRes.json();
        if (!videoRes.ok) throw new Error(videoData.error?.message || "Gagal mengambil detail video");
        
        // --- FETCH 2: KOMENTAR TERBARU ---
        const commentRes = await fetch(
          `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=20&order=time`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        const commentData = await commentRes.json();

        // LOGIKA PENANGANAN ERROR KOMENTAR
        if (!commentRes.ok) {
           // Cek apakah errornya karena komentar dinonaktifkan (403 commentsDisabled)
           if (commentData.error?.code === 403 && commentData.error?.errors?.[0]?.reason === 'commentsDisabled') {
             console.warn("Komentar dinonaktifkan pada video ini.");
             setIsCommentsDisabled(true); 
             setComments([]); // Kosongkan data, jangan throw error
           } else {
             // Jika error lain (misal quota habis), baru throw error
             throw new Error(commentData.error?.message || "Gagal mengambil komentar");
           }
        } else {
           // Jika sukses ambil komentar
           if (commentData.items) {
             setComments(commentData.items);
           }
        }

        // Set State Video
        if (videoData.items?.length > 0) {
          setVideo(videoData.items[0]);
        } else {
          setError("Video tidak ditemukan atau telah dihapus.");
        }

      } catch (err: any) {
        console.error("Error fetching details:", err);
        setError(err.message || "Terjadi kesalahan saat memuat data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [videoId, session, status]);


  if (status === "loading" || loading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Sedang mengambil data dari YouTube...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center px-4">
        <ShieldAlert className="h-16 w-16 text-destructive" />
        <h3 className="text-xl font-bold text-destructive">Gagal Memuat Data</h3>
        <p className="text-muted-foreground">{error}</p>
        <Link href="/channel/video">
          <Button variant="outline">Kembali ke Daftar Video</Button>
        </Link>
      </div>
    );
  }

  if (!video) return null;

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl space-y-8">
      {/* Navigation */}
      <div className="flex items-center gap-2">
        <Link href="/channel/video">
          <Button variant="ghost" className="gap-2 pl-0 hover:bg-transparent hover:text-primary transition-colors">
            <ChevronLeft className="h-4 w-4" /> Kembali ke Daftar Video
          </Button>
        </Link>
      </div>

      {/* Video Header Section */}
      <div className="grid md:grid-cols-3 gap-8">
        {/* Thumbnail */}
        <div className="md:col-span-1">
           <div className="relative aspect-video bg-muted rounded-xl overflow-hidden border shadow-sm">
             <Image 
               src={video.snippet.thumbnails.high?.url || video.snippet.thumbnails.medium.url} 
               alt={video.snippet.title} 
               fill
               className="object-cover"
               priority
             />
           </div>
        </div>

        {/* Info Detail */}
        <div className="md:col-span-2 space-y-5">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold leading-tight tracking-tight text-foreground">
              {video.snippet.title}
            </h1>
            <p className="text-sm text-muted-foreground mt-2 font-medium">
              Dipublikasikan pada {new Date(video.snippet.publishedAt).toLocaleDateString("id-ID", {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
              })}
            </p>
          </div>

          {/* Stats Bar */}
          <div className="flex flex-wrap gap-4 text-sm font-medium">
             <Badge variant="secondary" className="px-3 py-1 gap-2 text-sm">
               <Eye className="h-4 w-4" /> 
               {Number(video.statistics.viewCount).toLocaleString()} Views
             </Badge>
             <Badge variant="secondary" className="px-3 py-1 gap-2 text-sm">
               <ThumbsUp className="h-4 w-4" /> 
               {Number(video.statistics.likeCount).toLocaleString()} Likes
             </Badge>
             <Badge variant="secondary" className="px-3 py-1 gap-2 text-sm">
               <MessageCircle className="h-4 w-4" /> 
               {/* Jika komentar disable*/}
               {isCommentsDisabled ? "-" : Number(video.statistics.commentCount).toLocaleString()} Komentar
             </Badge>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <Button 
                size="lg" 
                className="w-full md:w-auto bg-destructive hover:bg-destructive/90 gap-2 shadow-lg hover:shadow-destructive/25 transition-all"
                disabled={isCommentsDisabled || comments.length === 0} 
            >
              <ShieldAlert className="h-5 w-5" />
              Scan Komentar Spam Sekarang
            </Button>
            {isCommentsDisabled && (
                <p className="text-xs text-destructive mt-2 font-medium flex items-center gap-1">
                   <Ban className="h-3 w-3" />
                   Tidak dapat melakukan scan karena komentar dinonaktifkan oleh pemilik channel.
                </p>
            )}
          </div>
        </div>
      </div>

      <Separator />

      {/* Description Expandable */}
      <div className="bg-muted/30 p-4 rounded-lg border">
        <h3 className="font-semibold mb-2 text-sm uppercase tracking-wider text-muted-foreground">Deskripsi Video</h3>
        <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap line-clamp-4 hover:line-clamp-none transition-all cursor-pointer">
          {video.snippet.description}
        </p>
      </div>

      <Separator />

      {/* Comments Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Komentar Terbaru
          </h2>
          {!isCommentsDisabled && <Badge variant="outline">20 Teratas</Badge>}
        </div>

        {isCommentsDisabled ? (
           // TAMPILAN JIKA KOMENTAR DINONAKTIFKAN
           <div className="flex flex-col items-center justify-center py-16 text-muted-foreground bg-muted/20 rounded-xl border border-dashed gap-2">
             <Ban className="h-10 w-10 opacity-50" />
             <p className="font-medium">Komentar dinonaktifkan pada video ini.</p>
           </div>
        ) : comments.length === 0 ? (
          // TAMPILAN JIKA
          <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
            Belum ada komentar pada video ini.
          </div>
        ) : (
          // DAFTAR KOMENTAR
          <div className="space-y-4">
            {comments.map((thread) => {
              const comment = thread.snippet.topLevelComment.snippet;
              return (
                <Card key={thread.id} className="border-none shadow-sm bg-card hover:bg-muted/20 transition-colors border-l-4 border-l-transparent hover:border-l-primary">
                  <CardHeader className="flex flex-row gap-4 p-4 space-y-0 items-start">
                    {/* Avatar */}
                    <div className="h-10 w-10 relative rounded-full overflow-hidden flex-shrink-0 bg-muted border">
                      <Image 
                        src={comment.authorProfileImageUrl} 
                        alt={comment.authorDisplayName} 
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    
                    {/* Content */}
                    <div className="space-y-1.5 w-full">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-2">
                          <p className="text-sm font-semibold text-foreground">
                            {comment.authorDisplayName}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.publishedAt).toLocaleDateString("id-ID")}
                          </span>
                        </div>
                        
                        {/* Likes on Comment */}
                        {comment.likeCount > 0 && (
                           <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                              <ThumbsUp className="h-3 w-3" /> {comment.likeCount}
                           </div>
                        )}
                      </div>
                      
                      <p className="text-sm leading-relaxed text-foreground/90">
                        {comment.textDisplay}
                      </p>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}