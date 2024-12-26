// ==UserScript==
// @name         Remove Old and Unpopular TradingView Posts
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Removes TradingView posts older than a specified number of days, and posts by users that don't have enough followers
// @author       Dan Adrian Mirea
// @match        https://www.tradingview.com/symbols/*/ideas/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/danadrianmirea/filter-tradingview-ideas/main/filterTradingview.js
// @downloadURL  https://raw.githubusercontent.com/danadrianmirea/filter-tradingview-ideas/main/filterTradingview.js
// ==/UserScript==

(function () {
    'use strict';

    const DAYS_THRESHOLD = 1;
    const REPUTATION_THRESHOLD = 1000; // TODO: reputation count threshold

    // Function to hide old posts
    function hideOldPosts() {
        const posts = document.querySelectorAll("article");

        posts.forEach(post => {
            // Skip posts that are already processed
            if (post.hasAttribute("data-processed")) return;

            const timeElement = post.querySelector("time[datetime]");
            const userElement = post.querySelector("address.card-author-wrap-BhFUdJAZ a");

            if (timeElement && userElement) {
                const postDate = new Date(timeElement.getAttribute("datetime"));
                const ageInDays = (new Date() - postDate) / 86400000;

                const username = userElement.getAttribute("data-username");

                if (isNaN(ageInDays) || ageInDays > DAYS_THRESHOLD) {
                    post.style.display = "none";
                    post.setAttribute("data-processed", "true");
                    return;
                }
            }
        });
    }



    setInterval(hideOldPosts, 1000);
})();
