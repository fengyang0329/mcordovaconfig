#!/usr/bin/env node


/**********
 * Globals
 **********/
var TAG = "cordova-custom-config";
var SCRIPT_NAME = "applyCustomConfig.js";

// Pre-existing Cordova npm modules
var deferral, path, cwd;

// Npm dependencies
var logger,
    fs,
    _ ,
    et,
    plist,
    xcode,
    tostr,
    os,
    fileUtils;

// Other globals
var hooksPath;

module.exports = function(ctx){
   
try{
        deferral = require('q').defer();
        path = require('path');
        cwd = path.resolve();

        hooksPath = path.resolve(ctx.opts.projectRoot, "plugins", ctx.opts.plugin.id, "hooks");
        logger = require(path.resolve(hooksPath, "logger.js"))(ctx);

        applyCustomConfig.loadDependencies(ctx);
    }catch(e){
        e.message = TAG + ": Error loading dependencies for "+SCRIPT_NAME+" - ensure the plugin has been installed via cordova-fetch or run 'npm install cordova-custom-config': "+e.message;
        if(typeof deferral !== "undefined"){
            deferral.reject(e.message);
            return deferral.promise;
        }
        throw e;
    }

    try{
        logger.verbose("Running " + SCRIPT_NAME);
        applyCustomConfig.init(ctx);
    }catch(e){
        e.message = TAG + ": Error running "+SCRIPT_NAME+": "+e.message;
        if(typeof deferral !== "undefined"){
            deferral.reject(e.message);
            return deferral.promise;
        }
        throw e;
    }
    return deferral.promise;
};