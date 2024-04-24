import puppeteer from "puppeteer";

export async function scrapeWebsiteDetails(url: string) {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        executablePath: process.env.CHROME_BIN || '/app/.apt/usr/bin/google_chrome',
        headless: true
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    const data = await page.evaluate(() => {
        const getComputedStyleProperty = (selector: string, prop: string) => {
            const element = document.querySelector(selector);
            return element ? getComputedStyle(element)[prop as any] : null;
        };

        const getMetadata = (name: string) => {
            const element: HTMLMetaElement | null = document.querySelector(`meta[name="${name}"]`);
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

    await browser.close();
    return data;
}

