import { defineCollection, z } from 'astro:content';
import { Buffer } from 'node:buffer';

const catalogBase = 'https://raw.githubusercontent.com/qiime2/library-catalog/main/gallery/';
const httpsUrl = z
  .string()
  .url()
  .refine((url) => new URL(url).protocol === 'https:', 'Expected an HTTPS URL');
const galleryInfo = z.object({
  title: z.string().min(1),
  desc: z.string().min(1),
  href: httpsUrl,
});

async function readCatalog(path: string): Promise<Response> {
  const url = new URL(path, catalogBase);
  const response = await fetch(url, { signal: AbortSignal.timeout(20_000) });
  if (!response.ok) throw new Error(`Gallery catalog request failed (${response.status}): ${url}`);
  return response;
}

async function readCatalogJson(path: string): Promise<unknown> {
  return (await readCatalog(path)).json();
}

async function readThumbnail(path: string) {
  const bytes = Buffer.from(await (await readCatalog(path)).arrayBuffer());
  if (!bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])))
    throw new Error(`Gallery thumbnail is not a PNG: ${path}`);
  return {
    thumbnail: `data:image/png;base64,${bytes.toString('base64')}`,
  };
}

export const galleryCollection = defineCollection({
  loader: async () => {
    const names = z
      .array(z.string().regex(/^[A-Za-z0-9_-]+$/))
      .min(1)
      .parse(await readCatalogJson('index.json'));
    if (new Set(names).size !== names.length) throw new Error('Gallery catalog contains duplicate entry names');

    // Embed the thumbnails at build time. Only the selected QZV needs a browser request.
    return Promise.all(
      names.map(async (id, order) => {
        const [info, thumbnail] = await Promise.all([
          readCatalogJson(`${id}/info.json`),
          readThumbnail(`${id}/thumb.png`),
        ]);
        return { id, order, ...galleryInfo.parse(info), ...thumbnail };
      })
    );
  },
  schema: galleryInfo.extend({
    order: z.number().int().nonnegative(),
    thumbnail: z.string().regex(/^data:image\/png;base64,[A-Za-z0-9+/]+={0,2}$/),
  }),
});
