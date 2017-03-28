/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */


var em = {
    openPrefilled: function () {
        cordova.plugins.email.isAvailable(function(isAvailable){
            alert("Service is not available");
        });
        cordova.plugins.email.open();
    }
    , callback: function () {
        alert('email sent');
    },

    emailFile: function () {
        window.requestFileSystem(window.TEMPORARY, 5 * 1024 * 1024, function (fs) {
            console.log('file system open: ' + fs.name);
            em.createFile(fs.root, "newTempFile.txt", false);
        }, fileStuff.onErrorLoadFs);
    },

    createFile: function (dirEntry, fileName, isAppend) {
        // Creates a new file or returns the file if it already exists.
        dirEntry.getFile(fileName, {create: true, exclusive: false}, function (fileEntry) {

            em.openPrefilled(fileEntry);
        }, fileStuff.onErrorCreateFile);
    }
};

var fileStuff = {
    onErrorLoadFs: function () {
        alert('request file failed');
    },

    onErrorCreateFile: function () {
        alert('create file failed');
    },

    onErrorReadFile: function () {
        alert('read file failed');
    },

    requestFile: function () {
        window.requestFileSystem(window.TEMPORARY, 5 * 1024 * 1024, function (fs) {
            console.log('file system open: ' + fs.name);
            fileStuff.createFile(fs.root, "newTempFile.txt", false);
        }, fileStuff.onErrorLoadFs);
    },

    createFile: function (dirEntry, fileName, isAppend) {
        // Creates a new file or returns the file if it already exists.
        dirEntry.getFile(fileName, {create: true, exclusive: false}, function (fileEntry) {

            fileStuff.writeFile(fileEntry, null, isAppend);
        }, fileStuff.onErrorCreateFile);
    },

    writeFile: function (fileEntry, dataObj) {
        // Create a FileWriter object for our FileEntry (log.txt).
        fileEntry.createWriter(function (fileWriter) {

            fileWriter.onwriteend = function () {
                console.log("Successful file write...");
                fileStuff.readFile(fileEntry);
            };

            fileWriter.onerror = function (e) {
                console.log("Failed file write: " + e.toString());
            };

            // If data object is not passed in,
            // create a new Blob instead.
            if (!dataObj) {
                dataObj = new Blob(['some file data'], {type: 'text/plain'});
            }

            fileWriter.write(dataObj);
        });
    },

    readFile: function (fileEntry) {

        fileEntry.file(function (file) {
            var reader = new FileReader();

            reader.onloadend = function () {
                console.log("Successful file read: " + this.result);
                fileStuff.displayFileData(fileEntry.fullPath + ": " + this.result);

            };

            reader.readAsText(file);

        }, fileStuff.onErrorReadFile);
    },

    displayFileData: function (f) {
        document.body.innerHTML += "<hr/>" + f;
    }

};


var dataLines = document.getElementById("DataGrid").childNodes;

var view = {

    onStartButtonClick: function () {
        console.log("start and stop telemetry collection");
        console.log(dataLines.length + " items in dataLines");

        accOptions = {frequency: 3000};
        accWatchID = navigator.accelerometer.watchAcceleration(acc.onSuccess, acc.onError, accOptions);

        compassOptions = {frequency: 3000};
        compassWatchID = navigator.compass.watchHeading(comp.onSuccess, comp.onError, compassOptions);

    },

    onStopButtonClick: function () {
        console.log("start and stop telemetry collection");
        console.log(dataLines.length + " items in dataLines");

        navigator.accelerometer.clearWatch(accWatchID);
        navigator.compass.clearWatch(compassWatchID);

        for (var i = 0; i < dataLines.length; i++) {
            if (dataLines[i].nodeType === 1) {
                dataLines[i].innerHTML = "Data ...";
                break;
            }
        }
    },

    onSendEmailButtonClick: function () {
        console.log("send email");
        em.openPrefilled();
    },

    onClearHistoryButtonClick: function () {
        console.log("clear history")
        for (var i = 0; i < dataLines.length; i++) {
            if (dataLines[i].nodeType === 1) {
                dataLines[i].innerHTML = "&nbsp;";
            }
        }
    }

};

var app = {
    // Application Constructor
    initialize: function () {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
        document.getElementById("StartButton").addEventListener("click", view.onStartButtonClick.bind(this), false);
        document.getElementById("StopButton").addEventListener("click", view.onStopButtonClick.bind(this), false);
        document.getElementById("SendEmailButton").addEventListener("click", view.onSendEmailButtonClick.bind(this), false);
        document.getElementById("ClearHistoryButton").addEventListener("click", view.onClearHistoryButtonClick.bind(this), false);


    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function () {
        this.receivedEvent('deviceready');
    },

    // Update DOM on a Received Event
    receivedEvent: function (id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
        console.log(navigator.accelerometer);
        //fileStuff.requestFile();

    }


};

app.initialize();

var acc = {
    onSuccess: function (acceleration) {
        var i = dataLines.length - 1;
        var found = false;
        var last, curr;
        for (i; i >= 0; i--) {
            if (dataLines[i].nodeType === 1) {
                if (!found) {
                    found = true;
                    last = dataLines[i].innerHTML;
                    dataLines[i].innerHTML =
                        //"T: " + acceleration.timestamp +
                        "X:" + Math.round(acceleration.x * 100) / 100
                        + " Y:" + Math.round(acceleration.y * 100) / 100
                        + " Z:" + Math.round(acceleration.z * 100) / 100;

                } else {
                    curr = dataLines[i].innerHTML;
                    dataLines[i].innerHTML = last;
                    last = curr;
                }
            }
        }
    },

    onError: function () {
        alert('onError!');
    }
};


var comp = {
    onSuccess: function (heading) {

        var i = dataLines.length - 1;
        var found = false;
        var last, curr;
        for (i; i >= 0; i--) {
            if (dataLines[i].nodeType === 1) {
                dataLines[i].innerHTML += " H:" + Math.round(heading.magneticHeading * 100) / 100;
//                navigator.geolocation.getCurrentPosition(geo.onSuccess, geo.onError);
                break;
            }
        }
    },

    onError: function (compassError) {
        alert('Compass error: ' + compassError.code);
    }

};


// var geo = {
//     onSuccess: function (position) {
//         var i = dataLines.length - 1;
//         var found = false;
//         var last, curr;
//         for (i; i >= 0; i--) {
//             if (dataLines[i].nodeType === 1) {
//                 dataLines[i].innerHTML += " LT:" + Math.round(position.coords.latitude * 1000) / 1000;
//                 dataLines[i].innerHTML += " LN:" + Math.round(position.coords.longitude * 1000) / 1000;
//                 dataLines[i].innerHTML += " SP:" + Math.round(position.coords.speed * 1000) / 1000;
//                 break;
//             }
//         }
//     },
//
//     onError: function (error) {
//         alert('code: ' + error.code + '\n' +
//             'message: ' + error.message + '\n');
//     }
// };

var accOptions;
var accWatchID;
var compassOptions;
var compassWatchID;






