/**
 * Created by sunqi on 16/12/14.
 */
(function ($) {
    $.fn.extend({
        "customUpload": function (url, inputElemId ,onSelectFile) {

            var self = this;

            this.on('change', function () {

                var files = $(this).get(0).files;

                if(files.length < 0) {

                    return false

                }

                var file = files[0];

                onSelectFile(file)

                var formData = new FormData();

                formData.append('uploads[]', file, file.name);

                $.ajax({
                    url: url,
                    type: 'POST',
                    data: formData,
                    processData: false,
                    contentType: false,
                    success: function (data) {
                        console.log(data);

                        if (data.status == 'success') {
                            self.parents().eq(1).find('.custom_process').html('上传完成').css('color', 'green')
                            $('#' + inputElemId).val(data.file)
                        } else {
                            self.parents().eq(1).find('.custom_process').html('上传出错').css('color', 'red')
                        }

                    },
                    xhr: function () {
                        var xhr = new XMLHttpRequest();
                        xhr.upload.addEventListener('progress', function (evt) {

                            if (evt.lengthComputable) {
                                var percentComplete = evt.loaded / evt.total;
                                percentComplete = parseInt(percentComplete * 100);
                                self.parents().eq(1).find('.custom_process').html('进度 : ' + percentComplete + '%').css('color', 'gray');
                            }

                        }, false);

                        return xhr;
                    }
                });

            });

        }
    });
})(jQuery);


(function ($) {
    $.fn.extend({
        "customSubmit": function () {

            var self = this;

            this.find('.fakeSubmit').click(function() {

                self.find('.realSubmit').click()

            })

        }
    });
})(jQuery);



function getMenuData(arr) {

    var list = {}

    arr.forEach(function (obj) {

        //console.log(obj['标高'] + obj['族'] + obj['族与类型'])

        if (obj['标高'] && obj['族'] && obj['族与类型']) {

            //console.log(obj);

            var a = obj['标高']

            var b = obj['族']

            var c = obj['族与类型']

            if (!list[a]) {

                list[a] = {}
            }

            if (!list[a][b]) {

                list[a][b] = []

            }

            list[a][b].push({
                name: c,
                objectid: obj.__fuzor_objectid
            })
        }
    })

    return list;
}

function createMenu(list) {

    var htm = ''
    Object.keys(list).forEach(function(key, level1) {

        var htm1 = ''

        Object.keys(list[key]).forEach(function(key2, level2) {

            var htm2 = ''

            list[key][key2].forEach(function(item, level3) {

                var s = '<li class="menu-item">' +
                    '<a data-id="' + item.objectid +
                    '" data-index="' + level1 + '-' + level2 + '-' + level3 +
                    '" href="#' + level1 + '-' + level2 + '-' + level3 +
                    '" class="real-component"> ' + item.name + '</a></li>'


                console.log(s)
                htm2 += s;

            })

            htm1 += '   <li class="has_sub menu-item">' +
                '<a href="#" class="waves-effect">  <span> ' + key2 + ' </span> </a>' +
                '<ul class="list-unstyled">' + htm2 + '</ul> ' +
                '</li>'

        })

        htm += '<li class="has_sub menu-item">' +
            '<a href="#" class="waves-effect">  <span>' + key + '</span> </a>' +
            '<ul class="list-unstyled">' + htm1 + '</ul></li>'

    })

    $('#topLevelUl').html(htm)

}