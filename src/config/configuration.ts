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
  gcp: {
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
  }
});