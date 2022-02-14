import nodemailer from "nodemailer";
import pug from "pug";
import { htmlToText } from "html-to-text";

import { appConfig } from "../configs";
import { EmailSubjects, General, Messages, StatusCodes } from "../constants";
import { UserDoc } from "../models";
import { AppError } from "../utils";

export class Email {
  private user: UserDoc;
  private url: string = "";
  private msg: string = "";
  private from: string = `${General.MAIN_TITLE} <${appConfig.EMAIL_FROM}>`;
  private mainTitle: string = General.MAIN_TITLE;
  private mainUrl: string = appConfig.MAIN_SITE_URL;

  constructor(user: UserDoc) {
    this.user = user;
  }

  private newTransport(): nodemailer.Transporter {
    return nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: appConfig.EMAIL_USERNAME,
        pass: appConfig.EMAIL_PASSWD
      }
    });
  }

  private async send(template: string, subject: string): Promise<void> {
    try {
      const html = pug.renderFile(
        `${__dirname}/../views/email/${template}.pug`,
        {
          mainTitle: this.mainTitle,
          mainUrl: this.mainUrl,
          user: this.user,
          url: this.url,
          msg: this.msg,
          subject
        }
      );

      const mailOptions = {
        from: this.from,
        to: this.user.email,
        subject,
        html,
        text: htmlToText(html)
      };

      await this.newTransport().sendMail(mailOptions);
    } catch (_err) {
      throw new AppError(Messages.EMAIL_FAILED, StatusCodes.INTERNAL);
    }
  }

  async sendWelcome(): Promise<void> {
    await this.send("welcome", EmailSubjects.WELCOME);
  }

  async sendPasswdReset(url: string): Promise<void> {
    this.url = `${this.mainUrl}/${url}`;

    await this.send("passwdReset", EmailSubjects.RESET);
  }

  async sendWelcomeFromRoot(url: string): Promise<void> {
    this.url = `${this.mainUrl}/${url}`;

    await this.send("welcomeFromRoot", EmailSubjects.WELCOME);
  }

  async sendCustomMsg(msg: string = "", url: string = ""): Promise<void> {
    this.url = `${this.mainUrl}/${url}`;
    this.msg = msg;

    await this.send("custom", EmailSubjects.CUSTOM);
  }
}
