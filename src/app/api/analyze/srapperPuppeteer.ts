import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function scrapeWebsiteDetails(url) {
    let browser = null;
    try {
        console.log('CHROME_BIN:', process.env.CHROME_BIN);
        // Launch browser with minimal sandboxing
        browser = await puppeteer.launch({
            executablePath: process.env.CHROME_BIN,
            args: ['--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--single-process', // <- this one doesn't work on Windows
                '--disable-gpu']
        });
        const page = await browser.newPage();

        // Timeout settings can be adjusted for better performance
        page.setDefaultNavigationTimeout(60000); // 60 seconds

        await page.goto(url, { waitUntil: 'networkidle2' });

        const data = await page.evaluate(() => {
            const getComputedStyleProperty = (selector, prop) => {
                const element = document.querySelector(selector);
                return element ? getComputedStyle(element)[prop] : null;
            };

            const getMetadata = (name) => {
                const element = document.querySelector(`meta[name="${name}"]`);
                return element ? element.content : null;
            };

            return {
                title: document.title,
                description: getMetadata("description"),
                keywords: getMetadata("keywords"),
                primaryColor: getComputedStyleProperty("body", "backgroundColor"),
                secondaryColor: getComputedStyleProperty("body", "color"),
                fontDetails: {
                    fontFamily: getComputedStyleProperty("body", "fontFamily"),
                    fontSize: getComputedStyleProperty("body", "fontSize"),
                    lineHeight: getComputedStyleProperty("body", "lineHeight")
                },
                headerText: Array.from(document.querySelectorAll("h1, h2, h3")).map(el => el.textContent.trim()),
                links: Array.from(document.querySelectorAll("a")).map(el => ({ href: el.href, text: el.textContent.trim() })),
                images: Array.from(document.querySelectorAll("img")).map(img => img.src),
                mainContentText: document.querySelector("main") ? document.querySelector("main").textContent.trim() : ""
            };
        });

        console.log("Extracted Data: ", data);
        return data;
    } catch (error) {
        console.error("Failed to scrape the website:", error);
        NextResponse.json({ error: `Failed to scrape the website. Please check the logs., ${error}` });
        return { error: `Failed to scrape the website. Please check the logs., ${error}` };

    } finally {
        if (browser) {
            await browser.close();
        }
    }
}