/* app.js
 *
 * This is our RSS feed reader application. It uses the Google
 * Feed Reader API to grab RSS feeds as JSON object we can make
 * use of. It also uses the Handlebars templating library and
 * jQuery.
 */

function feedReader(news = 0){
    this.news = news;
    this.allFeeds = [
        {
            name: 'Udacity Blog',
            url: 'http://blog.udacity.com/feed'
        }, {
            name: 'CSS Tricks',
            url: 'http://feeds.feedburner.com/CssTricks'
        }, {
            name: 'HTML5 Rocks',
            url: 'http://feeds.feedburner.com/html5rocks'
        }, {
            name: 'Linear Digressions',
            url: 'http://feeds.feedburner.com/udacity-linear-digressions'
        }
    ];
    this.initialFeed = false;
    this.titles = [];
}

feedReader.prototype.loadFeed = function(id, cb){
    var feedUrl = this.allFeeds[id].url,
        feedName = this.allFeeds[id].name,
        self = this;

     $.ajax({
        type: "POST",
        url: 'https://rsstojson.udacity.com/parseFeed',
        data: JSON.stringify({url: feedUrl}),
        contentType:"application/json",
        success: function (result, status){

            var container = $('.feed'),
                title = $('.header-title'),
                entries = result.feed.entries,
                entriesLen = entries.length,
                entryTemplate = Handlebars.compile($('.tpl-entry').html());

            self.initialFeed = true;

            title.html(feedName);   // Set the header text
            self.titles.push(feedName);
            container.empty();      // Empty out all previous entries

            /* Loop through the entries we just loaded via the Google
            * Feed Reader API. We'll then parse that entry against the
            * entryTemplate (created above using Handlebars) and append
            * the resulting HTML to the list of entries on the page.
            */
            entries.forEach(function(entry) {
                container.append(entryTemplate(entry));
            });

            if (cb) {
                cb();
            }
        },
        error: function (result, status, err){
            //run only the callback without attempting to parse result due to error
            if (cb) {
                cb();
            }
        },
        dataType: "json"
     });
}

feedReader.prototype.init = function(){
    this.loadFeed(this.news);
}

feedReader.prototype.menuVisibility = function(){
    $('body').toggleClass('menu-hidden');
}

feedReader.prototype.checkDiference = function(val1, val2){
    if(val1 != val2){
        return true;
    }
}

var feed = new feedReader()
google.setOnLoadCallback(feed.init());

/* All of this functionality is heavily reliant upon the DOM, so we
 * place our code in the $() function to ensure it doesn't execute
 * until the DOM is ready.
 */
$(function() {
    var container = $('.feed'),
        feedList = $('.feed-list'),
        feedItemTemplate = Handlebars.compile($('.tpl-feed-list-item').html()),
        feedId = 0,
        menuIcon = $('.menu-icon-link');

    /* Loop through all of our feeds, assigning an id property to
     * each of the feeds based upon its index within the array.
     * Then parse that feed against the feedItemTemplate (created
     * above using Handlebars) and append it to the list of all
     * available feeds within the menu.
     */
    feed.allFeeds.forEach(function(feed) {
        feed.id = feedId;
        feedList.append(feedItemTemplate(feed));

        feedId++;
    });

    /* When a link in our feedList is clicked on, we want to hide
     * the menu, load the feed, and prevent the default action
     * (following the link) from occurring.
     */
    feedList.on('click', 'a', function(event) {
        event.preventDefault();
        var item = $(this);

        $('body').addClass('menu-hidden');
        loadFeed(item.data('id'));
        return false;
    });

    /* When the menu icon is clicked on, we need to toggle a class
     * on the body to perform the hiding/showing of our menu.
     */
    menuIcon.on('click', function() {
        feed.menuVisibility();
    });
}());
