import z from "zod";

export const transactionSchema=z.array(z.object({
      id: z.number(),
      date: z.string(), // YYYY-MM-DD HH:MM:SS
      type:z.enum(["bank","p2p","merchant" , "API", "internal purchase", "unknown"]),
      credit: z.number(),
      debit: z.number(),
      balance: z.number(),
      description: z.string(),
}))

export const metaDataSchema=z.object({
      name:z.string(),
      mobileNumber:z.number(),
      gander:z.string().describe("drive from the  name, it is somali names and muslim names so you can get the gander"),
      balance:z.string()
}).describe("this is meta data and it on first section of the text")

export const promptSchema=z.object({
      metaData:metaDataSchema,
      transactions:z.array(transactionSchema)
})

export type transactionSchemaType=z.infer<typeof transactionSchema>