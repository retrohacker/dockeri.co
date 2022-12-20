import svg from "./svg";
const api = "https://hub.docker.com/v2/repositories";

function convert(n, b, s) {
  return ((n / b) | 0) + s;
}

function human(value) {
  const n = parseInt(value);
  if (n > 1000000000) return convert(n, 1000000000, "B");
  if (n > 1000000) return convert(n, 1000000, "M");
  if (n > 1000) return convert(n, 1000, "K");
  return n;
}

function humanBytes(value) {
  const n = parseInt(value);
  if (n > 1024 * 1024 * 1024) return convert(n, 1024 * 1024 * 1024, "GB");
  if (n > 1024 * 1024) return convert(n, 1024 * 1024, "MB");
  if (n > 1024) return convert(n, 1024, "KB");
  return n + "B";
}

export default async function badge(namespace, image): string | null {
  let url = `${api}/${namespace || "library"}/${image}/`;
  let res = await fetch(url);
  if (res.status !== 200) {
    return null;
  }

  const metadata = await res.json();
  const name = namespace ? `${namespace}/${image}` : image;
  const stars = human(metadata.star_count);
  const downloads = human(metadata.pull_count);
  const trusted = namespace === "library" || !namespace;

  url = `${api}/${namespace || "library"}/${image}/tags/latest`;
  res = await fetch(url);
  let size = "???";
  if (res.status === 200) {
    const latest = await res.json();
    size = humanBytes(latest.full_size);
  }

  return svg(name, stars, downloads, size, trusted);
}
