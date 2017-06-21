// bmc: Created by Bon Crowder, June 2017
// bmc: all of my comments are marked with my initials, "bmc"
// bmc: questions? give me a call at 713-557-8048

// bmc: ***************************************************
// bmc: Dependencies
// bmc: ***************************************************
var express = require("express");
var path = require("path");
var fs = require('fs');
var axios = require('axios');
var CSV = require('csv-string');
var colors = require("colors");

var PORT = process.env.PORT || 3000;
var app = express();
var instance = axios.create({
    baseURL: 'https://api.artsy.net/api',
    headers: {
        'X-XAPP-Token': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlcyI6IiIsImV4cCI6MTQ5ODU4OTA1MCwiaWF0IjoxNDk3OTg0MjUwLCJhdWQiOiI1OTQyZTFiNDhiM2I4MTA5ZmJmODZjMjQiLCJpc3MiOiJHcmF2aXR5IiwianRpIjoiNTk0OTZjZmExMzliMjE2ZDYwZTBkNTAxIn0.yk2krkVaoBsXT5c7TVA28bR-Vy-N_JQw2uBYmXVTr3I',
        'Accept': 'application/vnd.artsy-v2+json'
    }
});

// bmc: ***************************************************
// bmc: ************** user can change these **************
// bmc: ***************************************************

var fileMoniker = 'artists'; // bmc: the file to be written
var urlFocus = '/artists'; // bmc: suffix on the baseURL above that will be called
var maxRecordsAtATime = 10; // bmc: each page will have this many records
var maxChunksAtATime = 2; // bmc: each call will do this many pages
var offSetForThisBatch = 0; // bmc: if we want to offset todo
var fileType = 'csv'; // bmc: file extension/type to save to

// bmc: ***************************************************
// bmc: ***************************************************
// bmc: ***************************************************

// bmc: file name that gives all the info, BUT it still needs the correct extension
// bmc: this might be better somewhere else in a smaller scope. Maybe. todo
var batchTitle = fileMoniker + '_Records' + maxRecordsAtATime + '_Chuncks' + maxChunksAtATime + '_Offset' + offSetForThisBatch;

// bmc: url to get the number of records
var getCountUrl = urlFocus + "?total_count=1";

// bmc: gets the count, creates the file and then comes back to cycle through and save the records as a file
getList(getCountUrl, function (count) {
    var stopAfter = (maxChunksAtATime * maxRecordsAtATime);
    for (var i = 0; i < stopAfter; i += maxRecordsAtATime) {

        console.log('counter is at', i);

// bmc: there are four instances of "instance.get()" here - 3 are commented out
// bmc: this is for debugging

        // var urlOffset = urlFocus + '?offset=' + i;
        // instance.get(urlOffset)

        // var urlSize = urlFocus + '?size=' + maxRecordsAtATime;
        // instance.get(urlSize)

        // instance.get(urlFocus)
        // bmc: this is for the "plain" call

        var urlFocusOffset = urlFocus + "?offset=" + i + '&size=' + maxRecordsAtATime;
        console.log('urlFocusOffset (the url that is being accessed) is', urlFocusOffset);

        instance.get(urlFocusOffset)
        .then(function (response) {
            console.log('this works ***** this works ***** this works ***** this works'.rainbow);

            for (var k = 0; k < maxRecordsAtATime; k++) {
                var saveThisOne =
                        response.data._embedded.artists[k].id + ', ' +
                        response.data._embedded.artists[k].slug + ', ' +
                        response.data._embedded.artists[k].name + ', ' +
                        response.data._embedded.artists[k].sortable_name + ', ' +
                        response.data._embedded.artists[k].gender + ', ' +
                        response.data._embedded.artists[k].created_at + ', ' +
                        response.data._embedded.artists[k].updated_at + ', ' +
                        response.data._embedded.artists[k].nationality + ', ' +
                        response.data._embedded.artists[k].location + ', ' +
                        response.data._embedded.artists[k].hometown + '\r';

                var useThisFileName = batchTitle + '.' + fileType;
                fs.appendFile(useThisFileName, saveThisOne, function () {
                    console.log('Record has been appended');
                })
            }

        }).catch(function (error) {
            console.log(getRandomIntInclusive(10000, 100000), "ERROR ON LOOP:", JSON.stringify(error.data));
        });
    }
});

// Initiate the listener
app.listen(PORT, function () {
    console.log('listening on port', PORT);
});

// bmc: number randomizer for identity help
function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// bmc: getList gets the number of records available for this, then returns the count to the callback function - that function embedded above
function getList(getCountUrlFocus, callback) {

    instance.get(getCountUrlFocus)
    .then(function (response) {
        var totalRecordCount = JSON.stringify(response.data.total_count);

        // bmc: over the long term, these should be connected to the actual outputs so changing one here doesn't screw the pooch for the whole file - todo
        var columnHeaders = 'id, slug, name, sortable_name, gender, created_at, updated_at, nationality, location, hometown \r';

        var useThisFileName = batchTitle + '_CurrentTotalCount' + totalRecordCount + '.' + fileType;

        fs.writeFile(useThisFileName, columnHeaders, function () {
            console.log(useThisFileName, 'has been created');

            callback(totalRecordCount);
        })
    }).catch(function (error) {
        console.log("bummer, you got an error:", error.code);
    });
}