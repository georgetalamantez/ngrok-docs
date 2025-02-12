import fs from 'fs-extra';
import axios from 'axios';
import cheerio from 'cheerio';

async function fetchRSSFeed() {
    try {
        console.log("Fetching RSS feed...");
        const { data } = await axios.get("https://torrentgalaxy.to/rss.php");

        const $ = cheerio.load(data, { xmlMode: true });
        let downloadLinks = [];

        $("item").each((_, element) => {
            const url = $(element).find("link").text().trim();
            const title = $(element).find("title").text().trim();

            if (url.includes("watercache.nanobytes.org/get/") && title) {
                // Ensure filename is safe
                const safeFilename = title.replace(/[^\w\d_-]/g, "_");
                downloadLinks.push({ url, filename: safeFilename });
            }
        });

        if (downloadLinks.length > 0) {
            fs.writeJsonSync("torrents.json", downloadLinks, { spaces: 2 });
            console.log(`✅ Extracted ${downloadLinks.length} torrents.`);
        } else {
            console.log("⚠️ No torrents found.");
            fs.writeJsonSync("torrents.json", []);
        }
    } catch (error) {
        console.error("❌ Error fetching RSS feed:", error);
        process.exit(1);
    }
}

fetchRSSFeed();
