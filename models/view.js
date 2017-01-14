/**
 * Created by sunqi on 16/12/3.
 */
var View = require('../lib/mongo').View


View.plugin('addFuzorUrl', {
    afterFind: function (views) {

        return views.map(obj => {
            obj.focus = `setcamerapos=${obj.pos}&setcameradir=${obj.dir}&setcameravfov=${obj.vertical}&setcamerahfov=${obj.horizontal}`

            if(obj.objectId) {

                obj.focus += `&selectobject=__fuzor_objectid:${obj.objectId}`
            }
            return obj;
        })
    },
    afterFindOne: function (view) {
        view.focus = `setcamerapos=${view.pos}&setcameradir=${view.dir}&setcameravfov=${view.vertical}&setcamerahfov=${view.horizontal}`

        if(view.objectId) {

            view.focus += `&selectobject=__fuzor_objectid:${view.objectId}`

        }

        return view;
    }
});
module.exports = {
    create: function create(view) {
        return View.create(view).exec()
    },
    getView: function getView(modelId) {
        return View
            .find({ modelId: modelId })
            .addFuzorUrl()
            .exec();
    },
}