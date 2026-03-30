"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LazyVideoProps {
  src: string;
  poster: string;
  alt: string;
  className?: string;
  videoClassName?: string;
}

export function LazyVideo({
  src,
  poster,
  alt,
  className,
  videoClassName,
}: LazyVideoProps) {
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "200px", // Inicia o carregamento um pouco antes de chegar
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden bg-stone-100",
        className
      )}
    >
      {/* Imagem de Fallback/Poster Otimizada */}
      <Image
        src={poster}
        alt={alt}
        fill
        className={cn(
          "object-cover transition-opacity duration-700",
          isLoaded ? "opacity-0" : "opacity-100"
        )}
        priority={false}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />

      {/* Vídeo Nativo Lazy-Loaded */}
      {isInView && (
        <video
          src={src}
          autoPlay
          muted
          loop
          playsInline
          onLoadedData={() => setIsLoaded(true)}
          onCanPlayThrough={() => setIsLoaded(true)}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-700",
            videoClassName,
            isLoaded ? "opacity-100" : "opacity-0"
          )}
        />
      )}
    </div>
  );
}
