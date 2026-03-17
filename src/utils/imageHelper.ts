// src/utils/imageHelper.ts
// Resolves a MenuItem image (local number or remote URI string) into the correct
// Image source prop so every component can use:
//   <Image source={resolveImage(item.image)} ... />

export function resolveImage(
  image: string | number | undefined,
): { uri: string } | number | undefined {
  if (image === undefined || image === null) return undefined;
  if (typeof image === 'number') return image;          // local require()
  return { uri: image };                                // remote URL
}
