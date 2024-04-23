import { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";
import { scrapeWebsiteDetails } from "./srapperPuppeteer";

export async function POST(req: NextApiRequest , res: NextApiResponse | any) {
  const jsonReq = await req.json();
  const url = jsonReq.url;
  console.log({ url });
 
  if (!url) {
    return  NextResponse.json({ message: "url is required" })
    console.log({ url })
  }
  try {
    const data = await scrapeWebsiteDetails(url);

    return  NextResponse.json(data);

  } catch (error) {
    console.error('Failed to analyze page:', error);
    // res.status(500).json({ error: 'Failed to process the page' });
  }
}