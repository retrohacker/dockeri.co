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

export default async function badge(namespace, image) {
  let url = `${api}/${namespace || "library"}/${image}/`;
  let res;
  try {
    console.log("fetching stats");
    res = await (await fetch(url)).json();
    console.log(res);
  } catch (e) {
    console.log(e);
    return {
      status: 500,
    };
  }

  const name = namespace ? `${namespace}/${image}` : image;
  const stars = human(res.star_count);
  const downloads = human(res.pull_count);
  const trusted = human(res.is_automated);

  try {
    url = `${api}/${namespace || "library"}/${image}/tags/latest`;
    res = await (await fetch(url)).json();
    console.log(res);
  } catch (e) {
    console.log(e);
  }

  console.log(res.full_size);
  const size = humanBytes(res.full_size);

  return svg(name, stars, downloads, size, trusted);
}
