import type { APIRoute } from 'astro';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// Only these reviewed scans may be served. The KB remains their canonical home.
const documents = ['sashi-sena-prachi-samiti', 'kathalahari-sixth-edition-1927'];

export function getStaticPaths() {
  return documents.map(document => ({ params: { document } }));
}

export const GET: APIRoute = async ({ params }) => {
  if (!params.document || !documents.includes(params.document)) {
    return new Response('Not found', { status: 404 });
  }
  const source = resolve(process.cwd(), '../../kb/research/references/documents', `${params.document}.pdf`);
  return new Response(new Uint8Array(await readFile(source)), {
    headers: { 'Content-Type': 'application/pdf' },
  });
};
