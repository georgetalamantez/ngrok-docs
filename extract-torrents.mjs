import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs-extra';

async function extractTorrents() {
    try {
        console.log("Fetching RSS feed...");
        const { data } = await axios.get('https://torrentgalaxy.to/rss.php');

        const $ = cheerio.load(data, { xmlMode: true });
        const torrents = [];

        $('item').each((_, element) => {
            const url = $(element).find('link').text().trim();
            const title = $(element).find('title').text().trim();

            if (url.includes("watercache.nanobytes.org/get/") && title) {
                // Ensure safe filenames
                const safeFilename = title.replace(/[^a-zA-Z0-9._-]/g, '_');
                torrents.push({ url, filename: safeFilename });
            }
        });

        if (torrents.length > 0) {
            await fs.writeJson('torrents.json', torrents, { spaces: 2 });
            console.log(`✅ Extracted ${torrents.length} torrents.`);
        } else {
            console.log("⚠️ No torrents found.");
            await fs.writeJson('torrents.json', []);
        }
    } catch (error) {
        console.error("❌ Error extracting torrents:", error);
        process.exit(1);
    }
}

extractTorrents();
