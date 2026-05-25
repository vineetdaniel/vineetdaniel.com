export function requireApiKey(request: Request): boolean {
  const key = request.headers.get('x-api-key') ?? request.headers.get('authorization')?.replace('Bearer ', '')
  return key === process.env.API_SECRET
}
