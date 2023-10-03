function InstallDots(o) {
	this.__path 		= o.path || "./";
	if (this.__path[this.__path.length-1] !== '/') this.__path += '/';
	this.__destination	= o.destination || this.__path;
	if (this.__destination[this.__destination.length-1] !== '/') this.__destination += '/';
	this.__global		= o.global || "window.render";
	this.__rendermodule	= o.rendermodule || {};
	this.__settings 	= Object.prototype.hasOwnProperty.call(o,"templateSettings") ? copy(o.templateSettings, copy(doT.templateSettings)) : undefined;
	this.__includes		= {};
}