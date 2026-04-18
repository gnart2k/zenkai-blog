import { getStrapiMedia } from "../utils/api-helpers";
import Image from "next/image";

interface MediaProps {
  file?: {
    id: string;
    url: string;
    name?: string;
    alternativeText?: string;
  };
}

export default function Media({ data }: { data: MediaProps }) {
  const imgUrl = data.file?.url ? getStrapiMedia(data.file.url) : null;
  if (!imgUrl) return null;
  
  return (
    <div className="relative mt-8 w-full max-w-4xl overflow-hidden rounded-lg lg:mt-0">
      <div className="relative aspect-[4/3] w-full sm:aspect-[16/10] md:aspect-[16/9]">
        <Image
          src={imgUrl}
          alt={data.file?.alternativeText || "Article image"}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 56rem"
          className="object-cover"
        />
      </div>
    </div>
  );
}