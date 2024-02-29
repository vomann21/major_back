const axios = require("axios");
const cheerio = require("cheerio");
const fs = require('fs');
const json2csv = require('json2csv').parse;
const type = 'laptops';

let amazon_laptop = [];
let pages = 0;

const scrapeLaptopsData = async (url) => {
    try {
        const baseurl = 'https://www.amazon.com';
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
            }
        });

        const html = response.data;
        const $ = cheerio.load(html);
        const products = $('.puis-card-container.s-card-container.s-overflow-hidden.aok-relative.puis-include-content-margin.puis.puis-v3qeihfqrd7o5n2tyeu8t6x124m.s-latency-cf-section.puis-card-border'); // Adjust selector based on amazon's HTML structure
        platform = 'amazon';

        products.each((index, product) => {
            const title = $(product).find(".a-size-medium.a-color-base.a-text-normal").text();
            const b = title.split(' ');
            const brand = b[0];
            const remainingWords = b.slice(1).join(' ');
            const description = remainingWords;
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
            };
            
            // Push the element to the amazon_laps array
            amazon_laptop.push(element);
        });

        if ($('.s-pagination-item.s-pagination-next.s-pagination-button.s-pagination-separator').length > 0 && pages < 1) {
            const next_page = baseurl + $(".s-pagination-item.s-pagination-next.s-pagination-button.s-pagination-separator").attr("href");
            pages++;
            return scrapeLaptopsData(next_page); // Return the promise
        }

        return amazon_laptop; // Resolve the promise with the collected data
    } catch (err) {
        console.log(err);
        throw err; // Reject the promise if there's an error
    }
}

const startUrl = 'https://www.amazon.com/s?k=laptop&crid=2W72KX37PBXF&sprefix=%2Caps%2C311&ref=nb_sb_ss_recent_1_0_recent';

// Call the function and wait for the data to be collected
scrapeLaptopsData(startUrl)
    .then((data) => {
        console.log(data.length);
        const fields = ['title','image','price', 'description','brand', 'platform', 'type'];
        const csv = json2csv(data, { fields });

        fs.writeFile('amaz_laptops.csv', csv, (err) => {
            if (err) throw err;
            console.log("CSV file is saved");
        });
    })
    .catch((err) => {
        console.error(err);
    });