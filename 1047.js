function unique_name_616( app, configObject ) {
	if( typeof configObject !== "undefined" ) {
		configuration.directory = configObject.directory || configuration.directory;
		configuration.extension = configObject.extension || configuration.extension;
		configuration.objectNotation = configObject.objectNotation || configuration.objectNotation;
	}

	// Register routes
	app.get( "/i18n/:locale", i18nRoutes.i18n );

	if( process.env.NODE_ENV === "development" ) {
		app.get( "/i18n/:locale/:phrase", i18nRoutes.translate );
	}
}