'use strict';
module.exports = function(app) {
  // todoList Routes
  app.route('/tasks/:taskId').get()
    .get(function(req, res) {
        res.send("test")
    });


};