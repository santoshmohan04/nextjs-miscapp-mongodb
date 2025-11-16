export async function getThumbnail(url: string) {
  return `https://api.microlink.io/?url=${url}&meta=false&screenshot=true&embed=screenshot.url
`;
}