import compression from "compression";
import cors from "cors";
import express from "express";
import fileUpload from "express-fileupload";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import hpp from "hpp";
import { createConnection } from "typeorm";
import path from "path";
import morgan from "morgan";
import xss from "xss-clean";

import { serverConfigs } from "./configs";
import { DevStatus, StatusCodes } from "./constants";
import { globalErrorHandler } from "./controllers/errorController";
import {
  authRouter,
  userRouter
  // reviewRouter, tourRouter,
} from "./routes";
// import { logger } from "./services";
import { AppError, requestsLimitMsg, noUrlMsg } from "./utils";
import { User, Auth } from "./models";

class App {
  private static instance: App;
  public readonly app: express.Application = express();

  private constructor() {
    this.app.enable("trust proxy");

    this.app.set("view engine", "pug");
    this.app.set("views", path.join(__dirname, "views"));

    this.app.use(cors());
    // this.app.options('*', cors());
    // this.app.use(express.static(path.join(__dirname, 'public')));
    this.app.use(helmet());

    if (serverConfigs.NODE_ENV === DevStatus.DEV) this.app.use(morgan("dev"));

    this.app.use(
      "/api",
      rateLimit({
        max: serverConfigs.RATELIMIT_MAX,
        windowMs: serverConfigs.RATELIMIT_TIME * 60 * 60 * 1000,
        message: requestsLimitMsg(serverConfigs.RATELIMIT_TIME)
      })
    );

    this.app.use(express.json({ limit: serverConfigs.REQUEST_BODY_MAX }));
    this.app.use(
      express.urlencoded({
        extended: true,
        limit: serverConfigs.REQUEST_BODY_MAX
      })
    );

    this.app.use(mongoSanitize());
    this.app.use(xss());

    this.app.use(
      hpp({
        whitelist: ["duration", "ratingsQuantity", "ratingsAverage", "maxGroupSize", "difficulty", "price"]
      })
    );

    this.app.use(fileUpload());
    this.app.use(compression());
    // this.app.use(logger);

    this.mountRoutes();
    this.setupDB();

    this.app.use(globalErrorHandler);
  }

  static getInstance() {
    this.instance = this.instance || new App();

    return this.instance;
  }

  private async setupDB(): Promise<void> {
    createConnection({
      type: "postgres",
      host: "localhost",
      port: 5432,
      database: process.env.PG_DB,
      username: process.env.PG_NAME,
      password: process.env.PG_PASSWD,
      logging: false,
      synchronize: true,
      entities: [User, Auth]
    })
      .then((_connection) => {
        console.log("DB connected..");
      })
      .catch((error) => console.log(error));
  }

  private mountRoutes(): void {
    // this.app.use('/', viewRouter);
    this.app.use("/api/v1/auth", authRouter);
    // this.app.use("/api/v1/reviews", reviewRouter);
    // this.app.use("/api/v1/tours", tourRouter);
    this.app.use("/api/v1/users", userRouter);
    // this.app.use('/api/v1/bookings', bookingRouter);

    this.app.all("*", (req, _res, next) => {
      next(new AppError(noUrlMsg(req.originalUrl), StatusCodes.NOT_FOUND));
    });
  }
}

export default App.getInstance().app;
