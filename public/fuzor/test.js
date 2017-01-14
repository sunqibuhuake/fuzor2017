/**
 * Created by sunqi on 2016/11/25.
 */
var ALL_DATA = [];
var DATA = [];
var currentId = '';
oFReader = new FileReader(), rFilter = /^(?:image\/bmp|image\/cis\-cod|image\/gif|image\/ief|image\/jpeg|image\/jpeg|image\/jpeg|image\/pipeg|image\/png|image\/svg\+xml|image\/tiff|image\/x\-cmu\-raster|image\/x\-cmx|image\/x\-icon|image\/x\-portable\-anymap|image\/x\-portable\-bitmap|image\/x\-portable\-graymap|image\/x\-portable\-pixmap|image\/x\-rgb|image\/x\-xbitmap|image\/x\-xpixmap|image\/x\-xwindowdump)$/i;

oFReader.onload = function (oFREvent) {

    addImg(oFREvent.target.result,currentId)
};

function loadImageFile() {
    if (document.getElementById("uploadImage").files.length === 0) { return; }
    var oFile = document.getElementById("uploadImage").files[0];
    if (!rFilter.test(oFile.type)) { alert("请上传图片文件!"); return; }
    oFReader.readAsDataURL(oFile);
}


function addImg(url, id) {

    if(!id) {
        alert('请先在左侧选择模型对象')
        return false;
    }


    $('#imgContainer').append('<img class="uploadedImg" src="' + url + '"/>')

    var fileMap = localStorage.getItem('fileMap');

    if(fileMap) {
        fileMap = JSON.parse(fileMap)

        if(!fileMap[currentId]) {
            fileMap[currentId] = [];
        }

        fileMap[currentId].push(url);
    } else {
        fileMap = {}

        fileMap[currentId] = [url];
    }

    localStorage.setItem('fileMap', JSON.stringify(fileMap))

}

