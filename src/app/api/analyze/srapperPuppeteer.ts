import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

interface WebsiteDetails {
    title: string;
    description: string | null;
    keywords: string | null;
    primaryColor: string | null;
    secondaryColor: string | null;
    buttonColors: string[];
    fontDetails: {
        fontFamily: string | null;
        fontSize: string | null;
        lineHeight: string | null;
    };
    headerText: string[];
    links: { href: string; text: string }[];
    images: string[];
    mainContentText: string;
    error?: string;
}

export async function scrapeWebsiteDetails(url: string): Promise<WebsiteDetails> {
    let browser = null;
    try {
        browser = await puppeteer.launch({
            executablePath: process.env.CHROME_BIN,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            headless: false
        });
        const page = await browser.newPage();
        const navigationPromise = page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 60000 });

        // Timeout settings can be adjusted for better performance
        page.setDefaultNavigationTimeout(60000); // 60 seconds

        await page.goto(url, { waitUntil: 'networkidle2' });
        await navigationPromise;
        const data = await page.evaluate(() => {
            const getComputedStyleProperty = (selector: string, prop: string) => {
                const element = document.querySelector(selector);
                return element ? getComputedStyle(element)[prop] : null;
            };

            const getMetadata = (name: string) => {
                const element = document.querySelector(`meta[name="${name}"]`);
                return element ? element.content : null;
            };

            // Improved logic for extracting primary and secondary colors
            const backgroundColors = [];
            const textColors = [];
            const buttonColors = [];
            const elements = document.querySelectorAll("*");
            elements.forEach(element => {
                const bgColor = getComputedStyle(element).backgroundColor;
                const textColor = getComputedStyle(element).color;
                if (bgColor && bgColor !== "rgba(0, 0, 0, 0)" && !backgroundColors.includes(bgColor)) {
                    backgroundColors.push(bgColor);
                }
                if (textColor && textColor !== "rgba(0, 0, 0, 0)" && !textColors.includes(textColor)) {
                    textColors.push(textColor);
                }
                // Check if the element is a button
                if (element.tagName.toLowerCase() === "button") {
                    const buttonBgColor = getComputedStyle(element).backgroundColor;
                    if (buttonBgColor && buttonBgColor !== "rgba(0, 0, 0, 0)" && !buttonColors.includes(buttonBgColor)) {
                        buttonColors.push(buttonBgColor);
                    }
                }
            });
            const primaryColor = backgroundColors.length > 0 ? backgroundColors[0] : null;
            const secondaryColor = textColors.length > 0 ? textColors[0] : null;

            return {
                title: document.title,
                description: getMetadata("description"),
                keywords: getMetadata("keywords"),
                primaryColor,
                secondaryColor,
                buttonColors,
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
        return { 
            title: "",
            description: null,
            keywords: null,
            primaryColor: null,
            secondaryColor: null,
            buttonColors: [],
            fontDetails: {
                fontFamily: null,
                fontSize: null,
                lineHeight: null
            },
            headerText: [],
            links: [],
            images: [],
            mainContentText: "",
            error: `Failed to scrape the website. Please check the logs., ${error}`
        };
        
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}
