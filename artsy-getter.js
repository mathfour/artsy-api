// bmc: Created by Bon Crowder, June 2017
// bmc: all of my comments are marked with my initials, "bmc"
// bmc: questions? give me a call at 713-557-8048

// bmc: ***********************************************
// bmc: Dependencies
// bmc: ***********************************************
var express = require("express");
var path = require("path");
var fs = require('fs');
var axios = require('axios');
var colors = require("colors");
var request = require('request');
const cheerio = require('cheerio');

var PORT = process.env.PORT || 3000;
var app = express();
var instance = axios.create({
    baseURL: 'https://api.artsy.net/api',
    headers: {
        'X-XAPP-Token': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlcyI6IiIsImV4cCI6MTQ5OTExNjUzMSwiaWF0IjoxNDk4NTExNzMxLCJhdWQiOiI1OTQyZTFiNDhiM2I4MTA5ZmJmODZjMjQiLCJpc3MiOiJHcmF2aXR5IiwianRpIjoiNTk1MTc5NzMyNzViMjQyNjEzMDA3YzQ1In0.5PrHjT3dOEV3lGZrV8fDlR4NyMgEKnow5iwzXjd7MA0',
        'Accept': 'application/vnd.artsy-v2+json'
    }
});

// bmc: ***********************************************
// bmc: ************ user can change these ************
// bmc: ***********************************************

var fileMoniker = 'artists'; // bmc: the file to be written
var urlFocus = '/artists'; // bmc: suffix on the baseURL above that will be called
var maxRecordsAtATime = 20; // bmc: each page will have this many records
var maxChunksAtATime = 2; // bmc: each call will do this many pages
var offSetForThisBatch = 0; // bmc: if we want to offset todo
var fileType = 'csv'; // bmc: file extension/type to save to

// bmc: ***********************************************
// bmc: ***********************************************
// bmc: ***********************************************

// bmc: file name that gives all the info, BUT it still needs the correct extension
// bmc: this might be better somewhere else in a smaller scope. Maybe. todo
var batchTitle = fileMoniker + '_Records' + maxRecordsAtATime + '_Chunks' + maxChunksAtATime + '_Offset' + offSetForThisBatch;

// bmc: url to get the number of records
var getCountUrl = urlFocus + "?total_count=1";

// bmc: gets the count, creates the file and then comes back to cycle through and save the records as a file

getList(getCountUrl, function (count) {
    // bmc: instead of going through all 77K or so records, this lets us go through selected small chunks
    var stopAfter = (maxChunksAtATime * maxRecordsAtATime);
    for (var i = 0; i < stopAfter; i += maxRecordsAtATime) {
        // bmc: this lets us get a few small chunks starting at the requested offset from the above user adjustable variables
        var offsetAmount = offSetForThisBatch + i;
        var urlFocusOffset = urlFocus + "?offset=" + offsetAmount + '&size=' + maxRecordsAtATime;
        console.log('urlFocusOffset (the url that is being accessed) is', urlFocusOffset);

        // bmc: actually getting that data and writing it to a file
        instance.get(urlFocusOffset)
        .then(function (response) {
            console.log('this works ***** this works ***** this works ***** this works'.rainbow); // bmc: for those who need instant gratification

            for (var k = 0; k < maxRecordsAtATime; k++) {
                // bmc: these seemed to be reasonable bits of to save
                var save = {
                    id: response.data._embedded.artists[k].id,
                    slug: response.data._embedded.artists[k].slug,
                    name: response.data._embedded.artists[k].name,
                    sortable_name: response.data._embedded.artists[k].sortable_name,
                    gender: response.data._embedded.artists[k].gender,
                    created_at: response.data._embedded.artists[k].created_at,
                    updated_at: response.data._embedded.artists[k].updated_at,
                    nationality: response.data._embedded.artists[k].nationality,
                    location: response.data._embedded.artists[k].location,
                    hometown: response.data._embedded.artists[k].hometown,
                    follower_count: -1 // bmc: will be scraped in just a sec...
                };

                // bmc: this needs to be a callback, since it's not happening BEFORE the stuff gets saved
                var urlForKthArtist = 'https://www.artsy.net/artist/' + save.slug;
                request(urlForKthArtist, function (err, resp, html) {
                    console.log('urlForKthArtist is', urlForKthArtist);
                    if (!err) {
                        var $ = cheerio.load(html);
                        thisArtistsFollowerCount = $('.artist-header-follow-count').data('count');
                        console.log('thisArtistsFollowerCount is', thisArtistsFollowerCount);

                        save.follower_count = thisArtistsFollowerCount;
                        console.log('save.follower_count is', save.follower_count);
                    } else {
                        console.log('error or follower count is not avaialble; need to check' +
                                ' more ~bmc');
                    }
                });

                var saveThisOne =
                        save.id + ', ' +
                        save.slug + ', ' +
                        save.name + ', ' +
                        save.sortable_name + ', ' +
                        save.gender + ', ' +
                        save.created_at + ', ' +
                        save.updated_at + ', ' +
                        save.nationality + ', ' +
                        save.location + ', ' +
                        save.hometown + ', ' +
                        save.follower_count + '\r';

                // var followerCount;
                // var saveThisOne =
                //         response.data._embedded.artists[k].id + ', ' +
                //         response.data._embedded.artists[k].slug + ', ' +
                //         response.data._embedded.artists[k].name + ', ' +
                //         response.data._embedded.artists[k].sortable_name + ', ' +
                //         response.data._embedded.artists[k].gender + ', ' +
                //         response.data._embedded.artists[k].created_at + ', ' +
                //         response.data._embedded.artists[k].updated_at + ', ' +
                //         response.data._embedded.artists[k].nationality + ', ' +
                //         response.data._embedded.artists[k].location + ', ' +
                //         response.data._embedded.artists[k].hometown + '\r';
                //
                // request('https://www.artsy.net/artist/blinn-jacobs', function (err, resp, html) {
                //     if (!err) {
                //         var $ = cheerio.load(html);
                //         followerCount = $('.artist-header-follow-count').data('count');
                //         console.log(followerCount);
                //     } else {
                //         console.log('error or follower count is not avaialble; need to check' +
                //                 ' more ~bmc');
                //     }
                // });

                // bmc: create the file name using the batchTitle and the proper file extension
                var useThisFileName = batchTitle + '_CurrentTotalCount' + count + '.' + fileType;

                // bmc: and writing the info to the file (woohoo!)
                fs.appendFile(useThisFileName, saveThisOne, function () {
                    console.log('Record has been appended'.magenta); // bmc: again, gratification
                })
            }

        }).catch(function (error) {
            // bmc: just in case we get crap-tons of errors, this helps us see that they are different
            console.log(getRandomIntInclusive(10000, 100000), "ERROR ON LOOP:", error.code);
        });
    }
});

