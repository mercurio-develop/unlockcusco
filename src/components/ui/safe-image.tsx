"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export function SafeImageWrapper({ 
  src, 
  alt, 
  wrapperClassName, 
  imgClassName, 
  fallbackSrc,
  priority,
  onLoad
}: { 
  src: string; 
  alt: string; 
  wrapperClassName?: string; 
  imgClassName?: string; 
  fallbackSrc?: string;
  priority?: boolean;
  onLoad?: () => void;
}) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null);
  const onLoadRef = useRef(onLoad);

  useEffect(() => {
    onLoadRef.current = onLoad;
  }, [onLoad]);

  useEffect(() => {
    if (imgRef.current?.complete) {
      setIsLoading(false);
      if (onLoadRef.current) onLoadRef.current();
    }
  }, [src]);

  if (hasError && !fallbackSrc) return null;

  return (
    <div className={cn("relative overflow-hidden", wrapperClassName)}>
      {isLoading && (
        <div className="absolute inset-0 bg-slate-200 animate-pulse z-0" />
      )}
      <img 
        ref={imgRef}
        src={hasError && fallbackSrc ? fallbackSrc : src} 
        alt={alt} 
        referrerPolicy="no-referrer"
        fetchPriority={priority ? "high" : "auto"}
        className={cn(imgClassName, "relative z-10 transition-opacity duration-500", isLoading ? "opacity-0" : "opacity-100")} 
        onLoad={() => {
          setIsLoading(false);
          if (onLoad) onLoad();
        }}
        onError={() => {
          if (!hasError && fallbackSrc) {
            setHasError(true);
            setIsLoading(true); // reset loading state for fallback
          } else {
            setHasError(true);
            setIsLoading(false);
            if (onLoad) onLoad();
          }
        }} 
      />
    </div>
  );
}
