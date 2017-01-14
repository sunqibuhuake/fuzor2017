
/**
 * Created by sunqi on 16/11/19.
 */
var jsonpack = require('jsonpack/main'),
    fs       = require('fs');

fs.readFile('../public/models/upload_8a815cce66995c9554a4f0bd56bab75f.js', 'utf8', function(error, jsonContent) {


    //if(error) {
    //    return console.log(error)
    //}
    //
    //// packed now is a string with the packed version of jsonContent
    var str = JSON.stringify(JSON.parse(jsonContent));
    //
    //var packed = str.replace(/\\n/g, "\\n")
    //    .replace(/\\'/g, "\\'")
    //    .replace(/\\"/g, '\\"')
    //    .replace(/\\&/g, "\\&")
    //    .replace(/\\r/g, "\\r")
    //    .replace(/\\t/g, "\\t")
    //    .replace(/\\b/g, "\\b")
    //    .replace(/\\f/g, "\\f");
    //
    //// save the packed in a file
    fs.writeFile('message.txt', str, (err) => {
        if (err) throw err;
        console.log('It\'s saved!');
    });

});