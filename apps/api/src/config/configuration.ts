export default () => ({
  port: parseInt(process.env.PORT ?? '3333', 10),
  databaseUrl: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/wiesai',
  auth: {
    jwtSecret: process.env.JWT_SECRET ?? 'change-me'
  },
  integrations: {
    n8nApiKey: process.env.N8N_API_KEY ?? '',
    n8nBaseUrl: process.env.N8N_BASE_URL ?? '',
    elevenlabsApiKey: process.env.ELEVENLABS_API_KEY ?? ''
  }
});
