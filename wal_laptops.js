const axios = require("axios");
const cheerio = require("cheerio");
const fs = require('fs');
const json2csv = require('json2csv').parse;
const type = 'Phones';

let flipkart_phones = [];
let pages = 0;
const scrapePhoneData = async (url) => {
    try {
        const baseurl = 'https://www.flipkart.com';
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
            }
        });

        const html = response.data;
        const $ = cheerio.load(html);
        const products = $('div._2kHMtA'); // Adjust selector based on Flipkart's HTML structure
        platform = 'Flipkart';

        products.each((index, product) => {
            const title = $(product).find('div._4rR01T').text();
            const b = title.split(' ');
            const brand = b[0];
            const remainingWords = b.slice(1).join(' ');
            const description = $('ul._1xgFaf li').map((index, element) => $(element).text()).get().join(' ');
            const price = $(product).find('div._1_WHN1').text(); // Assuming rating is available
            const image = $(product).find('._396cs4').attr('src');
            let element = {
                title,
                image,
                price,
                description,
                brand,
                platform,
                type,
            };

            // Push the element to the flipkart_laps array
            flipkart_phones.push(element);
        });

        if ($('._1LKTO3').length > 0 && pages<500) {
            const next_page = baseurl + $("._1LKTO3").attr("href");
            pages++;
            return scrapePhoneData(next_page); // Return the promise
        }

        return flipkart_phones; // Resolve the promise with the collected data
    } catch (err) {
        console.log(err);
        throw err; // Reject the promise if there's an error
    }
}

const startUrl = 'https://www.amazon.com/s?k=laptop&crid=2W72KX37PBXF&sprefix=%2Caps%2C311&ref=nb_sb_ss_recent_1_0_recent';

// Call the function and wait for the data to be collected
scrapePhoneData(startUrl)
    .then((data) => {
        console.log(data.length);
        const fields = ['title','image','price', 'description','brand', 'platform', 'type'];
        const csv = json2csv(data, { fields });

        fs.writeFile('flip_phones.csv', csv, (err) => {
            if (err) throw err;
            console.log("CSV file is saved");
        });
    })
    .catch((err) => {
        console.error(err);
    });