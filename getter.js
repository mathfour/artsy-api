// bmc: Created by Bon Crowder, June 2017
// bmc: all of my comments are marked with my initials, "bmc"
// bmc: questions? give me a call at 713-557-8048

// bmc: ***********************************************
// bmc: Dependencies
// bmc: ***********************************************
const express = require("express");
const path = require("path");
const fs = require('fs');
const axios = require('axios');
const colors = require("colors");
const request = require('request');
const rpn = require('request-promise-native');
const cheerio = require('cheerio');

const PORT = process.env.PORT || 3000;
const app = express();
const instance = axios.create({
    baseURL: 'https://api.artsy.net/api',
    headers: {
        'X-XAPP-Token': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlcyI6IiIsImV4cCI6MTUwMDkyNjg1MSwiaWF0IjoxNTAwMzIyMDUxLCJhdWQiOiI1OTQyZTFiNDhiM2I4MTA5ZmJmODZjMjQiLCJpc3MiOiJHcmF2aXR5IiwianRpIjoiNTk2ZDE5MDNhMDlhNjc1Zjk4ZTg4ZmUyIn0.zESJuM031xLx3HgV_RhPQWQNDnl4nw_TMeyIoOW8530',
        'Accept': 'application/vnd.artsy-v2+json'
    }
});

// bmc: ***********************************************
// bmc: ************ user can change these ************
// bmc: ***********************************************

let fileMoniker = 'artists'; // bmc: the file to be written
let urlFocus = '/artists'; // bmc: suffix on the baseURL above that will be called

let maxRecordsAtATime = 10; // bmc: each page will have this many records
let maxChunksAtATime = 1; // bmc: each call will do this many pages
let offSetForThisBatch = 0; // bmc: if we want to offset todo
let fileType = 'csv'; // bmc: file extension/type to save to
let useThisFileName;
let stopAfter = (maxChunksAtATime * maxRecordsAtATime) + maxRecordsAtATime;

// bmc: ***********************************************
// bmc: ***********************************************
// bmc: ***********************************************

// bmc: file name that gives all the info, BUT it still needs the correct extension
// bmc: this might be better somewhere else in a smaller scope. Maybe. todo
let batchTitle = fileMoniker + '_Records' + maxRecordsAtATime + '_Chunks' + maxChunksAtATime + '_Offset' + offSetForThisBatch;

// bmc: url to get the number of records
let getCountUrl = urlFocus + "?total_count=1";

// bmc: gets the count, creates the file and then comes back to cycle through and save the records as a file

async function makeItSo() {
    console.log('************ Started *****************'.blue);
    console.log('*********** Started *****************'.blue);
    console.log('************ Started *****************'.blue);

    const artistCount = await getArtistCount(getCountUrl);
    console.log('the artistCount is', artistCount);
    await createFile(artistCount);

    console.log('file created');
    await loopByBatch(stopAfter);
    console.log('done');

}

async function loopByBatch(stopAfter) {
  
        console.log('stopAfter is', stopAfter);
        for (let i = 0; i < stopAfter; i += maxRecordsAtATime) {
            // bmc: this lets us get a few small chunks starting at the requested offset from the above user adjustable variables
            let offsetAmount = offSetForThisBatch + i;
            let urlFocusOffset = urlFocus + "?offset=" + offsetAmount + '&size=' + maxRecordsAtATime;
            // console.log('urlFocusOffset (the url that is being accessed) is', urlFocusOffset);
            await saveChunkOfArtists(i, urlFocusOffset)
        }
}

async function getArtistCount(url) {
    console.log('url is', url);
    console.log('inside getArtistCount');
    let theGoods = await instance.get(url);
    let totalRecordCount = JSON.stringify(theGoods.data.total_count);
    console.log('*****************************');
    console.log('*****************************');
    console.log('*****************************');
    console.log('totalRecordCount is', totalRecordCount);
    console.log('*****************************');
    console.log('*****************************');
    console.log('*****************************');
    return totalRecordCount;
}

function createFile(totalRecordCount) {
    return new Promise(function (resolve, reject) {
        // bmc: over the long term, these should be connected to the actual outputs so changing one here doesn't screw the pooch for the whole file - todo
        let columnHeaders = 'id, slug, name, sortable_name, gender, created_at, updated_at, nationality, location, hometown, followers \r';

        useThisFileName = batchTitle + '_CurrentTotalCount' + totalRecordCount + '.' + fileType;

        // bmc: saving the column names and creating the file for all the data so we can get it into excel/google sheets
        return fs.writeFile(useThisFileName, columnHeaders, function () {
            console.log(useThisFileName, 'has been created');
            return resolve();
        })
    });
}

async function saveChunkOfArtists(i, urlFocusOffset) {
    let theGoods = await instance.get(urlFocusOffset);
    for (let k = 0; k < maxRecordsAtATime; k++) {
        let save = theGoods.data._embedded.artists[k];
        let {
            id,
            slug,
            name,
            sortable_name,
            gender,
            created_at,
            updated_at,
            nationality,
            location,
            hometown
        } = save;
        // console.log('fetching follower count for', save.slug);

        let urlForKthArtist = 'https://www.artsy.net/artist/' + save.slug;
        let follower_count = await scrapeIt(urlForKthArtist);

        let saveThisOne =
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
            follower_count +
            '\r';

        fs.appendFileSync(useThisFileName, saveThisOne)
            console.log('Follower count for', save.slug, 'has been saved. \r' +
                'Confirmation', i + '-' + getRandomIntInclusive(100, 100000) + '-' + k);
            console.log('Record appended'.magenta);
    }
}

async function scrapeIt(urlForKthArtist) {
    try {
        let htmlString = await rpn(urlForKthArtist);
        let $ = cheerio.load(htmlString);
        let thisArtistsFollowerCount = $('.artist-header-follow-count').data('count');
        if (!thisArtistsFollowerCount) {
            return thisArtistsFollowerCount;
        }
        else {
            return 'follower count not available';
        }
    }
    catch (e) {
        // console.log('error is', e);
        console.log('Error'.yellow, getRandomIntInclusive(10000, 100000));
    }
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
        makeItSo().then(function () {
            console.log('*******************************');
            console.log('Your file', useThisFileName, 'is ready to be opened in a spreadsheet');
            console.log('*******************************');

            process.exit();
        })
    });



// bmc: code from Leon
const convertCursorToCsv = async (cursor, csvString) => {
  for (
    let doc = await cursor.next();
    doc != null;
    doc = await cursor.next()
  ) {
    const csvRow = await convertDocToCsv(doc);
    csvString += csvRow
  }
  return csvString
};