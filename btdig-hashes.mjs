import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs-extra';

const RSS_FEED_URL = 'https://btdig.com/rss.xml';
const HASHES_FILE = 'hashes.json';

async function scrapeHashes() {
    try {
        console.log("📡 Fetching RSS feed...");
        const { data } = await axios.get(RSS_FEED_URL);
        const $ = cheerio.load(data, { xmlMode: true });

        // Load existing hashes
        let hashes = fs.existsSync(HASHES_FILE) ? fs.readJsonSync(HASHES_FILE) : [];

        let newHashes = [];
        for (const element of $('item').toArray()) {
            const link = $(element).find('link').text().trim();
            const hash = link.split('/').pop(); // Extract hash

            if (!hashes.includes(hash)) {
                newHashes.push(hash);
            }
        }

        if (newHashes.length > 0) {
            console.log(`✅ Found ${newHashes.length} new hashes.`);
            hashes.push(...newHashes); // Append new hashes to bottom
            fs.writeJsonSync(HASHES_FILE, hashes, { spaces: 2 });
        } else {
            console.log("⚠️ No new hashes found.");
        }
    } catch (error) {
        console.error("❌ Error fetching RSS feed:", error);
        process.exit(1);
    }
}

scrapeHashes();
