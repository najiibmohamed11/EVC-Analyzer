import z from "zod";

export const transactionSchema=z.array(z.object({
      id: z.number(),
      date: z.string(), // YYYY-MM-DD HH:MM:SS
      type:z.enum(["bank","p2p","merchant" , "API", "internal purchase", "unknown"]),
      otherParty: z.string(),                // correct
      credit: z.number(),
      debit: z.number(),
      balance: z.number(),
      description: z.string(),
}))

export type transactionSchemaType=z.infer<typeof transactionSchema>