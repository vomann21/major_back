const axios = require("axios");
const cheerio = require("cheerio");
const fs = require('fs');
const json2csv = require('json2csv').parse;
const type = 'Laptops';

let flipkart_laps = [];
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
        const products = $('.a-section.review.aok-relative'); // Adjust selector based on Flipkart's HTML structure
        platform = 'Amazon';

        
        products.each((index, product) => {  
            const user_name = $(product).find('.a-profile-name').text();
            const small_review = $(product).find('a.a-size-base.a-link-normal.review-title.a-color-base.review-title-content.a-text-bold span.a-letter-space + span').text();
            const rating = $(product).find('.a-icon-alt').text(); 
            const whole_review = $(product).find('.a-size-base.review-text.review-text-content span').text();
            let element = {
                user_name,
                small_review,
                whole_review,
                rating,
            };
            flipkart_laps.push(element);
        });

        if ($('.a-last a').length > 0) {
            const next_page = baseurl + $(".a-last a").attr("href");
            pages++;
            return scrapeLaptopData(next_page); // Return the promise
        }

        return flipkart_laps; // Resolve the promise with the collected data
    } catch (err) {
        console.log(err);
        throw err; // Reject the promise if there's an error
    }
}

const startUrl = 'https://www.amazon.in/HP-Micro-Edge-Graphics-Keyboard-14s-fq1092au/product-reviews/B09R1L73TM/ref=cm_cr_dp_d_show_all_btm?ie=UTF8&reviewerType=all_reviews';

// Call the function and wait for the data to be collected
scrapeLaptopData(startUrl)
    .then((data) => {
        console.log(data.length);
        const fields = ['user_name','small_review','whole_review','rating'];
        const csv = json2csv(data, { fields });

        fs.writeFile('amazon_product_reviews29.csv', csv, (err) => {
            if (err) throw err;
            console.log("CSV file is saved");
        });
    })
    .catch((err) => {
        console.error(err);
    });