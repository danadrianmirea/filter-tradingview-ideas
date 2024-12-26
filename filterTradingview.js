// ==UserScript==
// @name         Remove Old and Unpopular TradingView Posts
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Removes TradingView posts older than a specified number of days, and posts by users that don't have enough followers
// @author       Dan Adrian Mirea
// @match        https://www.tradingview.com/symbols/*/ideas/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/danadrianmirea/filter-tradingview-ideas/main/filterTradingview.js
// @downloadURL  https://raw.githubusercontent.com/danadrianmirea/filter-tradingview-ideas/main/filterTradingview.js
// ==/UserScript==

(function () {
    'use strict';

    // Customize the number of days and follower threshold
    const DAYS_THRESHOLD = 1; // Change this value as needed
    const FOLLOWER_THRESHOLD = 1000; // Follower count threshold

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
            const userElement = post.querySelector("address.card-author-wrap-BhFUdJAZ a"); // Extract user element

            if (timeElement && userElement) {
                const postDate = parsePostDate(timeElement.getAttribute("datetime"));
                const ageInDays = (new Date() - postDate) / 86400000; // Milliseconds to days

                const username = userElement.getAttribute("data-username"); // Extract username

                // Check if the post is old enough
                if (isNaN(ageInDays) || ageInDays > DAYS_THRESHOLD) {
                    post.style.display = "none"; // Hide the post
                    post.setAttribute("data-processed", "true"); // Mark post as processed
                    return;
                }

                // Trigger the hover event programmatically
                triggerHover(userElement, post);

                // Mark post as processed after setting up event listener
                post.setAttribute("data-processed", "true");
            }
        });
    }

    // Function to trigger the hover event programmatically
    function triggerHover(userElement, post) {
        // Simulate the mouseenter event
        const mouseEnterEvent = new MouseEvent('mouseenter', {
            bubbles: true,
            cancelable: true,
            view: window
        });

        userElement.dispatchEvent(mouseEnterEvent);

        // Use MutationObserver or a manual interval to check if the popup appears
        const observer = new MutationObserver(() => {
            const previewPopup = document.querySelector('.userLinkPopupRenderContainer-LenvUHTA');
            if (previewPopup) {
                const followerIcon = previewPopup.querySelector('span[title="Followers"]');
                if (followerIcon) {
                    // Get the next span element that contains the follower count
                    const followerCountElement = followerIcon.nextElementSibling;
                    if (followerCountElement && followerCountElement.classList.contains('statsText-LenvUHTA')) {
                        const followerCount = parseInt(followerCountElement.textContent.trim().replace(/\D/g, ""), 10); // Extract follower count
                        if (followerCount < FOLLOWER_THRESHOLD) {
                            // Hide post if the follower count is too low
                            post.style.display = "none"; // Hide the post
                        }
                    }
                }

                // Remove the previewPopup after processing
                previewPopup.remove();

                // Disconnect the observer once it's done
                observer.disconnect();
            }
        });

        // Observe the body for changes (we'll look for the popup being added to the DOM)
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // Run the script initially and observe DOM changes
    const observer = new MutationObserver(hideOldPosts);
    observer.observe(document.body, { childList: true, subtree: true });
    hideOldPosts();
})();
