export const appConfig = {
  BCRYPT_COST: process.env.BCRYPT_COST ? +process.env.BCRYPT_COST : 12,
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET || "mega_super-SecReT",
  REFRESH_TOKEN_SECRET:
    process.env.REFRESH_TOKEN_SECRET || "super_duper_seCreT",
  ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN || "30m",
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || "30d",
  PASSWD_RESET_TOKEN_LENGTH: process.env.PASSWD_RESET_TOKEN_LENGTH
    ? +process.env.PASSWD_RESET_TOKEN_LENGTH
    : 32,
  PASSWD_RESET_TOKEN_EXPIRES_IN: process.env.PASSWD_RESET_TOKEN_EXPIRES_IN
    ? +process.env.PASSWD_RESET_TOKEN_EXPIRES_IN
    : 5,
  AWS_REGION: process.env.AWS_REGION || "aws_region",
  AWS_BUCKET: process.env.AWS_BUCKET || "aws_bucket",
  TOUR_NAME_MAX_LENGTH: process.env.TOUR_NAME_MAX_LENGTH
    ? +process.env.TOUR_NAME_MAX_LENGTH
    : 40,
  TOUR_NAME_MIN_LENGTH: process.env.TOUR_NAME_MIN_LENGTH
    ? +process.env.TOUR_NAME_MIN_LENGTH
    : 10,
  TOUR_MAX_DURATION: process.env.TOUR_MAX_DURATION
    ? +process.env.TOUR_MAX_DURATION
    : 30,
  TOUR_MAX_GROUP: process.env.TOUR_MAX_GROUP ? +process.env.TOUR_MAX_GROUP : 30,
  TOUR_SUMM_MAX_LEN: process.env.TOUR_SUMM_MAX_LEN
    ? +process.env.TOUR_SUMM_MAX_LEN
    : 200,
  TOUR_DESC_MAX_LEN: process.env.TOUR_DESC_MAX_LEN
    ? +process.env.TOUR_DESC_MAX_LEN
    : 2000,
  TOUR_DEFAULT_NAME: process.env.TOUR_DEFAULT_NAME || "New Awesome Tour",
  TOUR_IMG_HEIGHT: process.env.TOUR_IMG_HEIGHT
    ? +process.env.TOUR_IMG_HEIGHT
    : 900,
  TOUR_IMG_WIDTH: process.env.TOUR_IMG_WIDTH
    ? +process.env.TOUR_IMG_WIDTH
    : 1440,
  LOCATION_ADDR_MAX_LEN: process.env.LOCATION_ADDR_MAX_LEN
    ? +process.env.LOCATION_ADDR_MAX_LEN
    : 100,
  LOCATION_DESC_MAX_LEN: process.env.LOCATION_DESC_MAX_LEN
    ? +process.env.LOCATION_DESC_MAX_LEN
    : 50,
  LOCATION_DAY_MAX: process.env.LOCATION_DAY_MAX
    ? +process.env.LOCATION_DAY_MAX
    : 31,
  DEFAULT_USER_AVATAR: process.env.DEFAULT_USER_AVATAR || "default.jpg",
  USER_PASSWD_MIN_LENGTH: process.env.USER_PASSWD_MIN_LENGTH
    ? +process.env.USER_PASSWD_MIN_LENGTH
    : 8,
  RATING_MIN: process.env.RATING_MIN ? +process.env.RATING_MIN : 1,
  RATING_MAX: process.env.RATING_MAX ? +process.env.RATING_MAX : 5,
  RATING_DEFAULT: process.env.RATING_DEFAULT
    ? +process.env.RATING_DEFAULT
    : 4.5,
  IMG_MAX_SIZE: process.env.IMG_MAX_SIZE
    ? +process.env.IMG_MAX_SIZE * 1024 * 1024
    : 10 * 1024 * 1024,
  USER_AVATAR_RESOLUTION: process.env.USER_AVATAR_RESOLUTION
    ? +process.env.USER_AVATAR_RESOLUTION
    : 500,
  EMAIL_FROM: process.env.EMAIL_FROM || "mail@example.com",
  EMAIL_USERNAME: process.env.EMAIL_USERNAME || "mail_user_name",
  EMAIL_PASSWD: process.env.EMAIL_PASSWD || "mail_user_passwd",
  MAIN_SITE_URL: process.env.MAIN_SITE_URL || "#",
  CHANGE_PASSWD_URL: process.env.CHANGE_PASSWD_URL || "#"
};
