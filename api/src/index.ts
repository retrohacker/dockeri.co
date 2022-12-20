/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import badge from "./badge";

// Parse an image string with an optional namespace
const parseImage =
  /^\/image\/((?<namespace>[a-zA-Z90-9_.-]+)\/)?(?<image>[a-zA-Z0-9_.-]+)$/;

export interface Env {}

type Image = {
  namespace: string | null;
  image: string;
};

function getImage(request: Request): Image | null {
  const url = new URL(request.url);
  const match = parseImage.exec(url.pathname);
  console.log(url.pathname);
  console.log(match);
  if (!match || !match.groups || !match.groups.image) {
    return null;
  }
  console.log(match.groups);
  return match.groups;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const image = getImage(request);
    if (!image) {
      return new Response("", { status: 404 });
    }
    const rendered = await badge(image.namespace, image.image);
    if (!rendered) {
      return new Response("", { status: 404 });
    }
    const response = new Response(rendered);
    response.headers.append("Content-Type", "image/svg+xml");
    return response;
  },
};
