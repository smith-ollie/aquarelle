import fs from "node:fs";
import path from "path";

export const getImages = async () => {
  let images = import.meta.glob<{ default: ImageMetadata }>(
    "/src/content/art/**/*.png"
  );

  let markdown = import.meta.glob<{ frontmatter: { alt?: string } }>(
    "/src/content/art/**/*.mdx"
  );

  const postsDirectory = path.join(process.cwd(), "src/content/art");

  const files = fs
    .readdirSync(postsDirectory)
    .filter((item) => item !== ".DS_Store")
    .sort((a, b) => (Number(a) < Number(b) ? 1 : -1));

  const imageDirs = files.map((file) => ({
    image:
      images[
        Object.keys(images).find((key) =>
          key.includes(`/src/content/art/${file}`)
        )!
      ],
    meta: markdown[
      Object.keys(markdown).find((key) =>
        key.includes(`/src/content/art/${file}`)
      )!
    ],
    name: file,
  }));

  const resolvedImages = await Promise.all(
    Object.values(imageDirs).map(
      async ({ image: imageFn, meta: metaFn, name }) => {
        const image = await imageFn().then((mod) => mod.default);
        const meta = metaFn ? await metaFn() : null;

        return {
          image,
          meta: { ...(typeof meta === "object" ? meta : {}), name },
        };
      }
    )
  );

  return resolvedImages;
};