// bmc: getList gets the number of records available for this, then returns the count to the callback function - that function embedded above
function getList(getCountUrlFocus, callback) {
    console.log('inside the getList that gets the count');
    instance.get(getCountUrlFocus)
    .then(function (response) {
        console.log('in the promise');
        var totalRecordCount = JSON.stringify(response.data.total_count);

        // bmc: over the long term, these should be connected to the actual outputs so changing one here doesn't screw the pooch for the whole file - todo
        var columnHeaders = 'id, slug, name, sortable_name, gender, created_at, updated_at, nationality, location, hometown \r';

        var useThisFileName = batchTitle + '_CurrentTotalCount' + totalRecordCount + '.' + fileType;

        // bmc: saving the column names and creating the file for all the data so we can get it into excel/google sheets
        fs.writeFile(useThisFileName, columnHeaders, function () {
            console.log(useThisFileName, 'has been created');

            callback(totalRecordCount);
        })
    }).catch(function (error) {
        console.log(getRandomIntInclusive(10000, 100000), "bummer, you got an error:", error.code);
    });
}

// bmc: number randomizer for identity help
function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// bmc: time to listen...
app.listen(PORT, function () {
    console.log('listening on port', PORT);
});

// bmc: BIG TODO
// bmc: put this inside the loop where I pull all that individual info
// bmc: then put the slug in place of blinn-jacobs
// bmc: then add pleaseLetThisWork value to the end of the csv list of stuff
// bmc: also, add "followers" to the list where I create the initial file
// bmc: *****************************************************
// bmc: ************** GOOD CODE BELOW! *********************
// bmc: *****************************************************
// request('https://www.artsy.net/artist/blinn-jacobs', function (err, resp, html) {
//     if (!err) {
//         var $ = cheerio.load(html);
//         var pleaseLetThisWork = $('.artist-header-follow-count').data('count');
//         console.log(pleaseLetThisWork);
//     }
// });
// bmc: *****************************************************

function getThisArtistsFollowerNumber(slugForArtist) {
    var urlForKthArtist = 'https://www.artsy.net/artist/' + slugForArtist;
    request(urlForKthArtist, function (err, resp, html) {
        console.log('urlForKthArtist is', urlForKthArtist);
        if (!err) {
            var $ = cheerio.load(html);
            thisArtistsFollowerCount = $('.artist-header-follow-count').data('count');
            return thisArtistsFollowerCount;
        } else {
            console.log('error or follower count is not avaialble; need to check' +
                    ' more ~bmc');
        }
    });
}

