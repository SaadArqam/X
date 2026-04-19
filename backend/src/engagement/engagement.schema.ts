import { z } from "zod";

export const engagementSchema = z.object({
  blogId: z.string().regex(/^\d+$/).transform(Number),
});