$(function() {

    CONNECTED = false



    var LAST_FILE = '';

    initFocusObject();

    function initFocusObject() {

        $('#focusObject').click(function() {

            if(!CONNECTED) {
                alert('请先连接fuzor')
                return false
            }
            if(currentId) {——---------------9-----------b
                focusObject(currentId)
                selectObject(currentId)
            }
        })
    }

    function initMenu(){

        $('#firstpane a').click(function() {
            $('#firstpane a').removeClass('activeListItem');
            $(this).addClass('activeListItem')
        })
        $("#firstpane .menu_body").hide();
        $("#firstpane h3.menu_head").click(function(){
            $(this).addClass("current").next("div.menu_body").slideToggle(300).siblings("div.menu_body").slideUp("slow");
            $(this).siblings().removeClass("current");
        });

        $("#secondpane .menu_body").hide();
        $("#secondpane h3.menu_head").mouseover(function(){
            $(this).addClass("current").next("div.menu_body").slideDown(500).siblings("div.menu_body").slideUp("slow");
            $(this).siblings().removeClass("current");
        });
    }

    //initMenu()

    function renderObjectInfo(obj) {


        var arr = []

        for(var prop in obj) {
            arr.push({
                name: prop,
                value: obj[prop]
            })
        }

        arr = arr.reverse();
        var str = '';

        arr.forEach(function(obj) {
            str += obj.name + ':' + obj.value + '<br/>';
        })

        $('#objectInfo').html(str)
    }

    function renderImgList(id) {

        $('#imgContainer').empty();

        var fileMap = localStorage.getItem('fileMap');

        if(fileMap) {
            fileMap = JSON.parse(fileMap)

            var arr = fileMap[id]

            if(arr && arr.length > 0) {
                arr.forEach(function(url) {
                    $('#imgContainer').append('<img class="uploadedImg" src="' + url + '"/>')
                })
            }
        }

    }


    function createMenu(data) {

        var htm = ''

        for(var prop in data) {
            var arr = data[prop]

            htm += createSubMenu(arr, prop)
        }

        $('#firstpane').html(htm)

        initMenu();
        initListClick();


    }
    function initListClick(){
        $('.oneModel').click(function() {
            var id = $(this).data('id')

            $('#btns').show();

            ALL_DATA.forEach(function(obj) {
                if(obj.__fuzor_objectid == id) {

                    renderObjectInfo(obj)

                }
            })

            currentId = id;

            renderImgList(id);

            //queryObjectInfo('__fuzor_objectid=' + id);
        })
    }

    function createSubMenu(arr ,cat) {
        var headerHtm = '<h3 class="menu_head">{header}</h3>'

        var listHtm = '<div style="display:block" class="menu_body">{list}</div>'

        var str = ''
        arr.forEach(function(obj) {

            var name = obj['族'] + obj.Id;

            str += ('<a class="oneModel" href="#" data-id="{id}">' +　name + '</a>').replace('{id}', obj.__fuzor_objectid)

        })

        var header = headerHtm.replace('{header}', cat)

        var list = listHtm.replace('{list}', str);

        return header + list;
    }



    function cross(v1, v2) {
        return [v1[1] * v2[2] - v1[2] * v2[1], v1[2] * v2[0] - v1[0] * v2[2], v1[0] * v2[1] - v1[1] * v2[0]];
    }

    function normalize(v) {
        var len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
        if (len < 0.00001) {
            return [0,0,0];
        }

        return [v[0]/len, v[1]/len, v[2]/len];
        return [v[0]/len, v[1]/len, v[2]/len];
    }

    function matrixIdentity() {
        return [[1,0,0],[0,1,0],[0,0,1]];
    }

    function matrixRotation(axis, angle) {
        axis = normalize(axis)
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        var t = 1 - c;
        var x = axis[0];
        var y = axis[1];
        var z = axis[2];
        return [[t*x*x + c, t*x*y - z*s, t*x*z + y*s],
            [t*x*y + z*s, t*y*y + c, t*y*z - x*s],
            [t*x*z - y*s, t*y*z + x*s, t*z*z + c]];
    }

    function matrixMultiplyVector(m, v) {
        return [m[0][0]*v[0] + m[0][1]*v[1] + m[0][2]*v[2],
            m[1][0]*v[0] + m[1][1]*v[1] + m[1][2]*v[2],
            m[2][0]*v[0] + m[2][1]*v[1] + m[2][2]*v[2]];
    }

//const PROJECT_URL = "http://fuzorapi.kalloctech.com/rac_advanced_sample_project";
    const PROJECT_URL = "http://7xsj6b.com1.z0.glb.clouddn.com/c.che";
    const STATE_UNKNOWN = -1;
    const STATE_NOT_CONNECTED = 0;
    const STATE_LOADING = 1;
    const STATE_CONNECTED = 2;
    const STATE_ERROR = 3;
    var currentState = STATE_NOT_CONNECTED;
    function setConnectedState(state) {
        console.log(state)
        document.getElementById("not-connected-div").style.display = (state === STATE_NOT_CONNECTED) ? "block" : "none";
        document.getElementById("loading-div").style.display = (state === STATE_LOADING) ? "none" : "none";
        if(state == 1) {

            CONNECTED = true;

            if(ALL_DATA.length == 0) {
                $('#objectInfo').html('请点击模型任一部分激活数据连接')
            }


        }
        // document.getElementById("connected-div").style.display = (state === STATE_CONNECTED) ? "block" : "none";
        // document.getElementById("error-div").style.display = (state === STATE_ERROR) ? "block" : "none";
        // currentState = state;
    }

    function setError(msg) {
        if (currentState !== STATE_NOT_CONNECTED) {
            setConnectedState(STATE_ERROR);
            document.getElementById("error-h1").innerHTML = msg;
        }
    }

    var savedObjects = [];
    function saveObject(id) {
        if (id === "") {
            return;
        }

        executeCommand("info?__fuzor_objectid=" + id, function(request) {
            var xmlDoc = request.responseXML;
            var objects = xmlDoc.getElementsByTagName("object");
            if (objects.length > 0) {
                var object = objects[0];
                var family = getObjectInfo(object, "Family");
                var symbol = getObjectInfo(object, "Symbol");
                if (family === null) {
                    family = "No Family";
                }
                if (symbol === null) {
                    symbol = "No Symbol";
                }

                var description = "" + id + ": " + family + "; " + symbol;
                var found = false;
                for (var i=0; i<savedObjects.length; i++) {
                    if (savedObjects[i][0] === id) {
                        savedObjects[i][1] = description;
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    savedObjects.push([id, description]);
                }

                recreateSavedObjects();
            }
        });
    }

    function recreateSavedObjects() {
        var cookie = "";
        var txt = "<ul>";
        for (var i=0; i<savedObjects.length;i++) {
            txt = txt + "<li><i>" + savedObjects[i][1] + "</i><br />";
            txt = txt + "<div style=\"float:left; width:50%\"><button type=\"button\" onclick=\"focusObject(&quot;" + savedObjects[i][0] + "&quot;)\">Focus</button><br />";
            txt = txt + "<button type=\"button\" onclick=\"selectObject(&quot;" + savedObjects[i][0] + "&quot;)\">Select</button></div>";
            txt = txt + "<div style=\"float:right; width:50%\"><button type=\"button\" onclick=\"showObject(&quot;" + savedObjects[i][0] + "&quot;)\">Show</button><br />";
            txt = txt + "<button type=\"button\" onclick=\"hideObject(&quot;" + savedObjects[i][0] + "&quot;)\">Hide</button></div>";
            txt = txt + "</li>";

            if (i > 0) {
                cookie = cookie + ",";
            }
            cookie = cookie + savedObjects[i][0];
        }
        cookie = encodeURIComponent(cookie);

        var expire = new Date();
        expire.setYear(expire.getFullYear() + 1);
        cookie = "selected=" + cookie + "; expires=" + expire.toUTCString() + "; path=/";
        txt = txt + "</ul>"
        //document.getElementById("saved-objects-div").innerHTML = txt;
        document.cookie = cookie;
    }

    function loadSavedObjects() {
        var split = document.cookie.split(";");
        for (var i=0; i<split.length;i++) {
            var c = decodeURIComponent(split[i]);
            while (c.charAt(0)==' ') c = c.substring(1);
            if (c.indexOf("selected=") == 0) {
                c = c.slice(9);
                if (c !== "") {
                    var tosave = c.split(",");
                    for (var j=0; j<tosave.length; j++) {
                        saveObject(tosave[j]);
                    }
                }
                break;
            }
        }

        recreateSavedObjects();
    }

    const INSTALL_VENDOR = "Kalloc Studios";
    const INSTALL_NAME = "Search Google";
    const INSTALL_ACTION = "executeurl";
    const INSTALL_ACTION_DATA = "https://www.google.com/search?q=@(Family) @(Symbol)";

    function checkIsInstalled() {
        return false;
        executeCommand("installed?vendor=" + encodeURIComponent(INSTALL_VENDOR) + "&name=" + encodeURIComponent(INSTALL_NAME), function(request) {
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
    }

    function installButton() {
        command = "execute?installbutton=";
        command = command + "vendor:" + encodeURIComponent(INSTALL_VENDOR);
        command = command + ";name:" + encodeURIComponent(INSTALL_NAME);
        command = command + ";action:" + encodeURIComponent(INSTALL_ACTION);
        command = command + ";actiondata:" + encodeURIComponent(INSTALL_ACTION_DATA);
        executeCommand(command);
    }

    var cameraInterval = null;
    var latestEventId = 0;
    var hostaddress = "localhost";
    window.onload=function() {

        var data = localStorage.getItem('DATA')

        var all_data = localStorage.getItem('ALL_DATA')

        if(data && all_data) {
            data = JSON.parse(data);

            all_data = JSON.parse(all_data)

            DATA = data.DATA;
            ALL_DATA = all_data.DATA;
            $('#objectInfo').empty();
            createMenu(DATA)
        }
        document.getElementById("launchbutton").onclick = function() { launchFuzor(PROJECT_URL); };
        // document.getElementById("connectbutton").onclick = function() {
        // 	hostaddress = document.getElementById("inputhost").value;
        // 	if (eventPollCommand !== null) {
        // 		eventPollCommand.abort();
        // 		eventPollCommand = null;
        // 	}
        // 	pollForLatestEventImmediate();
        // };

        loadSavedObjects();
        setConnectedState(STATE_UNKNOWN);
        pollForLatestEventImmediate();
    }

    var eventPollInterval = null;
    function pollForLatestEventImmediate() {
        var origHost = hostaddress;
        executeCommand("latesteventid", function(request) {
            if (origHost === hostaddress) {
                if (eventPollInterval !== null) {
                    clearInterval(eventPollInterval);
                }

                var xmlDoc = request.responseXML;
                var latestEventTag = xmlDoc.getElementsByTagName("latest-event");
                if (latestEventTag.length > 0) {
                    latestEventId = latestEventTag[0].childNodes[0].nodeValue;
                }

                fuzorStarted();
            }
        }, function() {
            if (eventPollInterval === null) {
                if (origHost === hostaddress) {
                    pollForLatestEvent();
                    setConnectedState(STATE_NOT_CONNECTED);
                }
            }
        });
    }

    function fuzorStarted() {
        pollForEvents();
        pollLoading();
    }

    function pollLoading() {
        executeCommand("loading", function(request) {
            var xmlDoc = request.responseXML;
            var loadingTag = xmlDoc.getElementsByTagName("loading");
            if (loadingTag.length > 0) {
                if (loadingTag[0].childNodes[0].nodeValue == 1) {
                  }
                else {
                    fuzorFinishedLoading();
                }
            }
        });
    }

    function fuzorLoadingInProgress() {
        setConnectedState(STATE_LOADING);

        setTimeout(function() {
            if (currentState === STATE_LOADING) {
                pollLoading();
            }
        }, 1000);
    }

    //function ssss() {
    //    console.log(fuzor "cachelocation?url=" + PROJECT_URL, function(request) {
    //        var xmlDoc = request.responseXML;
    //        var locationTag = xmlDoc.getElementsByTagName("location");
    //        if (locationTag.length > 0) {
    //            var cacheTag = locationTag[0].getElementsByTagName("cache");
    //            if (cacheTag.length === 0) {
    //                setError("[cachelocation] Cache tag not found.");
    //                return;
    //            }
    //            var cacheName = cacheTag[0].childNodes[0].nodeValue;
    //
    //            executeCommand("model", function(modelRequest) {
    //                var modelDoc = modelRequest.responseXML;
    //                var modelTags = modelDoc.getElementsByTagName("model");
    //                var hasModel = false;
    //                for (var i=0; i < modelTags.length; i++) {
    //                    var modelName = modelTags[i].childNodes[0].nodeValue;
    //                    if (modelName == cacheName) {
    //                        hasModel = true;
    //                        break;
    //                    }
    //                }
    //
    //                if (hasModel) {
    //                    CONNECTED = true;
    //                    if(ALL_DATA.lengh == 0) {
    //                        $('#objectInfo').html('请点击模型任意部分激活数据连接')
    //                    }
    //                    setConnectedState(STATE_CONNECTED);
    //                    checkIsInstalled();
    //                    pollForCameraInfo();
    //                    querySelectedObjects();
    //                } else {
    //                    setError("Wrong model is loaded. Please close Fuzor and launch from this page.");
    //                }
    //            });
    //
    //        } else {
    //            setError("[cachelocation] Location tag not found.");
    //        }
    //    });
    //}

    function pollForLatestEvent() {
        eventPollInterval = setInterval(function() {
            pollForLatestEventImmediate();
        }, 5000);
    }

    var eventPollCommand = null;
    function pollForEvents() {
        if (eventPollCommand !== null) {
            eventPollCommand.abort();
            eventPollCommand = null;
        }

        setTimeout(function() {
            eventPollCommand = executeCommand("events?afterid=" + latestEventId, function(request) {
                var xmlDoc = request.responseXML;
                //var selected
                console.log(xmlDoc);
                var eventTags = xmlDoc.getElementsByTagName("event");
                for (var i=0;i<eventTags.length;i++) {
                    var eventTag = eventTags[i];
                    var idTag = eventTag.getElementsByTagName("id");
                    var infoTag = eventTag.getElementsByTagName("info");
                    if (idTag.length > 0 && infoTag.length > 0) {
                        latestEventId = idTag[0].childNodes[0].nodeValue;

                        var info = infoTag[0].childNodes[0].nodeValue;
                        if (info !== null) {
                            handleEvent(info);
                        }
                    }
                }

                eventPollCommand = null;

                pollForEvents();
            }, function() {
                eventPollCommand = null;
                latestEventId = 0;
                pollForLatestEvent();
                setConnectedState(STATE_NOT_CONNECTED);
            });
        }, 1000);
    }

    function handleEvent(info) {
        if (info.indexOf("selected:") === 0) {
            querySelectedObjects();
        } else if (info.indexOf("installed:") === 0 || info.indexOf("uninstalled:") === 0) {
            checkIsInstalled();
        }
    }

    function pollForCameraInfo() {
        return false;
        // Poll for camera position, orientation, and fov updates once per second
        setTimeout(function() {
            executeCommand("camera", function(request) {
                if (cameraInterval === null) {
                    var xmlDoc = request.responseXML;
                    var position = xmlDoc.getElementsByTagName("position");
                    if (position.length > 0) {
                        var values = position[0].childNodes[0].nodeValue.split(" ");
                        document.getElementById("camerax").value=values[0];
                        document.getElementById("cameray").value=values[1];
                        document.getElementById("cameraz").value=values[2];
                    }

                    var direction = xmlDoc.getElementsByTagName("direction");
                    if (direction.length > 0) {
                        var values = direction[0].childNodes[0].nodeValue.split(" ");
                        document.getElementById("cameradirx").value=values[0];
                        document.getElementById("cameradiry").value=values[1];
                        document.getElementById("cameradirz").value=values[2];
                    }

                    var vfov = xmlDoc.getElementsByTagName("vertical-fov");
                    if (vfov.length > 0) {
                        document.getElementById("camerarvfov").value=vfov[0].childNodes[0].nodeValue;
                    }
                    var hfov = xmlDoc.getElementsByTagName("horizontal-fov");
                    if (hfov.length > 0) {
                        document.getElementById("camerarhfov").value=hfov[0].childNodes[0].nodeValue;
                    }
                }

                pollForCameraInfo();
            });
        }, 1000);
    }

    function executeCommand(command, cb, failcb) {

        var request;
        if (window.XMLHttpRequest) {
            // code for IE7+, Firefox, Chrome, Opera, Safari
            request=new XMLHttpRequest();
        }
        else {
            // code for IE6, IE5
            request=new ActiveXObject("Microsoft.XMLHTTP");
        }
        request.onreadystatechange = function() {
            if (request.readyState==4) {
                if (request.status==200) {
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
        request.open("GET", "http://" + hostaddress + ":45190/" + command, true);
        request.send();
        return request;
    }

    function launchFuzor(cheURL) {
        window.location = "fuzor://" + cheURL;
    }

    function getObjectInfo(objectTag, infoName) {
        var params = objectTag.getElementsByTagName("param");

        for (p=0;p<params.length;p++) {
            var name = "" + params[p].getElementsByTagName("name")[0].childNodes[0].nodeValue;
            if (name == infoName) {
                return "" + params[p].getElementsByTagName("value")[0].childNodes[0].nodeValue;
            }
        }

        return null;
    }

    function createObjectTable(objectTag) {
        var params = objectTag.getElementsByTagName("param");

        var txt = "<table border=1px>"
        txt = txt + "<tr><th>Name</th><th>Value</th></tr>";
        for (p=0;p<params.length;p++) {
            var name = params[p].getElementsByTagName("name")[0].childNodes[0].nodeValue;
            if (!(name.indexOf("__") === 0)) {
                var value = params[p].getElementsByTagName("value")[0].childNodes[0].nodeValue;
                txt = txt + "<tr><td>" + name + "</td><td>" + value + "</td></tr>";
            }
        }
        txt = txt + "</table><br /><br />"
        return txt;
    }

    function addObjectButtons(object) {
        var id = getObjectInfo(object, "__fuzor_objectid");
        if (id === null) {
            return;
        }

        var family = getObjectInfo(object, "Family");
        var symbol = getObjectInfo(object, "Symbol");

        if (family === null) {
            family = "No Family";
        }
        if (symbol === null) {
            symbol = "No Symbol";
        }

        var txt = "";
        txt = txt + "<h1>" + id + ": " + family + "; " + symbol + "</h1>";
        txt = txt + "<button type=\"button\" onclick=\"focusObject(&quot;" + id + "&quot;)\">Focus</button>&nbsp;&nbsp;";
        txt = txt + "<button type=\"button\" onclick=\"deselectObject(&quot;" + id + "&quot;)\">Deselect</button>&nbsp;&nbsp;";
        txt = txt + "<button type=\"button\" onclick=\"saveObject(&quot;" + id + "&quot;)\">Save</button>";
        txt = txt + "<br /><br />";

        colorr = getObjectInfo(object, "__override_color_r");
        colorg = getObjectInfo(object, "__override_color_g");
        colorb = getObjectInfo(object, "__override_color_b");
        colora = getObjectInfo(object, "__override_color_a");
        if (colorr == null) colorr = 255;
        if (colorg == null) colorg = 255;
        if (colorb == null) colorb = 255;
        if (colora == null) colora = 255;

        txt = txt + "Color Override:<br />";
        txt = txt + "r: <input type=\"number\" id=\"r" + id + "\" size=3 maxlength=3 value=\"" + colorr + "\" min=0 max=255 />&nbsp;&nbsp;";
        txt = txt + "g: <input type=\"number\" id=\"g" + id + "\" size=3 maxlength=3 value=\"" + colorg + "\" min=0 max=255 />&nbsp;&nbsp;";
        txt = txt + "b: <input type=\"number\" id=\"b" + id + "\" size=3 maxlength=3 value=\"" + colorb + "\" min=0 max=255 />&nbsp;&nbsp;";
        txt = txt + "<button type=\"button\" onclick=\"overrideColor(&quot;" + id + "&quot;"
            + ", document.getElementById(&quot;r" + id + "&quot;).value"
            + ", document.getElementById(&quot;g" + id + "&quot;).value"
            + ", document.getElementById(&quot;b" + id + "&quot;).value"
            + ")\">Override Color</button><br /><br />";
        txt = txt + "a: <input type=\"number\" id=\"a" + id + "\" size=3 maxlength=3 value=\"" + colora + "\" min=0 max=255 />&nbsp;&nbsp;";
        txt = txt + "<button type=\"button\" onclick=\"overrideAlpha(&quot;" + id + "&quot;"
            + ", document.getElementById(&quot;a" + id + "&quot;).value"
            + ")\">Override Alpha</button><br /><br />";
        txt = txt + "<button type=\"button\" onclick=\"resetOverride(&quot;" + id + "&quot;)\">Reset Overrides</button><br /><br />";

        posx = getObjectInfo(object, "__position_x");
        posy = getObjectInfo(object, "__position_y");
        posz = getObjectInfo(object, "__position_z");
        txt = txt + "Position:<br />";
        txt = txt + "x: <input type=\"text\" id=\"posx" + id + "\" size=10 value=\"" + posx + "\" />&nbsp;&nbsp;";
        txt = txt + "y: <input type=\"text\" id=\"posy" + id + "\" size=10 value=\"" + posy + "\" />&nbsp;&nbsp;";
        txt = txt + "z: <input type=\"text\" id=\"posz" + id + "\" size=10 value=\"" + posz + "\" />&nbsp;&nbsp;";
        txt = txt + "<button type=\"button\" onclick=\"setPosition(&quot;" + id + "&quot;"
            + ", document.getElementById(&quot;posx" + id + "&quot;).value"
            + ", document.getElementById(&quot;posy" + id + "&quot;).value"
            + ", document.getElementById(&quot;posz" + id + "&quot;).value"
            + ")\">Set Position</button><br /><br />";

        rotx = getObjectInfo(object, "__rotation_x");
        roty = getObjectInfo(object, "__rotation_y");
        rotz = getObjectInfo(object, "__rotation_z");
        txt = txt + "Rotation:<br />";
        txt = txt + "x: <input type=\"text\" id=\"rotx" + id + "\" size=10 value=\"" + rotx + "\" />&nbsp;&nbsp;";
        txt = txt + "y: <input type=\"text\" id=\"roty" + id + "\" size=10 value=\"" + roty + "\" />&nbsp;&nbsp;";
        txt = txt + "z: <input type=\"text\" id=\"rotz" + id + "\" size=10 value=\"" + rotz + "\" />&nbsp;&nbsp;";
        txt = txt + "<button type=\"button\" onclick=\"setRotation(&quot;" + id + "&quot;"
            + ", document.getElementById(&quot;rotx" + id + "&quot;).value"
            + ", document.getElementById(&quot;roty" + id + "&quot;).value"
            + ", document.getElementById(&quot;rotz" + id + "&quot;).value"
            + ")\">Set Rotation</button><br /><br />";
        return txt;
    }

    function querySelectedObjects() {

        if(ALL_DATA.length > 0 ) {
            return false;
        }
        executeCommand("selected", function(request) {
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
        executeCommand("info?__fuzor_modelid=" + id, function(request) {
            if (request.readyState==4 && request.status==200) {
                var xmlDoc = request.responseXML;

                saveModelData(xmlDoc)
            }
        });
    }

    function saveModelData (xml) {

        var jsonData =  $(xml).toObject().get(0);
        var objs = jsonData['object-info']['object']

        objs.forEach(function(o) {
            var param = o.param;


            var d = {}


            var cat = '';

            param.forEach(function(_obj) {
                d[_obj.name] = _obj.value
            })

            ALL_DATA.push(d)

        })

        DATA = catData(ALL_DATA)

        localStorage.setItem('DATA',JSON.stringify({DATA:DATA}))
        localStorage.setItem('ALL_DATA',JSON.stringify({DATA:ALL_DATA}))

        $('#objectInfo').empty();

        createMenu(DATA)
        console.log(DATA)
    }

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
    function queryObjectInfo(id) {
        executeCommand("info?" + id, function(request) {
            if (request.readyState==4 && request.status==200) {
                var xmlDoc = request.responseXML;
                var jsonData = $(xmlDoc).toObject().get(0);
                var params = jsonData['object-info']['object']['param'];
                renderObjectInfo(params)
            }
        });
    }

    function focusObject(id) {
        executeCommand("execute?focusobject=__fuzor_objectid:" + id, null);
    }

    function selectObject(id) {
        executeCommand("execute?selectobject=__fuzor_objectid:" + id, null);
    }

    function deselectObject(id) {
        executeCommand("execute?deselectobject=__fuzor_objectid:" + id, null);
    }

    function showObject(id) {
        executeCommand("execute?showobject=__fuzor_objectid:" + id, null);
    }

    function hideObject(id) {
        executeCommand("execute?hideobject=__fuzor_objectid:" + id, null);
    }

    function deseletAll() {
        executeCommand("execute?deselectall", null);
    }
    function selectAll(){

        executeCommand('execute?deselectall')
    }

    function overrideColor(id, r, g, b) {
        executeCommand("execute?overridecolor=__fuzor_objectid:" + id + ":" + r + ":" + g + ":" + b);
    }

    function overrideAlpha(id, a) {
        executeCommand("execute?overridealpha=__fuzor_objectid:" + id + ":" + a);
    }

    function resetOverride(id) {
        executeCommand("execute?resetoverride=__fuzor_objectid:" + id);
    }

    function setPosition(id, x, y, z) {
        executeCommand("execute?setposition=__fuzor_objectid:" + id + ":" + x + ":" + y + ":" + z);
    }

    function setRotation(id, x, y, z) {
        executeCommand("execute?setrotation=__fuzor_objectid:" + id + ":" + x + ":" + y + ":" + z);
    }

    function cameraStop() {
        if (cameraInterval === null) {
            return;
        }
        clearInterval(cameraInterval);
        cameraInterval = null;
    }

    function cameraFwd() {
        if (cameraInterval !== null) {
            return;
        }

        var lasttime = Date.now();
        cameraInterval = setInterval(function() {
            var curtime = Date.now();
            var elapsed = curtime - lasttime;
            lasttime = curtime;

            var curx = parseFloat(document.getElementById("camerax").value);
            var cury = parseFloat(document.getElementById("cameray").value);
            var curz = parseFloat(document.getElementById("cameraz").value);

            var curdirx = parseFloat(document.getElementById("cameradirx").value);
            var curdiry = parseFloat(document.getElementById("cameradiry").value);
            var curdirz = parseFloat(document.getElementById("cameradirz").value);

            var delta = elapsed / 1000;
            var newx = curx + delta * curdirx;
            var newy = cury + delta * curdiry;
            var newz = curz + delta * curdirz;
            executeCommand("execute?setcamerapos=" + newx + ":" + newy + ":" + newz);

            document.getElementById("camerax").value = newx;
            document.getElementById("cameray").value = newy;
            document.getElementById("cameraz").value = newz;
        }, 16);
        window.onmouseup = cameraStop;
    }

    function cameraBack() {
        if (cameraInterval !== null) {
            return;
        }

        var lasttime = Date.now();
        cameraInterval = setInterval(function() {
            var curtime = Date.now();
            var elapsed = curtime - lasttime;
            lasttime = curtime;

            var curx = parseFloat(document.getElementById("camerax").value);
            var cury = parseFloat(document.getElementById("cameray").value);
            var curz = parseFloat(document.getElementById("cameraz").value);

            var curdirx = parseFloat(document.getElementById("cameradirx").value);
            var curdiry = parseFloat(document.getElementById("cameradiry").value);
            var curdirz = parseFloat(document.getElementById("cameradirz").value);

            var delta = -elapsed / 1000;
            var newx = curx + delta * curdirx;
            var newy = cury + delta * curdiry;
            var newz = curz + delta * curdirz;
            executeCommand("execute?setcamerapos=" + newx + ":" + newy + ":" + newz);

            document.getElementById("camerax").value = newx;
            document.getElementById("cameray").value = newy;
            document.getElementById("cameraz").value = newz;
        }, 16);
        window.onmouseup = cameraStop;
    }

    function cameraLeft() {
        if (cameraInterval !== null) {
            return;
        }

        var lasttime = Date.now();
        cameraInterval = setInterval(function() {
            var curtime = Date.now();
            var elapsed = curtime - lasttime;
            lasttime = curtime;

            var curx = parseFloat(document.getElementById("camerax").value);
            var cury = parseFloat(document.getElementById("cameray").value);
            var curz = parseFloat(document.getElementById("cameraz").value);

            var curdirx = parseFloat(document.getElementById("cameradirx").value);
            var curdiry = parseFloat(document.getElementById("cameradiry").value);
            var curdirz = parseFloat(document.getElementById("cameradirz").value);

            var curdir = normalize([curdirx, curdiry, curdirz]);
            var up = [0, 1, 0];
            if (Math.abs(curdir[1]) > 0.99) {
                up = [0, 0, 1];
            }
            var right = cross(curdir, up);

            var delta = -elapsed / 1000;
            var newx = curx + delta * right[0];
            var newy = cury + delta * right[1];
            var newz = curz + delta * right[2];
            executeCommand("execute?setcamerapos=" + newx + ":" + newy + ":" + newz);

            document.getElementById("camerax").value = newx;
            document.getElementById("cameray").value = newy;
            document.getElementById("cameraz").value = newz;
        }, 16);
        window.onmouseup = cameraStop;
    }

    function cameraRight() {
        if (cameraInterval !== null) {
            return;
        }

        var lasttime = Date.now();
        cameraInterval = setInterval(function() {
            var curtime = Date.now();
            var elapsed = curtime - lasttime;
            lasttime = curtime;

            var curx = parseFloat(document.getElementById("camerax").value);
            var cury = parseFloat(document.getElementById("cameray").value);
            var curz = parseFloat(document.getElementById("cameraz").value);

            var curdirx = parseFloat(document.getElementById("cameradirx").value);
            var curdiry = parseFloat(document.getElementById("cameradiry").value);
            var curdirz = parseFloat(document.getElementById("cameradirz").value);

            var curdir = normalize([curdirx, curdiry, curdirz]);
            var up = [0, 1, 0];
            if (Math.abs(curdir[1]) > 0.99) {
                up = [0, 0, 1];
            }
            var right = cross(curdir, up);

            var delta = elapsed / 1000;
            var newx = curx + delta * right[0];
            var newy = cury + delta * right[1];
            var newz = curz + delta * right[2];
            executeCommand("execute?setcamerapos=" + newx + ":" + newy + ":" + newz);

            document.getElementById("camerax").value = newx;
            document.getElementById("cameray").value = newy;
            document.getElementById("cameraz").value = newz;
        }, 16);
        window.onmouseup = cameraStop;
    }

    function cameraLookUp() {
        if (cameraInterval !== null) {
            return;
        }

        var lasttime = Date.now();
        cameraInterval = setInterval(function() {
            var curtime = Date.now();
            var elapsed = curtime - lasttime;
            lasttime = curtime;

            var curdirx = parseFloat(document.getElementById("cameradirx").value);
            var curdiry = parseFloat(document.getElementById("cameradiry").value);
            var curdirz = parseFloat(document.getElementById("cameradirz").value);
            if (curdiry > 0.99) {
                return;
            }

            var curdir = normalize([curdirx, curdiry, curdirz]);

            var up = [0, 1, 0];
            if (Math.abs(curdir[1]) > 0.99999) {
                up = [0, 0, 1];
            }
            var right = normalize(cross(curdir, up));
            up = normalize(cross(right, curdir));

            var angle = Math.PI * elapsed / 2000;

            var rot = matrixRotation(right, angle);
            var newdir = matrixMultiplyVector(rot, curdir);

            var newx = newdir[0];
            var newy = newdir[1];
            var newz = newdir[2];
            executeCommand("execute?setcameradir=" + newx + ":" + newy + ":" + newz);

            document.getElementById("cameradirx").value = newx;
            document.getElementById("cameradiry").value = newy;
            document.getElementById("cameradirz").value = newz;
        }, 16);
        window.onmouseup = cameraStop;
    }

    function cameraLookDown() {
        if (cameraInterval !== null) {
            return;
        }

        var lasttime = Date.now();
        cameraInterval = setInterval(function() {
            var curtime = Date.now();
            var elapsed = curtime - lasttime;
            lasttime = curtime;

            var curdirx = parseFloat(document.getElementById("cameradirx").value);
            var curdiry = parseFloat(document.getElementById("cameradiry").value);
            var curdirz = parseFloat(document.getElementById("cameradirz").value);
            if (curdiry < -0.99) {
                return;
            }

            var curdir = normalize([curdirx, curdiry, curdirz]);
            var up = [0, 1, 0];
            if (Math.abs(curdir[1]) > 0.99999) {
                up = [0, 0, 1];
            }
            var right = normalize(cross(curdir, up));
            up = normalize(cross(right, curdir));

            var angle = -Math.PI * elapsed / 2000;

            var rot = matrixRotation(right, angle);
            var newdir = matrixMultiplyVector(rot, curdir);

            var newx = newdir[0];
            var newy = newdir[1];
            var newz = newdir[2];
            executeCommand("execute?setcameradir=" + newx + ":" + newy + ":" + newz);

            document.getElementById("cameradirx").value = newx;
            document.getElementById("cameradiry").value = newy;
            document.getElementById("cameradirz").value = newz;
        }, 16);
        window.onmouseup = cameraStop;
    }

    function cameraLookLeft() {
        if (cameraInterval !== null) {
            return;
        }

        var lasttime = Date.now();
        cameraInterval = setInterval(function() {
            var curtime = Date.now();
            var elapsed = curtime - lasttime;
            lasttime = curtime;

            var curdirx = parseFloat(document.getElementById("cameradirx").value);
            var curdiry = parseFloat(document.getElementById("cameradiry").value);
            var curdirz = parseFloat(document.getElementById("cameradirz").value);

            var curdir = normalize([curdirx, curdiry, curdirz]);
            var up = [0, 1, 0];
            if (Math.abs(curdir[1]) > 0.99999) {
                up = [0, 0, 1];
            }
            var right = normalize(cross(curdir, up));
            up = normalize(cross(right, curdir));

            var angle = Math.PI * elapsed / 2000;

            var rot = matrixRotation(up, angle);
            var newdir = matrixMultiplyVector(rot, curdir);

            var newx = newdir[0];
            var newy = newdir[1];
            var newz = newdir[2];
            executeCommand("execute?setcameradir=" + newx + ":" + newy + ":" + newz);

            document.getElementById("cameradirx").value = newx;
            document.getElementById("cameradiry").value = newy;
            document.getElementById("cameradirz").value = newz;
        }, 16);
        window.onmouseup = cameraStop;
    }

    function cameraLookRight() {
        if (cameraInterval !== null) {
            return;
        }

        var lasttime = Date.now();
        cameraInterval = setInterval(function() {
            var curtime = Date.now();
            var elapsed = curtime - lasttime;
            lasttime = curtime;

            var curdirx = parseFloat(document.getElementById("cameradirx").value);
            var curdiry = parseFloat(document.getElementById("cameradiry").value);
            var curdirz = parseFloat(document.getElementById("cameradirz").value);

            var curdir = normalize([curdirx, curdiry, curdirz]);
            var up = [0, 1, 0];
            if (Math.abs(curdir[1]) > 0.99999) {
                up = [0, 0, 1];
            }
            var right = normalize(cross(curdir, up));
            up = normalize(cross(right, curdir));

            var angle = -Math.PI * elapsed / 2000;

            var rot = matrixRotation(up, angle);
            var newdir = matrixMultiplyVector(rot, curdir);

            var newx = newdir[0];
            var newy = newdir[1];
            var newz = newdir[2];
            executeCommand("execute?setcameradir=" + newx + ":" + newy + ":" + newz);

            document.getElementById("cameradirx").value = newx;
            document.getElementById("cameradiry").value = newy;
            document.getElementById("cameradirz").value = newz;
        }, 16);
        window.onmouseup = cameraStop;
    }

    function cameraFovUp() {
        if (cameraInterval !== null) {
            return;
        }

        var lasttime = Date.now();
        cameraInterval = setInterval(function() {
            var curtime = Date.now();
            var elapsed = curtime - lasttime;
            lasttime = curtime;

            var curvfov = parseFloat(document.getElementById("camerarvfov").value);
            var newvfov = curvfov + elapsed / 1000 * 10.0;
            newvfov = Math.min(newvfov, 179.9);

            executeCommand("execute?setcameravfov=" + newvfov);

            document.getElementById("camerarvfov").value = newvfov;
        }, 16);
        window.onmouseup = cameraStop;
    }

    function cameraFovDown() {
        if (cameraInterval !== null) {
            return;
        }

        var lasttime = Date.now();
        cameraInterval = setInterval(function() {
            var curtime = Date.now();
            var elapsed = curtime - lasttime;
            lasttime = curtime;

            var curvfov = parseFloat(document.getElementById("camerarvfov").value);
            var newvfov = curvfov - elapsed / 1000 * 4.0;
            newvfov = Math.max(newvfov, 1.0);

            executeCommand("execute?setcameravfov=" + newvfov);

            document.getElementById("camerarvfov").value = newvfov;
        }, 16);
        window.onmouseup = cameraStop;
    }

})