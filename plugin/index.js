'use strict';

var pkg = require('../package'),
    handlebars = require('handlebars'),
    registry = require('./registry'),
    utils = require('./utils');

handlebars.registerHelper('json', function(context) {
    return JSON.stringify(context);
});    

module.exports = {

    name: pkg.name,

    version: pkg.version,

    register: function (plugin, options, next) {

        plugin.views({
            engines: {
                html: {
                    module: handlebars
                    //layout: utils.layoutFile
                }
            },
            partialsPath: utils.viewPath,
            path: utils.viewPath,
            isCached: false
        });        

        plugin.route({
            method: 'GET',
            path: utils.assestRoute,
            vhost: options.vhost,
            handler: {
                directory: {
                    path: utils.assestPath,
                    listing: false,
                    index: true
                }
            }
        });

        plugin.ext('onPreResponse', function(req, reply) {
            if (utils.shouldRenderHtml(req)) {
                reply.view(utils.viewForRequest(req), 
                    {
                        title: options.title,
                        packages: registry.list(req.query.page || 0)
                    });
                return;
            }

            reply();
        });             

        next();
    }
};