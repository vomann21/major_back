const axios = require("axios");
const cheerio = require("cheerio");

const getTotalPages = async () => {
    try {
        const response = await axios.get('https://www.amazon.com/s?crid=36QNR0DBY6M7J&k=shelves&ref=glow_cls&refresh=1&sprefix=s%2Caps%2C309', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
            }
        });
        const html = response.data;
        const $ = cheerio.load(html);

        // Find the pagination element (customize this selector based on Amazon's HTML structure)
        const paginationElement = $('div.a-section.a-spacing-none.a-spacing-top-small span.s-pagination-next').prev();
        
        // Extract the total number of pages
        const totalPages = parseInt(paginationElement.text());

        return totalPages;
    } catch (error) {
        throw error;
    }
};

getTotalPages()
    .then((totalPages) => {
        console.log(`Total pages: ${totalPages}`);
    })
    .catch((error) => {
        console.error(error);
    });
