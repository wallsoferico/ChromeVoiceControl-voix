(function (window) {
    'use strict';

    var VoiceRecognition = window.webkitSpeechRecognition;

    /**
     * Voix Constructor.
     * @constructor
     * @params {String} lang - A given language.
     * @returns {voix} Returns a new instance of Voix.
     */
    function Voix(lang) {
        this._lang = lang;
		console.log('initializing');
        this.initialize();
    }

    /**
     * Initializes a new instance of Voix.
     * @function
     * @returns {voix} Returns a new instance of Voix.
     */
    Voix.prototype.initialize = function () {

        this._collection = {};
        this._createRecognition();
        this._bindKeyEvents();
		
		this._collection = {
			"open tab": function() { openTab() },
			"open window": function() { openWindow() },
			"open new tab": function () { openTab() },
			"open new window": function() { openWindow() },
			"open incognito window": function () {
				chrome.windows.create({
					"incognito": true
				});
			},
			"open website in new tab": function (value) {
				value = value.replace(/.+ tab /, '');
				openTab(value);
			},
			"open website in new window": function (value) {
				value = value.replace(/.+ window /, '');
				
				if (value.indexOf("http://") < 0) 
					value = "http://" + value;
				
				chrome.windows.create({
					"url": value
				});
			},
			"open tab in new window": function () {
				chrome.windows.getLastFocused(function(w) {
					chrome.tabs.getSelected(w.id, function(t) {
						chrome.windows.create({
							"tabId": t.id
						});
					});
				});
			},
			"open options": function() { openTab("chrome://settings/browser") },
			"open settings": function() { openTab("chrome://settings/browser") },
			"edit settings": function() { openTab("chrome://settings/browser") },
			"open history": function() { openTab("chrome://history/") },
			"delete history": function () {
				chrome.history.deleteAll(function() {});
			},
			"search": function (value) {
				value = value.replace(/search /, '');
				openTab("http://google.com/search?as_q=" + value);
			},
			"manage extension": function() { openTab("chrome://extensions/") },
			"clear browsing data": function () {
				if(confirm("Are you sure you wish to delete your browsing data?")) {
					var d = new Date();
					var removal_start = d.getMilliseconds();
					if (removal_start !== undefined) {
						chrome.browsingData.remove({ "since" : removal_start }, {
							"appcache": true,
							"cache": true,
							"cookies": true,
							"downloads": true,
							"fileSystems": true,
							"formData": true,
							"history": true,
							"indexedDB": true,
							"localStorage": true,
							"serverBoundCertificates": true,
							"pluginData": true,
							"passwords": true,
							"webSQL": true
						});
					}
				}
			},
			"close tab": function() {
				chrome.windows.getLastFocused(function(w) {
					chrome.tabs.getSelected(w.id, function(t) {
						chrome.tabs.remove(t.id);
					});
				});
			},
			"close window": function() {
				chrome.windows.getLastFocused(function(w) {
					chrome.windows.remove(w.id);
				});
			},
			"map of": function (value) {
				console.log(value);
				value = value.replace(/map of|map of /g, '');
				console.log(value);
				value = "http://maps.google.com/maps?q=" + value;
				chrome.tabs.create({
					"url": value
				});
			},
			"directions from": function (value) {
				var f = value.replace(/directions from /, '').replace(/to .+/, '');
				var t = value.replace(/.+ to /, '');
				var url = "http://maps.google.com/?saddr=" + f + "&daddr=" + t;
				chrome.tabs.create({
					"url": url
				});
			},
			"store tab": function () {
				chrome.windows.getLastFocused(function(w) {
					chrome.tabs.getSelected(w.id, function(t) {
						chrome.tabs.update(t.id, {
							"pinned": true
						});
					});
				});
			},
			"remove stored tab": function () {
				chrome.windows.getLastFocused(function(w) {
					chrome.tabs.getSelected(w.id, function(t) {
						chrome.tabs.update(t.id, {
							"pinned": false
						});
					});
				});
			},
			"translate": function (value) {
				value = value.replace(/translate /, '');
				lang = value.replace(/.+ to /, '');
				value = value.replace(/ to .+/, '');
				for (var a = 0; a < array.length; a += 2) {
					if (array[a] == lang) {
						value = "http://translate.google.com/#auto|" + array[a + 1] + "|" + value;
						chrome.tabs.create({
							"url": value
						});
					}
				}
			},
			"create new document": function() { createDocs("document") },
			"create document": function() { createDocs("document") },
			"create new presentation": function() { createDocs("presentation") },
			"create presentation": function() { createDocs("presentation") },
			"create new spreadsheet": function() { createDocs("spreadsheet") },
			"create spreadsheet": function() { createDocs("spreadsheet") },
			"facebook": function() { openTab("http://www.facebook.com") },
			"google": function() { openTab("http://www.google.com") },
			"yahoo": function() { openTab("http://www.yahoo.com") },
			"twitter": function() { openTab("http://www.twitter.com") },
			"flick": function() { openTab("http://www.flicker.com") },  
			"outlook": function() { openTab("http://www.outlook.com") },
			"dig": function() { openTab("http://www.digg.com") }
			
		}

        return this;
    };

    /**
     * Creates a new instance of VoiceRecognition.
     * @function
     * @private
     * @returns {voix}
     */
    Voix.prototype._createRecognition = function () {

        this._recognition = new VoiceRecognition();

        this._recognition.continuous = true;
        this._recognition.interimResults = false;
        this._recognition.lang = this._lang || 'en-US';
        this._recognition.maxAlternatives = 1;

        this._recognition.onresult = undefined;

        this._recognition.start();

        return this;
    };

    /**
     * Binds key events.
     * @function
     * @private
     * @returns {voix}
     */
    Voix.prototype._bindKeyEvents = function () {
        var that = this,
            keypress = false;

        document.addEventListener('keydown', function (eve) {
            if (!keypress && eve.keyCode === 86) {
                that.start();
                keypress = true;
            }
        });

        document.addEventListener('keyup', function (eve) {
            if (keypress && eve.keyCode === 86) {
                keypress = false;
            }
        });

        return this;
    };

    /**
     * Transcripts commands.
     * @function
     * @private
     * @returns {voix}
     */
    Voix.prototype._result = function (eve) {
        this.stop();

        var that = this,
            i = eve.resultIndex,
            len = eve.results.length,
            //j = 0,
            //listeners,
            //lenListeners,
            command;

        for (i; i < len; i += 1) {

            if (eve.results[i].isFinal) {
                command = eve.results[i][0].transcript.replace(/^\s+|\s+$/g, '').toLowerCase();

                /*if (that._collection[command]) {
                    listeners = that._collection[command].listeners;
                    lenListeners = listeners.length;

                    for (j; j < lenListeners; j += 1) {
                        listeners[j].call();
                    }
                }*/
				that._collection[command].call();
            }
        }
    };

    /**
     * Sets a new command with a listener to the collection.
     * @memberof! Voix.prototype
     * @function
     * @param {String} [command] - A given command.
     * @param {Funtion} listener - A given listener.
     * @returns {voix}
     */
    Voix.prototype.setCommand = function (command, listener) {
        if (this._collection[command] === undefined) {
            this._collection[command] = {
                'listeners': []
            };
        }

        this._collection[command].listeners.push(listener);

        return this;
    };

    /**
     * Rmoves a given command or its listener from the collection.
     * @memberof! Voix.prototype
     * @function
     * @param {String} [command] - A given command.
     * @param {Funtion} listener - A given listener.
     * @returns {voix}
     */
    Voix.prototype.removeCommand = function (command, listener) {
        /*var listeners = this._collection[command].listeners,
            i = 0,
            len = listeners.length;

        if (len !== undefined) {
            for (i; i < len; i += 1) {
                if (listeners[i] === listener) {
                    listeners.splice(i, 1);
                    break;
                }
            }
        }
		*/
        if (this._collection[command] !== 0 || this._collection[command] !== undefined) {
            delete this._collection[command];
        }

        return this;
    };

    /**
     * Starts the recognition.
     * @memberof! Voix.prototype
     * @function
     * @returns {voix}
     */
    Voix.prototype.start = function () {
		console.log('starting');
        var that = this;
        this._recognition.onresult = function (eve) {
            that._result.call(that, eve);
        };

        return this;
    };

    /**
     * Stops the recognition.
     * @memberof! Voix.prototype
     * @function
     * @returns {voix}
     */
    Voix.prototype.stop = function () {
        this._recognition.onresult = undefined;

        return this;
    };

    /**
     * Expose Voix
     */
    // AMD suppport
    if (typeof window.define === 'function' && window.define.amd !== undefined) {
        window.define('Voix', [], function () {
            return Voix;
        });

    // CommonJS suppport
    } else if (typeof module !== 'undefined' && module.exports !== undefined) {
        module.exports = Voix;

    // Default
    } else {
        window.Voix = Voix;
    }

}(this));

chrome.commands.onCommand.addListener(function(command) {
	if(command === "startSpeechRecognition") {
		var voix = new Voix('en-US');
		alert("blah");
		voix.start();
		console.log(voix);
	}
});