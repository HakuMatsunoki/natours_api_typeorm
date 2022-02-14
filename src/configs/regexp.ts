export const regexp = {
  NAME: new RegExp(/^[\p{L}\s-]{2,200}$/u),
  PASSWD: new RegExp(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\\$%\\^&\\*])(?=.{8,128})/
  ),
  EMAIL: new RegExp(
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
  ),
  HEX: new RegExp(/^[a-f\d]{24}$/i),
  QUERY_HELPER: new RegExp(/\b(gte|gt|lte|lt)\b/g)
};
