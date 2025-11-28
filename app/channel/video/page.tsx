"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link"; // PENTING: Import Link untuk navigasi
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, PlayCircle, ShieldAlert, ChevronLeft, ChevronRight, Eye, MessageSquare } from "lucide-react";

interface VideoItem {
  id: string;
  snippet: {
    title: string;
    description: string;
    publishedAt: string;
    thumbnails: {
      medium: {
        url: string;
      };
    };
    resourceId: {
      videoId: string;
    };
  };
  contentDetails: {
    videoId: string;
  };
}

export default function VideoPage() {
  const { data: session, status } = useSession();
  
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination States
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [prevPageToken, setPrevPageToken] = useState<string | null>(null);
  const [playlistId, setPlaylistId] = useState<string | null>(null);

  const fetchVideos = useCallback(async (pageToken: string = "") => {
    // @ts-ignore
    const accessToken = session?.accessToken;
    if (!accessToken) return;

    try {
      setLoading(true);
      setError(null);

      let targetPlaylistId = playlistId;

      if (!targetPlaylistId) {
        const channelRes = await fetch(
          `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&mine=true`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        const channelData = await channelRes.json();
        
        if (!channelData.items?.length) throw new Error("Channel tidak ditemukan.");
        targetPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;
        setPlaylistId(targetPlaylistId);
      }

      // Ambil Video dari Playlist
      const videosRes = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${targetPlaylistId}&maxResults=8&pageToken=${pageToken}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const videosData = await videosRes.json();

      if (videosRes.ok) {
        setVideos(videosData.items);
        setNextPageToken(videosData.nextPageToken || null);
        setPrevPageToken(videosData.prevPageToken || null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        throw new Error(videosData.error?.message || "Gagal mengambil video.");
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }, [session, playlistId]);

  useEffect(() => {
    // @ts-ignore
    if (status === "authenticated" && session?.accessToken) {
      fetchVideos(); 
    }
  }, [status, session, fetchVideos]);

  const handleNextPage = () => nextPageToken && fetchVideos(nextPageToken);
  const handlePrevPage = () => prevPageToken && fetchVideos(prevPageToken);

  if (status === "loading") return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  if (error) return <div className="text-center p-10 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Channel Video</h1>
          <p className="text-muted-foreground">Pilih video untuk melihat detail komentar & statistik.</p>
        </div>
        <Badge variant="secondary" className="px-4 py-1">Halaman Aktif</Badge>
      </div>

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center flex-col gap-2">
           <Loader2 className="h-8 w-8 animate-spin text-primary" />
           <p className="text-sm text-muted-foreground">Memuat video...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((video) => {
              // ID Video bisa ada di resourceId
              const videoId = video.snippet.resourceId?.videoId || video.contentDetails?.videoId || video.id;
              
              return (
                <Card 
                  key={video.id} 
                  className="flex flex-col h-full overflow-hidden hover:shadow-lg transition-all group border-muted-foreground/20"
                >
                  {/* --- thumbnail dibungkus Link --- */}
                  <Link href={`/channel/video/${videoId}`} className="block relative aspect-video w-full bg-muted overflow-hidden cursor-pointer">
                    <Image
                      src={video.snippet.thumbnails.medium.url}
                      alt={video.snippet.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    {/* Overlay Icon Mata*/}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye className="h-10 w-10 text-white drop-shadow-lg" />
                    </div>
                  </Link>

                  <CardHeader className="p-4 pb-2 space-y-2">
                    {/* --- Judul dibungkus Link --- */}
                    <Link href={`/channel/video/${videoId}`} className="hover:underline decoration-primary">
                      <CardTitle 
                        className="text-base font-semibold line-clamp-2 leading-snug min-h-[3rem]" 
                        title={video.snippet.title}
                      >
                        {video.snippet.title}
                      </CardTitle>
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {new Date(video.snippet.publishedAt).toLocaleDateString("id-ID", {
                        day: "numeric", month: "long", year: "numeric"
                      })}
                    </p>
                  </CardHeader>

                  <CardContent className="p-0 flex-1" />

                  <CardFooter className="p-4 pt-2 mt-auto grid grid-cols-2 gap-2">
                    {/* --- Tombol Detail --- */}
                    <Link href={`/channel/video/${videoId}`} className="w-full">
                      <Button variant="outline" className="w-full gap-2 text-xs h-9">
                        <MessageSquare className="h-3 w-3" />
                        Detail
                      </Button>
                    </Link>
                    
                    {/* Tombol Deteksi */}
                    <Link href={`/channel/video/${videoId}?action=detect`} className="w-full">
                       <Button className="w-full bg-destructive hover:bg-destructive/90 text-white gap-2 text-xs h-9 shadow-sm">
                        <ShieldAlert className="h-3 w-3" />
                        Deteksi
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          <div className="flex justify-center items-center gap-4 pt-8">
            <Button variant="outline" onClick={handlePrevPage} disabled={!prevPageToken || loading} className="w-32">
              <ChevronLeft className="mr-2 h-4 w-4" /> Prev
            </Button>
            <Button variant="outline" onClick={handleNextPage} disabled={!nextPageToken || loading} className="w-32">
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}