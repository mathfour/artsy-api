/**
 * Created by SilverDash on 6/12/17.
 */
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
    // timeout: 1000,
    headers: {
        'X-XAPP-Token': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlcyI6IiIsImV4cCI6MTQ5ODU4OTA1MCwiaWF0IjoxNDk3OTg0MjUwLCJhdWQiOiI1OTQyZTFiNDhiM2I4MTA5ZmJmODZjMjQiLCJpc3MiOiJHcmF2aXR5IiwianRpIjoiNTk0OTZjZmExMzliMjE2ZDYwZTBkNTAxIn0.yk2krkVaoBsXT5c7TVA28bR-Vy-N_JQw2uBYmXVTr3I',
        'Accept': 'application/vnd.artsy-v2+json'
    }
});

var appendFileName = 'artists.json';
var urlFocus = '/artists';
var getCountUrl = urlFocus + "?total_count=1";
var maxRecordsAtATime = 10;
var maxChunksAtATime = 5;


getList(getCountUrl, function (count) {
var stopAfter = 77488 - (maxChunksAtATime * maxRecordsAtATime);
    for (var i = 0; i < count - stopAfter; i += maxRecordsAtATime) {

        console.log('counter is at', i);

        console.log('urlFocus is', urlFocus);

        var urlFocusOffset = urlFocus + "?offset=" + i + '?size=' + maxRecordsAtATime;
        console.log('urlFocusOffset is', urlFocusOffset);

        instance.get(urlFocusOffset)
        .then(function (response) {

            var saveThis = JSON.stringify(response.data);

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

                fs.appendFile(appendFileName, saveThis, function () {
                    console.log(appendFileName, 'has been appended');
                })
            }


        }).catch(function (error) {
            console.log(getRandomIntInclusive(10000, 100000), "ERROR ON LOOP:".rainbow, error.code);
        });
    }
})
;

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

function getList(getCountUrlFocus, callback) {
    console.log('getCountUrl inside the getList fn is', getCountUrlFocus);

    instance.get(getCountUrlFocus)
    .then(function (response) {
        var totalRecordCount = JSON.stringify(response.data.total_count);
        console.log('this should be the count:', totalRecordCount);
        var columnHeaders = 'id, slug, name, sortable_name, gender, created_at, updated_at, nationality, location, hometown \r';

        fs.writeFile(appendFileName, columnHeaders, function () {
            console.log(appendFileName, 'has been created');

        callback(totalRecordCount);
        })
    }).catch(function (error) {
        console.log("bummer, you got an error:", error.code);
    });
}