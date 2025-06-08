import { NonRetriableError } from "inngest";
import User, { IUser } from "../../models/user.model";
import { sendMail } from "../../utils/mailer";
import { inngest } from "../client";


export const onUserSignup = inngest.createFunction(
  {
    id: "on-user-signup", retries: 2
  },
  {
    event: "user/signup"
  },
  async ({ event, step }) => {
    try {
      const { email } = event.data;

      const user = await step.run("get-user-email", async () => {
        const userObject = await User.findOne({ email });
        if (!userObject) {
          throw new NonRetriableError("User doesn't exist in our database")
        }
        return userObject;
      });

      await step.run("send-welcome-email", async () => {
        const subject = `Welcome to the app`;
        const message = `Hi,
        \n\n
        Thanks for signing up. We're glad to have you onboard!
        `
        await sendMail({
          to: (user as IUser).email, subject: subject, text: message
        });
      });

      return { success: true };

    } catch (error: any) {
      console.error("Error running step: ", error.message);
      return { success: false };
    }
  }
)
