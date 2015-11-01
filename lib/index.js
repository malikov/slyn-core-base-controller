/*
    Base Controller
*/
"use strict";

var q = require('q');
var $ = require('jquery');
var PageManager = require('slyn-page-manager');

var controller = function(backboneView, model) {
    this.backboneView = backboneView || null;
    this.modelClass = model || null;

    this.view = null;
    this.model = null;

    this.name = 'BaseController';
}

controller.prototype.load = function(rootEl, template, params, resolve) {
    if (!rootEl)
        throw new Error("Controller" + this.name + " missing arguments : rootEl");

    if (!template)
        throw new Error("Controller" + this.name + " missing arguments : template");

    console.log('Loading : ' + this.name + ' controller');

    var deferred = q.defer();

    this.resolveData(params)
        .then(function(models) {
            this.view = PageManager.instantiateView({
                view: this.backboneView,
                params: {
                    el: rootEl,
                    template: template,
                    data: models,
                    params: params
                }
            });

            // at  this point we have all the data we need render the view
            this.render().then(function(output) {
                deferred.resolve(output);
            });
        }.bind(this)).catch(function(error) {
            console.log('error loading controller');
            deferred.reject(error);
        }.bind(this));

    return deferred.promise;
};

/*
    This function uses models to fetch data usually happens before rendering
*/
controller.prototype.resolveData = function(params) {
    var deferred = q.defer();

    if(this.modelClass !== null){
        var query = (params !== null && params.query)? params.query : {};
        
        this.model = PageManager.instantiateModel({
            model: this.modelClass,
            params: params
        });
        
        this.model.fetch({
            data: query, 
            success: function(data) {
                deferred.resolve(this.model, params);
            }.bind(this), 
            error: function(error) {
                deferred.reject(error);
            }.bind(this)});
    }else{
        setTimeout(function() {
            deferred.resolve({});
        }.bind(this), 0);
    }

    return deferred.promise;
};

controller.prototype.render = function(options) {
    var deferred = q.defer();
    this.view.render()
        .then(function() {
            // success
            deferred.resolve(this);
        }.bind(this), function() {
            // error
            deferred.reject();
        }.bind(this));
    return deferred.promise;
};

controller.prototype.unload = function() {
    // cleanup for garbage collection
    console.log('unloading ' + this.view.name + '...');
    this.view = null;
};

module.exports = controller;
