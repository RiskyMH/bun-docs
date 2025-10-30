import { getLLMText, source, blogs } from "@/lib/source";

export const revalidate = false;

export async function GET() {
  const scan = [
    source.getPages().map(getLLMText),
    blogs
      .getPages()
      .filter((post) => post.data.date)
      .sort(
        (a, b) =>
          new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
      )
      .slice(0, 5)
      .map(getLLMText),
  ].flat();
  const scanned = await Promise.all(scan);

  return new Response(scanned.join("\n\n"));
}
