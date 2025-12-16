import { transactionSchemaType } from "@/app/schema/transactions";
import { NextRequest, NextResponse } from "next/server";
import pdf from "pdf-parse";
import { groq } from "@ai-sdk/groq";
import { generateObject } from "ai";
import z from "zod";

export const POST = async (request: NextRequest) => {
  const form = await request.formData();
  const pdfFile = form.get("pdf-file") as File;

  if (!pdfFile) {
    return NextResponse.json({ success: false, error: "No PDF provided" });
  }

  try {
    const binary = Buffer.from(await pdfFile.arrayBuffer());
    const loader = await pdf(binary);
    const stracturedPdfTxt = parseTransactionsWithRegex(loader.text);
    if (
      stracturedPdfTxt.results.length === 0 &&
      stracturedPdfTxt.arangedMetaData.name
    ) {
      const stracturedTransactions = await parseTransactionsWithAi(loader.text);
      return NextResponse.json({
        success: true,
        data: {
          results: stracturedTransactions,
          arangedMetaData: stracturedPdfTxt.arangedMetaData,
        },
        error: "",
        details: "",
      });
    }

    return NextResponse.json({
      success: true,
      data: stracturedPdfTxt,
      error: "",
      details: "",
    });
  } catch (e) {
    console.error("PDF parsing error:", e);
    return NextResponse.json({
      success: false,
      error: "Parsing failed",
      details: e instanceof Error ? e.message : "Unknown error",
    });
  }
};

function parseTransactionsWithRegex(text: string) {
  const blocks = text.split("TRANSACTION").slice(1);
  const results: transactionSchemaType = [];
  const metaData = text.split("TRANSACTION")[0];

  const regex =
    /(\d{11,})\s+(\d{4}-\d{2}-)\s+(\d{2})\s+(\d{2}:\d{2}:\d{2})\s+([\s\S]+?)\$([\d.]+)\$([\d.]+)\$([\d.]+)([\s\S]*?)(?=\n\s*\d{11,}\s+\d{4}-\d{2}-|\n\s*Total:|This is an automatically generated report\.|$)/g;
  const regexForMetaData =
    /Period:\s*(.+)\s*Name\s*(.+)\s*Mobile Number\s*(\d+)\s*Balance\s*([0-9.]+)/;
  const match = metaData.match(regexForMetaData);
  const [, period, name, mobile, balance] = match ?? [];
  const arangedMetaData = { period, name, mobile, balance };
  for (const block of blocks) {
    let match;
    while ((match = regex.exec(block)) !== null) {
      results.push({
        id: Number(match[1]),
        date: `${match[2]}${match[3]} ${match[4]}`, // YYYY-MM-DD HH:MM:SS
        type: getTransactionType(match[5].trim()),
        otherParty: match[5].trim(), // correct
        credit: Number(match[6]),
        debit: Number(match[7]),
        balance: Number(match[8]),
        description: match[9].trim(),
      });
    }
  }

  return { results, arangedMetaData };
}

const getTransactionType = (otherPart: string) => {
  if (otherPart.includes("Bank Acc")) {
    return "bank";
  } else if (/^\d{12}$/.test(otherPart)) {
    return "p2p";
  } else if (/^\d{6}$/.test(otherPart)) {
    return "merchant";
  } else if (otherPart.includes("Card")) {
    return "API";
  } else if (otherPart.includes("Bundle")) {
    return "internal purchase";
  } else {
    return "unknown";
  }
};

const parseTransactionsWithAi = async (text: string) => {
  console.log("ai function runed");
  const blocks = text.split("TRANSACTION").slice(1);

  const results = await generateObject({
    model: groq("openai/gpt-oss-120b"),
    output: "array",
    schema: z.object({
      id: z.number(),
      date: z.string(), // YYYY-MM-DD HH:MM:SS
      type: z.enum([
        "bank",
        "p2p",
        "merchant",
        "API",
        "internal purchase",
        "unknown",
      ]),
      otherParty: z.string(),
      credit: z.number(),
      debit: z.number(),
      balance: z.number(),
      description: z.string(),
    }),
    prompt: `convert this text into stractured schema ${blocks.join("")}`,
  });

  console.log(JSON.stringify(results.object, null, 2));
  console.log(results);
  return results.object;
};
