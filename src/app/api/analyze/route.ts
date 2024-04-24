import { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";
import { scrapeWebsiteDetails } from "./srapperPuppeteer";

export async function POST(req: NextApiRequest , res: NextApiResponse | any) {
  const jsonReq = await req.json();
  const url = jsonReq.url;
  console.log({ url });
 
  if (!url) {
    return  NextResponse.json({ message: "url is required", status: 400 })
    console.log({ url })
  }
  try {
    const data = await scrapeWebsiteDetails(url);

    return  NextResponse.json({ data , status: 200 });

  } catch (error) {
    console.error('Failed to analyze page:', error);
    // res.status(500).json({ error: 'Failed to process the page' });
    return  NextResponse.json({ error: 'Failed to process the page', status: 500 });

  }
}