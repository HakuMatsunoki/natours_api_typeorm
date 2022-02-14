const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "User must have a name"],
    trim: true
  },
  email: {
    type: String,
    required: [true, "User must have an email"],
    trim: true,
    lowercase: true,
    unique: [true, "This account already exist"]
  },
  photo: {
    type: String,
    default: "default.jpg"
  },
  role: {
    type: String,
    enum: ["user", "guide", "lead-guide", "admin"],
    default: "user"
  },
  passwd: {
    type: String,
    required: [true, "User must have an passwd"],
    minlength: [8, "passwd should be at least 8 characters long"],
    select: false
  },
  passwdChangedAt: {
    type: Date
    // required: true
  },
  passwdResetToken: String,
  passwdResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});

// START comment this, when impporting user data from json to db
userSchema.pre("save", async function (next) {
  // ony run function if passwd was actually modified
  if (!this.isModified("passwd")) return next();
  // hash passwd with cost of 12
  this.passwd = await bcrypt.hash(this.passwd, 12);
  // delete passwd confirm field
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("passwd") || this.isNew) return next();

  this.passwdChangedAt = Date.now() - 1000;
  next();
});
//======================= END

userSchema.pre(/^find/, function (next) {
  // this points to the current querry
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPasswd = async function (
  candidatePasswd,
  userPasswd
) {
  return await bcrypt.compare(candidatePasswd, userPasswd);
};

userSchema.methods.changedPasswdAfter = function (JWTTimestamp) {
  if (this.passwdChangedAt) {
    const changedTimestamp = parseInt(
      this.passwdChangedAt.getTime() / 1000,
      10
    );
    // console.log(this.passwordChangedAt, JWTTimestamp);
    // console.log(changedTimestamp, JWTTimestamp);
    return JWTTimestamp < changedTimestamp; // token issued < passwd changed
  }

  // not changed
  return false;
};

userSchema.methods.createPasswdResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwdResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwdResetExpires = Date.now() + 10 * 60 * 1000;

  // console.log({ resetToken }, this.passwdResetToken);

  return resetToken;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
