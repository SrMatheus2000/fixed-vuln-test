function unique_name_407 (name) {
   var Cacheman = require('cacheman');
   var _ = require('underscore');
   var options = {};
   // Get configuration
   var config = sails.config.cacheman;
   if (config === undefined) {
        throw new Error('No configuration file found. Please add the configuration app/config/cacheman.js');
   }
   // if a valid driver is selected.
   if(_.indexOf(['memory', 'redis', 'mongo', 'file'], config.driver) < 0) {
        throw new Error("Invalid Driver selected. Please choose from ('memory', 'redis', 'mongo', 'file')");
   }

   var cache = new Cacheman(name, config[config.driver]);

   return cache;
}