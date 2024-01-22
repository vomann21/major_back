const axios = require("axios");
const cheerio = require("cheerio");
const fs = require('fs');

const fetchLaptops = async () => {
    const laptops = [];
    const platform = 'Amazon';

    try {
        let currentPage = 1;
        let totalPages = 5;

        while (currentPage <= totalPages) {
            const url = `https://www.amazon.com/s?k=hp+laptops&crid=LKVLUS6TMW1W&sprefix=hp+laptops%2Caps%2C616&ref=nb_sb_noss_1&page=${currentPage}`;

            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
                }
            });

            const html = response.data;
            const $ = cheerio.load(html);

            // Updated selector based on the provided CSS selector
            $('div.s-desktop-width-max.s-desktop-content.s-wide-grid-style-t1.s-opposite-dir.s-wide-grid-style.sg-row > div.sg-col-20-of-24.s-matching-dir.sg-col-16-of-20.sg-col.sg-col-8-of-12.sg-col-12-of-16 > div > span.rush-component.s-latency-cf-section > div.s-main-slot.s-result-list.s-search-results.sg-row > div')
                .each((_idx, el) => {
                    const laptop = $(el);
                    const title = laptop.find('span.a-text-normal').text();
                    const image = laptop.find('img.s-image').attr('src');
                    const link = laptop.find('a.a-link-normal.a-text-normal').attr('href');
                    const reviews = laptop.find('span.a-size-base').text();
                    const stars = laptop.find('span.a-icon-alt').text();
                    const price = laptop.find('span.a-offscreen').text();

                    let element = {
                        title,
                        price,
                        stars,
                        reviews,
                        link: `https://amazon.com${link}`,
                        platform,
                    };

                    if (reviews) {
                        element.reviews = reviews;
                    }

                    if (stars) {
                        element.stars = stars;
                    }

                    laptops.push(element);
                });

            console.log(`Page ${currentPage} scraped. Total laptops: ${laptops.length}`);

            // Check if there is a "Next" button to determine if there are more pages
            const nextButton = $('li.a-last').find('a');
            // if (nextButton.length > 0) {
            //     totalPages++; // Increment totalPages when moving to the next page
            // } else {
            //     break; // Exit the loop if there is no "Next" button
            // }
            currentPage++;
        }

        // Add a number to every data element in the laptops array
        laptops.forEach((element, index) => {
            element.number = index + 1;
        });

        // Append data to the existing file or create a new one
        fs.appendFile('amazon_laptops.json', JSON.stringify(laptops, null, 2), (err) => {
            if (err) throw err;
            console.log('File saved');
        });
    } catch (error) {
        throw error;
    }
};

fetchLaptops();
