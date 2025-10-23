export default () => ({
  port: parseInt(process.env.PORT ?? '3333', 10),
  databaseUrl: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/wieslogic',
  redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
  clerk: {
    secretKey: process.env.CLERK_SECRET_KEY ?? '',
    webhookSecret: process.env.CLERK_WEBHOOK_SECRET ?? ''
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? ''
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY ?? '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? ''
  },
  elevenlabs: {
    apiKey: process.env.ELEVENLABS_API_KEY ?? ''
  },
  telemetry: {
    otlpEndpoint: process.env.OTLP_ENDPOINT ?? '',
    logLevel: process.env.LOG_LEVEL ?? 'info'
  }
});
