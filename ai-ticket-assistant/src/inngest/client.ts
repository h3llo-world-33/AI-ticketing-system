import { Inngest } from "inngest";

// Initialize the Inngest client
export const inngest = new Inngest({
  id: "ticketing-system",
});

// Export the client for use in other files
export default inngest;
