import fs from "node:fs";
import path from "path";

const paintingsPath = "/src/content/paintings"

export const getPaintings = async () => {
  let images = import.meta.glob<{ default: ImageMetadata }>(
    `/src/content/paintings/**/*.png`
  );

  let markdown = import.meta.glob<{ frontmatter: { alt?: string, 'thumbnail-position'?: string } }>(
    `/src/content/paintings/**/*.mdx`
  );

  const postsDirectory = path.join(process.cwd(), paintingsPath);

  const files = fs
    .readdirSync(postsDirectory)
    .filter((item) => item !== ".DS_Store")
    .sort((a, b) => (Number(a) < Number(b) ? 1 : -1));

  const imageDirs = files.map((file) => ({
    image:
      images[
        Object.keys(images).find((key) =>
          key.includes(`${paintingsPath}/${file}`)
        )!
      ],
    meta: markdown[
      Object.keys(markdown).find((key) =>
        key.includes(`${paintingsPath}/${file}`)
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
