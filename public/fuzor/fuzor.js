/**
 * Created by sunqi on 2016/11/25.
 */



function getCameraInfo(cb) {
    $.ajax({
        url: 'http://localhost:45190/camera',
        method: 'get',
        dataType: 'xml',
        success: function(data) {

            var raw_position = data.getElementsByTagName('position')[0].innerHTML.split(' ');

            var position = {
                x: raw_position[0] - 0,
                y: raw_position[1] - 0,
                z: raw_position[2] - 0
            }

            var raw_direction = data.getElementsByTagName('direction')[0].innerHTML.split(' ');

            var direction = {
                x: raw_direction[0] - 0,
                y: raw_direction[1] - 0,
                z: raw_direction[2] - 0
            }

            var vertical_fov = data.getElementsByTagName('vertical-fov')[0].innerHTML - 0

            var horizontal_fov = data.getElementsByTagName('horizontal-fov')[0].innerHTML - 0

            cb(position, direction, vertical_fov, horizontal_fov)

        }

    })

}
function Fuzor() {
    this.state = ''
    this.model_url = '';
    this.host_address = 'http://27.11.98.49/'
    this.eventPollInterval = null;
    this.eventPollCommand = null;
    this.latestEventId = '';
}
Fuzor.prototype = {

    setModelUrl: function (url) {
        this.model_url = url;
    },

    active: function () {

        if (this.model_url) {

            this.launchFuzor(this.model_url);

            //this.pollForLatestEventImmediate();

        } else {
            this.setMessage('模型地址无效');
        }

    },

    getModelData: function(cb) {

        var self = this;

        function catData(arr) {
            var obj = {}
            arr.forEach(function(o) {

                var cat = o['类别']

                if(cat) {
                    if(!obj[cat]) {
                        obj[cat] = []
                    }
                    obj[cat].push(o)
                }
            })
            return obj;
        }

        function saveModelData (xml) {

            var all = []

            var jsonData =  $(xml).toObject().get(0);
            var objs = jsonData['object-info']['object']

            objs.forEach(function(o) {
                var param = o.param;
                var d = {}
                var cat = '';

                param.forEach(function(_obj) {
                    d[_obj.name] = _obj.value
                })

                all.push(d)

            })

            //var data = catData(all)

            return all

        }

        function findModelId(params) {
            if(params.length == 0){

                return ''
            }

            var res = ''

            for(var i = 0; i < params.length; i++) {

                var node = params[i]

                var name = node.getElementsByTagName('name')[0].innerHTML

                if(name == '__fuzor_modelid') {
                    res = node.getElementsByTagName('value')[0].innerHTML
                }
            }
            return res;
        }

        function queryModelInfo(id) {
            self.executeCommand("info?__fuzor_modelid=" + id, function(request) {
                if (request.readyState==4 && request.status==200) {
                    var xmlDoc = request.responseXML;

                    var data = saveModelData(xmlDoc)

                    cb(data)
                }
            });
        }


        this.executeCommand("selected", function(request) {
            if (request.readyState==4 && request.status==200) {
                var xmlDoc = request.responseXML;
                console.log(xmlDoc);
                var objects = xmlDoc.getElementsByTagName("object");
                if(objects.length > 0) {
                    var obj = objects[0]
                    var params = obj.getElementsByTagName('param')
                    var modelId = findModelId(params)
                    if(modelId) {
                        queryModelInfo(modelId)
                    }
                }
            }
        });

    },

    launchFuzor: function (model_url) {
        window.location = "fuzor://" + model_url;
    },

    pollForEvents: function () {

        var self = this;
        if (this.eventPollCommand !== null) {
            this.eventPollCommand.abort();
            this.eventPollCommand = null;
        }

        setTimeout(function () {
            self.eventPollCommand = self.executeCommand("events?afterid=" + self.latestEventId, function (request) {
                var xmlDoc = request.responseXML;
                //var selected
                console.log(xmlDoc);
                var eventTags = xmlDoc.getElementsByTagName("event");
                for (var i = 0; i < eventTags.length; i++) {
                    var eventTag = eventTags[i];
                    var idTag = eventTag.getElementsByTagName("id");
                    var infoTag = eventTag.getElementsByTagName("info");
                    if (idTag.length > 0 && infoTag.length > 0) {
                        self.latestEventId = idTag[0].childNodes[0].nodeValue;

                        var info = infoTag[0].childNodes[0].nodeValue;
                        if (info !== null) {
                            //handleEvent(info);
                        }
                    }
                }

                self.eventPollCommand = null;

                self.pollForEvents.call(self);

            }, function () {
                self.eventPollCommand = null;
                self.latestEventId = 0;
                self.pollForLatestEvent();
                self.STATE = 'DISCONNECTED';
            });
        }, 1000);
    },

    handleEvent: function (info) {
        if (info.indexOf("selected:") === 0) {

            console.log('选中构件');
            //querySelectedObjects();

        } else if (info.indexOf("installed:") === 0 || info.indexOf("uninstalled:") === 0) {
            //TODO 自定义按钮相关
            //checkIsInstalled();
        }
    },

    pollLoading: function () {
        var self = this;
        this.executeCommand("loading", function (request) {
            var xmlDoc = request.responseXML;
            var loadingTag = xmlDoc.getElementsByTagName("loading");
            if (loadingTag.length > 0) {
                if (loadingTag[0].childNodes[0].nodeValue == 1) {
                    self.fuzorLoadingInProgress();
                }
                else {
                    self.fuzorFinishedLoading();
                }
            }
        });
    },


    checkIsInstalled: function () {
        this.executeCommand("installed?vendor=" + encodeURIComponent(INSTALL_VENDOR) + "&name=" + encodeURIComponent(INSTALL_NAME), function (request) {
            var xmlDoc = request.responseXML;
            var action = xmlDoc.getElementsByTagName("action");
            var actionData = xmlDoc.getElementsByTagName("action-data");
            if (action !== null && actionData !== null && action.length > 0 && actionData.length > 0) {
                if (action[0].childNodes[0].nodeValue !== INSTALL_ACTION || actionData[0].childNodes[0].nodeValue !== INSTALL_ACTION_DATA) {
                    document.getElementById("install-div").style.display = "block";
                } else {
                    document.getElementById("install-div").style.display = "none";
                }
            }
            else {
                document.getElementById("install-div").style.display = "block";
            }
        });
    },

    pollForLatestEvent: function () {
        var self = this;
        this.eventPollInterval = setInterval(function () {
            self.pollForLatestEventImmediate();
        }, 5000);
    },


    fuzorStarted: function () {
        this.pollForEvents();
        this.pollLoading();
    },

    fuzorLoadingInProgress: function () {
        this.state = 'LOADING';

        setTimeout(function () {
            if (this.state === 'LOADING') {
                this.pollLoading();
            }
        }.bind(this), 1000);
    },

    fuzorFinishedLoading: function () {
        var self = this;
        console.log('fuzor load finised')
        this.executeCommand("cachelocation?url=" + this.model_url, function (request) {
            var xmlDoc = request.responseXML;
            var locationTag = xmlDoc.getElementsByTagName("location");
            if (locationTag.length > 0) {
                var cacheTag = locationTag[0].getElementsByTagName("cache");
                if (cacheTag.length === 0) {
                    self.setMessage("[cachelocation] Cache tag not found.");
                    return;
                }
                var cacheName = cacheTag[0].childNodes[0].nodeValue;
                self.executeCommand("model", function (modelRequest) {
                    var modelDoc = modelRequest.responseXML;
                    var modelTags = modelDoc.getElementsByTagName("model");
                    var hasModel = false;
                    for (var i = 0; i < modelTags.length; i++) {
                        var modelName = modelTags[i].childNodes[0].nodeValue;
                        if (modelName == cacheName) {
                            hasModel = true;
                            break;
                        }
                    }

                    if (hasModel) {
                        self.CONNETED = true;
                        //if (ALL_DATA.lengh == 0) {
                        //    console.log('请点击模型任意部分激活数据连接')
                        //}
                        //setConnectedState(STATE_CONNECTED);
                        //checkIsInstalled();
                        //pollForCameraInfo();
                        //querySelectedObjects();
                    } else {
                        self.setMessage("Wrong model is loaded. Please close Fuzor and launch from this page.");
                    }
                });

            } else {
                self.setMessage("[cachelocation] Location tag not found.");
            }
        });
    },

    pollForLatestEventImmediate: function () {
        var self = this;
        var origHost = this.host_address;
        this.executeCommand("latesteventid", function (request) {
            if (origHost === self.host_address) {
                if (self.eventPollInterval !== null) {
                    clearInterval(self.eventPollInterval);
                }

                var xmlDoc = request.responseXML;
                var latestEventTag = xmlDoc.getElementsByTagName("latest-event");
                if (latestEventTag.length > 0) {

                    console.log(latestEventTag)
                    self.latestEventId = latestEventTag[0].childNodes[0].nodeValue;
                }

                self.fuzorStarted();
            }
        }, function () {
            if (self.eventPollInterval === null) {
                if (origHost === self.hostaddress) {
                    self.pollForLatestEvent();
                    self.STATE = 'DISCONNECTED'
                }
            }
        });
    },

    executeCommand: function (command, cb, failcb) {
        var request;
        if (window.XMLHttpRequest) {
            // code for IE7+, Firefox, Chrome, Opera, Safari
            request = new XMLHttpRequest();
        }
        else {
            // code for IE6, IE5
            request = new ActiveXObject("Microsoft.XMLHTTP");
        }
        request.onreadystatechange = function () {

            console.log(request.readyState)

            if (request.readyState == 4) {
                if (request.status == 200) {
                    if (cb != null) {
                        cb(request);
                    }
                } else {
                    request.abort();
                    if (failcb != null) {
                        failcb(request);
                    }
                }
            }
        };

        request.open("GET", "http://" + this.host_address + ":45190/" + command, true);

        try {
            request.send()
        } catch (e) {
            console.error(e)
        }

        return request;
    },

    /*
     * 警告
     * */
    setMessage: function (content, status) {

        console.log(content);

    }


}


var STATUS = 'UNLANUCH'

$(function() {

    $.ajax({
        url: 'http://localhost:9898/loading',
        method: 'get',
        success: function(data) {

        },
        error: function(xhr, status, error) {
            console.log(arguments)
        }
    })
})

function setStatus(type) {


    if(type== 'success') {


    }

    if(type == 'error') {


    }

    if(type == 'loading') {


    }
}