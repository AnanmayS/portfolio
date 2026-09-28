/* GitHub Pages serves the site under a sub-path; plain <img> and <a> URLs
   need it spelled out (next/link adds it by itself). */
export const basePath = process.env.PAGES_BASE_PATH ?? "";

export const asset = (path: string) => `${basePath}${path}`;
