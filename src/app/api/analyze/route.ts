import { scrapeWebsiteDetails } from "./srapperPuppeteer";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
      const { url } = req.body;
      if (!url) {
          return res.status(400).json({ error: 'URL parameter is required' });
      }
      
      const data = await scrapeWebsiteDetails(url); // Assuming this function might throw an error
      res.status(200).json(data);
  } catch (error) {
      console.error('Error in /api/analyze:', error);
      res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
