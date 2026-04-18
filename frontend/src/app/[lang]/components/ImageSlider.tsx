"use client";
import { Fade } from "react-slideshow-image";
import { getStrapiMedia } from "../utils/api-helpers";
import Image from "next/image";

interface Image {
  id: number;
  alternativeText?: string | null;
  caption?: string | null;
  url: string;
}

interface SlidShowProps {
  files?: Image[];
}

export default function Slideshow({ data }: { data: SlidShowProps }) {
  const images = data.files || [];
  
  return (
    <div className="slide-container w-full overflow-hidden rounded-lg">
      <Fade>
        {images.map((fadeImage: Image, index) => {
          const imageUrl = fadeImage.url ? getStrapiMedia(fadeImage.url) : null;
          return (
            <div key={index} className="relative aspect-[4/3] w-full sm:aspect-video md:aspect-[21/9]">
              {imageUrl && (
                <Image
                  className="object-cover"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 56rem"
                  alt={fadeImage.alternativeText || "Slide image"}
                  src={imageUrl}
                />
              )}
            </div>
          );
        })}
      </Fade>
    </div>
  );
}
