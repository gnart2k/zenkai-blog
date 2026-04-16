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
    <div className="slide-container">
      <Fade>
        {images.map((fadeImage: Image, index) => {
          const imageUrl = fadeImage.url ? getStrapiMedia(fadeImage.url) : null;
          return (
            <div key={index}>
              {imageUrl && <Image className="w-full h-96 object-cover rounded-lg" height={400} width={600} alt={fadeImage.alternativeText || "alt text"} src={imageUrl} />}
            </div>
          );
        })}
      </Fade>
    </div>
  );
}
