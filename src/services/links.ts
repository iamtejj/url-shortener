// Business logic lives here. Routes call services; services call repositories.
// Everything below returns dummy data until the repository is implemented.

export interface LinkDto {
  code: string;
  shortUrl: string;
  originalUrl: string;
}

const BASE_URL = "http://localhost:3000";

export async function createLink(url: string): Promise<LinkDto> {
  const code = "abc123"; // TODO: generate a unique code, then save via repository
  return { code, shortUrl: `${BASE_URL}/${code}`, originalUrl: url };
}

export async function getLink(code: string): Promise<LinkDto> {
  // TODO: load via repository and throw NotFoundError when missing
  return { code, shortUrl: `${BASE_URL}/${code}`, originalUrl: "https://example.com" };
}
