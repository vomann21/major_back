
const axios = require("axios");
const cheerio = require("cheerio");
const fs = require('fs');
const json2csv = require('json2csv').parse;
const type = 'phones';

let amazon_laps = [];
let pages = 0;
const scrapeLaptopData = async (url) => {
    try {
        const baseurl = 'https://www.amazon.in';
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
            }
        });

        const html = response.data;
        const $ = cheerio.load(html);
        const products = $('.puis-card-container.s-card-container.s-overflow-hidden.aok-relative.puis-include-content-margin.puis.puis-v3d0njin9z0tif29djsumm30d93.s-latency-cf-section.puis-card-border'); // Adjust selector based on Flipkart's HTML structure
        platform = 'Amazon';
        // a-size-medium a-color-base a-text-normal
        products.each((index, product) => {
            const tit = $(product).find('.a-size-mini.s-line-clamp-1').text();
            const b = tit.split(' ');
            const words = tit.split(' ').slice(0, 4);
            // Join the first 4 words to form title2
            const title = words.join(' ');
            const brand = b[0];
            const remainingWords = $(product).find('.a-size-base-plus.a-color-base.a-text-normal').text();
            const product_link = `https://www.amazon.in` + $(product).find('.a-link-normal.s-underline-text.s-underline-link-text.s-link-style.a-text-normal').attr('href');
            const description= remainingWords;
            const price = $(product).find('.a-price-whole').text(); // Assuming rating is available
            const image = $(product).find('.s-image').attr('src');
            let element = {
                title,
                image,
                price,
                description,
                brand,
                platform,
                type,
                product_link,
            };

            // Push the element to the flipkart_laps array
            amazon_laps.push(element);
        });
        
        if ($('.s-pagination-item.s-pagination-next.s-pagination-button.s-pagination-separator').length > 0 && pages<40) {
            const next_page = baseurl + $(".s-pagination-item.s-pagination-next.s-pagination-button.s-pagination-separator").attr("href");
            pages++;
            return scrapeLaptopData(next_page); // Return the promise
        }

        return amazon_laps; // Resolve the promise with the collected data
    } catch (err) {
        console.log(err);
        throw err; // Reject the promise if there's an error
    }
}

// const startUrl = 'https://www.amazon.in/s?k=phones&crid=2W72KX37PBXF&sprefix=%2Caps%2C311&ref=nb_sb_ss_recent_1_0_recent';
const startUrl = `https://www.amazon.in/s?k=watch+for+kids&crid=H618F9S83O71&sprefix=watch+for+kids%2Caps%2C216&ref=nb_sb_noss_1`

// Call the function and wait for the data to be collected
scrapeLaptopData(startUrl)
    .then((data) => {
        console.log(data.length);
        const fields = ['title','image','price','description','brand', 'platform', 'type','product_link'];
        const csv = json2csv(data, { fields });

        fs.writeFile('amaz_kids_watches_demo.csv', csv, (err) => {
            if (err) throw err;
            console.log("CSV file is saved");
        });
    })
    .catch((err) => {
        console.error(err);
    });