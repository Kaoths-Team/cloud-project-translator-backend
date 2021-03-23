export default () => ({
  node_env: process.env.NODE_ENV,
  port: parseInt(process.env.PORT, 10) || 3000,
  db: {
    host: process.env.DB_HOST,
    post: process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
  },
  gcloud: {
    projectId: process.env.GCLOUD_PROJECT_ID,
    clientEmail: process.env.GCLOUD_CLIENT_EMAIL,
    privateKey: `-----BEGIN PRIVATE KEY-----\n${process.env.GCLOUD_PRIVATE_KEY.replace(/\\n/g, '\n')}\n-----END PRIVATE KEY-----`,
  },
});
