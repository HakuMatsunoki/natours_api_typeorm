export const serverConfigs = {
  PORT: process.env.PORT || 3000,
  DB: process.env.DB || "mongodb://localhost:27017/natours-test",
  NODE_ENV: process.env.NODE_ENV || "development",
  RATELIMIT_MAX: process.env.RATELIMIT_MAX ? +process.env.RATELIMIT_MAX : 100,
  RATELIMIT_TIME: process.env.RATELIMIT_TIME ? +process.env.RATELIMIT_TIME : 1,
  REQUEST_BODY_MAX: process.env.REQUEST_BODY_MAX || "10kb"
};
