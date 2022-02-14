/* eslint-disable prefer-arrow-callback */
const mongoose = require("mongoose");
const slugify = require("slugify");
// const User = require('./userModel');
// const validator = require('validator');
// create db schema
const tourSchema = new mongoose.Schema(
  // schema definition object:
  {
    // name: String,
    // rating: Number,
    // price: Number,
    name: {
      type: String,
      // required: true,
      required: [true, "A tour must have a name"],
      unique: true,
      trim: true,
      maxlength: [40, "A tour name must have less or equal 40 characters"],
      minlength: [10, "A tour name must have more or equal 10 characters"]
      // validate: [validator.isAlpha, 'Tour name must only contain character without spaces'], // npm validator
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, "A tour must have a duration"]
    },
    maxGroupSize: {
      type: Number,
      required: [true, "A tour must have a group size"]
    },
    difficulty: {
      type: String,
      required: [true, "A tour must have a difficulty"],
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "Difficulty is either: easy, medium, difficult"
      }
    },
    ratingsAverage: {
      // calculated each time that a new review is added/updated
      type: Number,
      default: 4.5,
      min: [1, "Rating must be above 1"],
      max: [5, "Rating must be below 5"],
      set: (val) => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
      // calculated each time that a new review is added/updated
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, "A tour must have a price"]
    },
    priceDiscount: {
      type: Number,
      // custom validator
      validate: {
        validator: function (val) {
          // run ONLY when create a NEW doc, not PATCH
          // this only points to current doc on new doc creation
          return val < this.price;
        },
        message: "Discount price ({VALUE}) must be below regular price"
      }
    },
    summary: {
      type: String,
      trim: true,
      required: [true, "A tour must have a description"]
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, "A tour must have a cover image"]
    },
    // array of stings
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false // excluding field from response
    },
    // array of dates
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: "Point",
        enum: ["Point"]
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"]
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    // guides: Array,
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User"
      }
    ]
  },
  // schema options object
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// 1 - ascending sorting, -1 - descending sorting
// tourSchema.index({ price: 1 });
tourSchema.index({ price: 1, ratingsAverage: -1 }); // NEEDS TO CHECK
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: "2dsphere" }); // used for getToursWithin and getDistances

// virtual props
// callback should be a regular (not arrow) function
tourSchema.virtual("durationWeeks").get(function () {
  // calculate duration in weeks
  return (this.duration / 7).toFixed(1);
});

// virtual populate
tourSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "tour",
  localField: "_id"
});

// DOCUMENT MIDDLEWARE
// pre (callback runs before doc is saved into db .save() and .create())
tourSchema.pre("save", function (next) {
  // console.log(this);
  this.slug = slugify(this.name, { lower: true });
  next();
});

// performs embedding
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

/*
tourSchema.pre('save', function (next) {
  console.log('Will save document...');
  next();
});

// post (runs after pre-middleware is compleeted)
tourSchema.post('save', function (doc, next) {
  console.log(doc);
  next();
});
*/

// QUERY MIDDLEWARE
// tourSchema.pre('find', function (next) {
// find, findOne, etc..
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();

  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: "guides",
    select: "-__v -passwordChangedAt"
  });

  next();
});

// tourSchema.post(/^find/, function (docs, next) {
//   // console.log(docs);
//   console.log(`Query took ${Date.now() - this.start} ms.`);

//   next();
// });

// AGGREGATION MIDDLEWARE
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   console.log(this.pipeline());
//   next();
// });
// create db model
module.exports = mongoose.model("Tour", tourSchema);
