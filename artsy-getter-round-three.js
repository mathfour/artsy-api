/**
 * Created by SilverDash on 6/27/17.
 */
// bmc: ***********************************************
// bmc: Dependencies
// bmc: ***********************************************
const express = require("express");
const path = require("path");
const fs = require('fs');
const axios = require('axios');
const colors = require("colors");
const request = require('request');
const cheerio = require('cheerio');

let PORT = process.env.PORT || 3000;
let app = express();
let instance = axios.create({
    baseURL: 'https://api.artsy.net/api',
    headers: {
        'X-XAPP-Token': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlcyI6IiIsImV4cCI6MTQ5OTExNjUzMSwiaWF0IjoxNDk4NTExNzMxLCJhdWQiOiI1OTQyZTFiNDhiM2I4MTA5ZmJmODZjMjQiLCJpc3MiOiJHcmF2aXR5IiwianRpIjoiNTk1MTc5NzMyNzViMjQyNjEzMDA3YzQ1In0.5PrHjT3dOEV3lGZrV8fDlR4NyMgEKnow5iwzXjd7MA0',
        'Accept': 'application/vnd.artsy-v2+json'
    }
});

// bmc: ***********************************************
// bmc: ************ user can change these ************
// bmc: ***********************************************

const fileMoniker = 'artists'; // bmc: the file to be written
const urlFocus = '/artists'; // bmc: suffix on the baseURL above that will be called
const maxRecordsAtATime = 20; // bmc: each page will have this many records
const maxChunksAtATime = 2; // bmc: each call will do this many pages
const offSetForThisBatch = 0; // bmc: if we want to offset todo
const fileType = 'csv'; // bmc: file extension/type to save to

// bmc: ***********************************************
// bmc: ***********************************************
// bmc: ***********************************************

// bmc: file name that gives all the info, BUT it still needs the correct extension
// bmc: this might be better somewhere else in a smaller scope. Maybe. todo
let batchTitle = fileMoniker + '_Records' + maxRecordsAtATime + '_Chunks' + maxChunksAtATime + '_Offset' + offSetForThisBatch;

// bmc: url to get the number of records
let getCountUrl = urlFocus + "?total_count=1";

function *getAllArtistsAndFollowers() {
    let count = (yield);
    yield(count);
    yield(count);
}

let it = getAllArtistsAndFollowers();
it.next();
countNumberOfArtists();
it.next();
initiateTheFile(count);
it.next();
cycleThroughAndSaveArtistInfo(count);
it.next();
scrapeThisArtistsPageForFollowers(slug);

let itIt = cycleThroughAndSaveArtistInfo(count, useThisFileName);
itIt.next();
scrapeThisArtistsPageForFollowers(slug);
itIt.next();

function countNumberOfArtists() {
    instance.get(getCountUrlFocus)
    .then(function (response) {
        return JSON.stringify(response.data.total_count);
    }).catch(function (error) {
        console.log(getRandomIntInclusive(10000, 100000), "bummer, you got an error:", error.code);
    });
}

function initiateTheFile(count) {
    const columnHeaders = 'id, slug, name, sortable_name, gender, created_at, updated_at, nationality, location, hometown, followers \r';
    let useThisFileName = batchTitle + '_CurrentTotalCount' + count + '.' + fileType;
    fs.writeFile(useThisFileName, columnHeaders, function () {
        console.log(useThisFileName, 'has been created');
    })
}

function *cycleThroughAndSaveArtistInfo(count, filename) {
    let stopAfter = (maxChunksAtATime * maxRecordsAtATime);
    for (let i = 0; i < stopAfter; i += maxRecordsAtATime) {
        let offsetAmount = offSetForThisBatch + i;
        let urlFocusOffset = urlFocus + "?offset=" + offsetAmount + '&size=' + maxRecordsAtATime;

        instance.get(urlFocusOffset)
        .then(function (response) {
            for (let k = 0; k < maxRecordsAtATime; k++) {
                // bmc: these seemed to be reasonable bits of to save
                let save = {
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
                    // follower_count: -1 // bmc: will be scraped in just a sec...
                };
            }
        });
        save.follower_count = yield(save.slug);
    }
}

function scrapeThisArtistsPageForFollowers(slug) {
    let urlForKthArtist = 'https://www.artsy.net/artist/' + slug;
    request(urlForKthArtist, function (err, resp, html) {
        if (!err) {
            let $ = cheerio.load(html);
            return $('.artist-header-follow-count').data('count');
        } else {
            console.log('error or follower count is not avaialble; need to check' +
                    ' more ~bmc');
        }
    });
}

