const mongoose = require("mongoose");
const Tour = require("./tourModel");

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Review can not be empty.."]
    },
    rating: {
      type: Number,
      min: [1, "Rating must be above 1"],
      max: [5, "Rating must be below 5"]
    },
    cratedAt: {
      type: Date,
      default: Date.now
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
      required: [true, "Review must belong to a tour"]
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user"]
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name photo"
  }).populate({
    path: "tour",
    select: "name"
  });

  next();
});

// CALCULATING RATINGS AVERAGE =========================================================
// static method
// calculating ratings average (takes tour id)
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  // console.log(tourId);

  const stats = await this.aggregate([
    {
      $match: { tour: tourId } // match tour id
    },
    {
      $group: {
        _id: "$tour", // group reviews by tour id
        nRating: { $sum: 1 }, // 1 for each review doc that match in the previous step
        avgRating: { $avg: "$rating" } // calc avg for rating fields of reviews
      }
    }
  ]);
  // console.log(stats);

  // update tour model and set ratingsAverage statistics
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    });
  }
};

reviewSchema.post("save", function () {
  // this points to current review

  // Review.calcAverageRatings(this.tour);
  // because Review doesn't exist yet
  this.constructor.calcAverageRatings(this.tour);
});

// calculate average when update or delete review
// findByIdAndUpdate findByIdAndDelete - we have no document middleware, only query middleware
// findByIdAndUpdate findByIdAndDelete - findOneAnd.. under the hood
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.rev = await this.findOne();
  console.log(this.rev);
  next();
});
// passed rev from pre middleware to post
reviewSchema.post(/^findOneAnd/, async function () {
  // this.rev = await this.findOne(); does NOT work here, query has already executed
  await this.rev.constructor.calcAverageRatings(this.rev.tour);
});

// EXPORT Review model =============================================
const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
