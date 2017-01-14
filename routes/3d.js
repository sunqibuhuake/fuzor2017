/**
 * Created by sunqi on 16/11/16.
 */

var ModelModel = require('../models/model')

var express = require('express');
var router = express.Router();

function returnRouter(io) {

    router.get('/control/:modelId', (req, res, next) => {

        const modelId = req.params.modelId;

        const userId = req.session.user._id;

        ModelModel.getModelById(modelId)
            .then(function(model) {

                var roomId = userId;

                var room = io.of('/' + roomId)

                room.on('connection', function(socket) {

                    console.log('room ' + roomId + ' has one control connect')

                    socket.on('control', function(data) {

                        room.emit('control', data)

                    });

                    socket.on('active', function(data) {

                        console.log(data)

                        room.emit('active', data)

                    });

                    socket.on('select', function(data) {

                        console.log(data)

                        room.emit('select', data)

                    });

                    socket.on('adjust', function(data) {

                        console.log(data)

                        room.emit('adjust', data)

                    });

                    socket.on('mode', function(data) {

                        console.log(data)

                        room.emit('mode', data)

                    });

                    socket.on('boom', function(data) {

                        console.log(data)

                        room.emit('boom', data)

                    });

                    socket.on('reset', function(data) {

                        console.log(data)

                        room.emit('reset', data)

                    });
                });

                res.render('xcontrol', {
                    model: model
                })

            })
            .catch(function(e) {
                next(e)
            })

    })

    router.get('/waiting', (req, res, next) => {
        res.render('xwaiting')
    })

    router.get('/tv/:modelId', (req,res, next) => {

        const modelId = req.params.modelId;

        const userId = req.session.user._id;

        const roomId = userId;


        ModelModel.getModelById(modelId)

            .then(function(model) {

                const room = io.of('/' + roomId)

                room.on('connection', function(socket) {

                    console.log('room ' + roomId + ' has one  connect')

                });

                res.render('xtv', {
                    model: model
                })

            })
            .catch(function(e) {
                next(e)
            })

    })

    router.get('/tv2/:modelId', (req,res, next) => {

        const modelId = req.params.modelId;

        const userId = req.session.user._id;

        const roomId = userId;


        ModelModel.getModelById(modelId)

            .then(function(model) {

                const room = io.of('/' + roomId)

                room.on('connection', function(socket) {

                    console.log('room ' + roomId + ' has one  connect')

                });

                res.render('xtv2', {
                    model: model
                })

            })
            .catch(function(e) {
                next(e)
            })

    })


    return router;

}

module.exports = returnRouter;


