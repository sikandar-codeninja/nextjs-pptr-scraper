import puppeteer from 'puppeteer-core';
import chromeLambda from 'chrome-aws-lambda';

export async function scrapeWebsiteDetails(url: string) {
    const browser = await puppeteer.launch({
        args: chromeLambda.args,
        executablePath: await chromeLambda.executablePath,
        headless: true
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    // your existing page.evaluate code here

    await browser.close();
    return data;
}
