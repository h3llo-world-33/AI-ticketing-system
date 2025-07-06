import { inngest } from "../client";
import { NonRetriableError } from "inngest";
import Ticket, { ITicket } from "../../models/ticket.model";
import User, { IUser } from "../../models/user.model";
import { TicketPriority, TicketStatus, UserRole } from "../../constants/enums";
import analyzeTicket from "../../utils/agent";
import { sendMail } from "../../utils/mailer";


export const onTicketCreated = inngest.createFunction(
  {
    id: "on-ticket-created", retries: 2
  },
  {
    event: "ticket/created"
  },
  async ({ event, step }) => {
    try {
      const { ticketId } = event.data;

      // Fetch ticket from DB
      const ticket = await step.run("fetch-ticket", async () => {
        const ticketObject = await Ticket.findById(ticketId);
        if (!ticketObject) {
          throw new NonRetriableError("Ticket not found");
        }
        return ticketObject;
      });

      await step.run("update-ticket-status", async () => {
        await Ticket.findByIdAndUpdate((ticket as ITicket)._id, {
          status: TicketStatus.TODO,
        })
      });

      const aiResponse = await analyzeTicket(ticket as ITicket);

      const relatedSkills = await step.run("ai-processing", async () => {
        let skills: string[] = [];

        if (aiResponse) {
          await Ticket.findByIdAndUpdate((ticket as ITicket)._id, {
            priority: Object.values(TicketPriority).includes(aiResponse.priority)
              ? aiResponse.priority : TicketPriority.MEDIUM,
            helpfulNotes: aiResponse.helpfulNotes,
            status: TicketStatus.DONE,
            relatedSkills: aiResponse.relatedSkills,
          });

          skills = aiResponse.relatedSkills;
        }
        return skills;
      });

      const moderator = await step.run("assign-moderator", async () => {
        const normalize = (str: string) => str.toLowerCase().replace(/[\s.-]/g, "");

        const normalizedSkills = relatedSkills.map(normalize);

        // Fetch all moderators
        const moderators = await User.find({ role: UserRole.MODERATOR });

        // Try to find a matching moderator
        let matchedModerator = moderators.find(mod => {
          return mod.skills?.some(skill => {
            skill = normalize(skill);
            return normalizedSkills.some(matchedSkill =>
              skill.includes(matchedSkill) || matchedSkill.includes(skill)
            );
          }
          );
        });

        if (!matchedModerator) {
          matchedModerator = await User.findOne({ role: UserRole.ADMIN }) ?? undefined;
        }

        await Ticket.findByIdAndUpdate(ticketId, {
          assignedTo: matchedModerator?._id || null
        });

        return matchedModerator;
      });


      await step.run("send-email-notification", async () => {
        if (moderator) {
          const finalTicket = await Ticket.findById((ticket as ITicket)._id);

          if (finalTicket) {
            await sendMail({
              to: (moderator as IUser).email,
              subject: `Ticket Assigned #TICKET-${finalTicket.ticketNumber}`,
              text: `A new ticket is assigned to you: ${finalTicket.title}`
            });
          }
        }
      });

      return { success: true };

    } catch (error) {
      console.error("Error processing created ticket:", error);
      return { success: false };
    }
  }
)
