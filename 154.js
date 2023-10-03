function unique_name_80(filepath, options, yamlOptions) {
  if (!options) { options = {}; }
  if (!yamlOptions) { yamlOptions = {}; }

  var src = file.read(filepath, options);
  var result;
  grunt.verbose.write('Parsing ' + filepath + '...');
  try {
    // use the recommended way of reading YAML files
    // https://github.com/nodeca/js-yaml#safeload-string---options-
    if (yamlOptions.unsafeLoad) {
      result = YAML.load(src);
    } else {
      result = YAML.safeLoad(src);
    }
    grunt.verbose.ok();
    return result;
  } catch (e) {
    grunt.verbose.error();
    throw grunt.util.error('Unable to parse "' + filepath + '" file (' + e.message + ').', e);
  }
}