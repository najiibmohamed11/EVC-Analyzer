import z from "zod";

export const transactionSchema = z.array(
  z.object({
    id: z.number(),
    date: z.string().describe("YYYY-MM-DD HH:MM:SS"), // YYYY-MM-DD HH:MM:SS
    type: z
      .enum(["bank", "p2p", "merchant", "API", "internal purchase", "unknown"])
      .describe(
        "Determine the transaction type based on otherParty text. If it contains 'Bank Acc', classify as bank If it is exactly 12 digits, classify as p2p If it is exactly 6 digits, classify as merchant if it contains 'Card Payments:', classify as API f it contains 'Bundle', classify as internal purchase Otherwise, classify as unknown",
      ),
    otherParty: z.string(),
    credit: z.number(),
    debit: z.number(),
    balance: z.number(),
    description: z
      .string()
      .describe("please try to get full descriptions full info"),
  }),
);

export const metaDataSchema = z
  .object({
    name: z.string(),
    mobileNumber: z.number(),
    gander: z
      .string()
      .describe(
        "drive from the  name, it is somali names and muslim names so you can get the gander",
      ),
    balance: z.string(),
  })
  .describe("this is meta data and it on first section of the text");

export const promptSchema = z.object({
  metaData: metaDataSchema,
  transactions: z.array(transactionSchema),
});

export type transactionSchemaType = z.infer<typeof transactionSchema>;
