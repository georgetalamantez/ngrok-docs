import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs-extra';

const TORRENTS_FILE = 'torrents.json';
const DOWNLOADED_FILE = 'downloaded.json';

async function extractTorrents() {
    try {
        console.log("Fetching RSS feed...");
        const { data } = await axios.get('https://torrentgalaxy.to/rss.php');

        const $ = cheerio.load(data, { xmlMode: true });
        let torrents = [];

        // Load previously downloaded torrents
        let downloaded = [];
        if (fs.existsSync(DOWNLOADED_FILE)) {
            downloaded = fs.readJsonSync(DOWNLOADED_FILE);
        }

        $('item').each((_, element) => {
            const url = $(element).find('link').text().trim();
            const title = $(element).find('title').text().trim();

            if (url.includes("watercache.nanobytes.org/get/") && title) {
                const safeFilename = title.replace(/[^a-zA-Z0-9._-]/g, '_') + ".torrent";

                // Only add if NOT already downloaded
                if (!downloaded.includes(safeFilename)) {
                    torrents.push({ url, filename: safeFilename });
                }
            }
        });

        if (torrents.length > 0) {
            fs.writeJsonSync(TORRENTS_FILE, torrents, { spaces: 2 });
            console.log(`✅ Found ${torrents.length} new torrents.`);
        } else {
            console.log("⚠️ No new torrents to download.");
            fs.writeJsonSync(TORRENTS_FILE, []);
        }
    } catch (error) {
        console.error("❌ Error extracting torrents:", error);
        process.exit(1);
    }
}

extractTorrents();
