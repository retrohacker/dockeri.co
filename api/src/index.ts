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
  if (!match || !match.groups || !match.groups.image) {
    return null;
  }
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
    const response = new Response(rendered, {
      headers: { "Content-Type": "image/svg+xml" },
    });
    return response;
  },
};
