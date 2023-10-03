function unique_name_113(trainset) {

			// console.log(JSON.stringify(this.modelFileString, null, 4))
			_.each(trainset, function(value, key, list){
				trainset[key].output = 0
			}, this)

			var testFile = svmcommon.writeDatasetToFile(
                                        trainset, this.bias, /*binarize=*/false, "/tmp/test_"+this.timestamp, "SvmLinear", FIRST_FEATURE_NUMBER);

			var command = this.test_command
			var args = [testFile, this.modelFileString, "/tmp/out_" + this.timestamp];

			var output = child_process.execFileSync(command, args)
			console.log(command)

			var result = fs.readFileSync("/tmp/out_" + this.timestamp, "utf-8").split("\n")

			return result
		}