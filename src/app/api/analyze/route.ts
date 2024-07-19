import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";
import { scrapeWebsiteDetails } from "./srapperPuppeteer";

export async function POST(req: NextRequest, res: NextApiResponse | any) {
  const { url } = await req.json();
  // const url = jsonReq.url;
  console.log({ url });

  if (!url) {
    console.log({ url });
    return NextResponse.json({ message: "url is required" });
  }
  try {
    const data = await scrapeWebsiteDetails(url);
    return NextResponse.json({ data, message: "success", status: 200 });
  } catch (error) {
    NextResponse.json({ error: "success", status: 500 });
    console.error("Failed to analyze page:", error);
  }
}
