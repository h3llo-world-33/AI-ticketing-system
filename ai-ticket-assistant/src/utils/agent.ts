import { createAgent, gemini } from "@inngest/agent-kit";
import { ITicket } from "../models/ticket.model";
import { TicketPriority } from "../constants/enums";

interface TicketAnalysis {
  summary: string;
  priority: TicketPriority;
  helpfulNotes: string;
  relatedSkills: string[];
}


const analyzeTicket = async (ticket: ITicket): Promise<TicketAnalysis | null> => {
  const supportAgent = createAgent({
    name: "AI Ticketing Assistant",
    model: gemini({
      model: "gemini-1.5-flash-8b",
      apiKey: process.env.GEMINI_API_KEY,
    }),
    system: `You are an expert AI assistant that processes technical support tickets.

Your job is to:
1. Summarize the issue.
2. Estimate its priority.
3. Provide helpful notes and resource links for human moderators.
4. List relevant technical skills required.

IMPORTANT:
- Respond with *only* valid raw JSON.
- Do NOT include markdown, code fences, comments, or any extra formatting.
- The format must be a raw JSON object.

Repeat: Do not wrap your output in markdown or code fences.`,
  });

  try {
    const response = await supportAgent.run(`You are a ticket triage agent. Only return a strict JSON object with no extra text, headers, or markdown.

Analyze the following support ticket and provide a JSON object with:

- summary: A short 1-2 sentence summary of the issue.
- priority: One of "Low", "Medium", "High" or "Critical".
- helpfulNotes: A detailed technical explanation that a moderator can use to understand and solve this issue. Include useful external links or resources if possible.
- relatedSkills: An array of relevant skills required to solve the issue (e.g., ["React", "MongoDB"]).

Respond ONLY in this JSON format and do not include any other text or markdown in the answer:

{
"summary": "Short summary of the ticket",
"priority": "High",
"helpfulNotes": "Here are useful tips...",
"relatedSkills": ["React", "Node.js"]
}

---

Ticket information:

- Ticket No.: ${ticket.ticketNumber}
- Title: ${ticket.title}
- Description: ${ticket.description}`);

    // console.log("AI raw response:", response);

    const outputItem = response?.output?.[0];
    const raw = outputItem && 'content' in outputItem ? outputItem.content : undefined;

    if (!raw || typeof raw !== "string") {
      throw new Error("AI did not return valid string output.");
    }

    try {
      const match = raw.match(/```json\s*([\s\S]*?)\s*```/i);
      const jsonString = match ? match[1] : raw.trim();
      const parsed = JSON.parse(jsonString);

      // Optional: validate parsed structure
      if (
        !parsed.summary ||
        !parsed.priority ||
        !parsed.helpfulNotes ||
        !Array.isArray(parsed.relatedSkills)
      ) {
        throw new Error("Missing required fields in AI response.");
      }

      return parsed;

    } catch (err: any) {
      console.log("Failed to parse JSON from AI response" + err.message);
      return null; // watch out for this
    }

  } catch (err: any) {
    console.error("Error calling AI service:", err.message);
    return null;
  }
}


export default analyzeTicket;
