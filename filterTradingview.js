// ==UserScript==
// @name         Remove Old and Unpopular TradingView Posts
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  Removes TradingView posts older than a specified number of days, and posts by users that don't have enough rating
// @author       Dan Adrian Mirea
// @match        https://www.tradingview.com/symbols/*/ideas/?video=no
// @grant        none
// @updateURL    https://raw.githubusercontent.com/danadrianmirea/filter-tradingview-ideas/main/filterTradingview.js
// @downloadURL  https://raw.githubusercontent.com/danadrianmirea/filter-tradingview-ideas/main/filterTradingview.js
// ==/UserScript==

(function () {
    'use strict';

    // Customize the number of days
    const DAYS_THRESHOLD = 3; // Change this value as needed

    // Helper function to parse the date from the post element
    function parsePostDate(dateString) {
        // TradingView usually displays dates like "2 days ago", "1 month ago", etc.
        const now = new Date();
        const match = dateString.match(/(\d+)\s+(minute|hour|day|week|month|year)s?\s+ago/);

        if (match) {
            const value = parseInt(match[1], 10);
            const unit = match[2];

            switch (unit) {
                case "minute":
                    return new Date(now.getTime() - value * 60000); // 60 * 1000
                case "hour":
                    return new Date(now.getTime() - value * 3600000); // 60 * 60 * 1000
                case "day":
                    return new Date(now.getTime() - value * 86400000); // 24 * 60 * 60 * 1000
                case "week":
                    return new Date(now.getTime() - value * 604800000); // 7 * 24 * 60 * 60 * 1000
                case "month":
                    return new Date(now.setMonth(now.getMonth() - value));
                case "year":
                    return new Date(now.setFullYear(now.getFullYear() - value));
            }
        }

        // If the format doesn't match, return now (to avoid false positives)
        return now;
    }

    // Function to remove old posts
    function removeOldPosts() {
        const posts = document.querySelectorAll("div[data-widget-type='idea']");

        posts.forEach(post => {
            const dateElement = post.querySelector(".tv-card-stats__time");

            if (dateElement) {
                const postDate = parsePostDate(dateElement.textContent.trim());
                const ageInDays = (new Date() - postDate) / 86400000; // Milliseconds to days

                if (ageInDays > DAYS_THRESHOLD) {
                    post.remove();
                }
            }
        });
    }

    // Run the script initially and observe DOM changes
    const observer = new MutationObserver(removeOldPosts);

    observer.observe(document.body, { childList: true, subtree: true });
    removeOldPosts();
})();
