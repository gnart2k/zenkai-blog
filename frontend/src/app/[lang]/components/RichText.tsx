import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

interface RichTextProps {
  data: {
    body: string;
  };
}

export default function RichText({ data }: RichTextProps) {
  return (
    <section className="rich-text py-6">
      <Markdown 
        remarkPlugins={[remarkGfm]} 
        rehypePlugins={[rehypeRaw]}
      >
        {data.body}
      </Markdown>
    </section>
  );
}
