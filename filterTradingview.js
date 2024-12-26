// ==UserScript==
// @name         Remove Old and Unpopular TradingView Posts
// @namespace    http://tampermonkey.net/
// @version      0.6
// @description  Removes TradingView posts older than a specified number of days, and posts by users that don't have enough rating
// @author       Dan Adrian Mirea
// @match        https://www.tradingview.com/symbols/*/ideas/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/danadrianmirea/filter-tradingview-ideas/main/filterTradingview.js
// @downloadURL  https://raw.githubusercontent.com/danadrianmirea/filter-tradingview-ideas/main/filterTradingview.js
// ==/UserScript==

(function () {
    'use strict';

    // Customize the number of days
    const DAYS_THRESHOLD = 1; // Change this value as needed

    // Helper function to parse the date from the datetime attribute
    function parsePostDate(dateString) {
        return new Date(dateString);
    }

    // Function to hide old posts
    function hideOldPosts() {
        const posts = document.querySelectorAll("article");

        posts.forEach(post => {
            // Skip posts that are already processed
            if (post.hasAttribute("data-processed")) return;

            const timeElement = post.querySelector("time[datetime]");
            if (timeElement) {
                const postDate = parsePostDate(timeElement.getAttribute("datetime"));
                const ageInDays = (new Date() - postDate) / 86400000; // Milliseconds to days

                if (isNaN(ageInDays) || ageInDays > DAYS_THRESHOLD) {
                    post.style.display = "none"; // Hide the post
                }

                // Mark post as processed
                post.setAttribute("data-processed", "true");
            }
        });
    }

    // Run the script initially and observe DOM changes
    const observer = new MutationObserver(hideOldPosts);

    observer.observe(document.body, { childList: true, subtree: true });
    hideOldPosts();
})();
