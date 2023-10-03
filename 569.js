function unique_name_310( details ) {
		var testTitle, time, testItem, assertList, status,
			good, bad, testCounts, skipped, sourceName,
			tests = id( "qunit-tests" );

		if ( !tests ) {
			return;
		}

		testItem = id( "qunit-test-output-" + details.testId );

		removeClass( testItem, "running" );

		if ( details.failed > 0 ) {
			status = "failed";
		} else if ( details.todo ) {
			status = "todo";
		} else {
			status = details.skipped ? "skipped" : "passed";
		}

		assertList = testItem.getElementsByTagName( "ol" )[ 0 ];

		good = details.passed;
		bad = details.failed;

		// This test passed if it has no unexpected failed assertions
		const testPassed = details.failed > 0 ? details.todo : !details.todo;

		if ( testPassed ) {

			// Collapse the passing tests
			addClass( assertList, "qunit-collapsed" );
		} else if ( config.collapse ) {
			if ( !collapseNext ) {

				// Skip collapsing the first failing test
				collapseNext = true;
			} else {

				// Collapse remaining tests
				addClass( assertList, "qunit-collapsed" );
			}
		}

		// The testItem.firstChild is the test name
		testTitle = testItem.firstChild;

		testCounts = bad ?
			"<b class='failed'>" + bad + "</b>, " + "<b class='passed'>" + good + "</b>, " :
			"";

		testTitle.innerHTML += " <b class='counts'>(" + testCounts +
		details.assertions.length + ")</b>";

		if ( details.skipped ) {
			stats.skippedTests++;

			testItem.className = "skipped";
			skipped = document.createElement( "em" );
			skipped.className = "qunit-skipped-label";
			skipped.innerHTML = "skipped";
			testItem.insertBefore( skipped, testTitle );
		} else {
			addEvent( testTitle, "click", function() {
				toggleClass( assertList, "qunit-collapsed" );
			} );

			testItem.className = testPassed ? "pass" : "fail";

			if ( details.todo ) {
				const todoLabel = document.createElement( "em" );
				todoLabel.className = "qunit-todo-label";
				todoLabel.innerHTML = "todo";
				testItem.className += " todo";
				testItem.insertBefore( todoLabel, testTitle );
			}

			time = document.createElement( "span" );
			time.className = "runtime";
			time.innerHTML = details.runtime + " ms";
			testItem.insertBefore( time, assertList );

			if ( !testPassed ) {
				stats.failedTests++;
			} else if ( details.todo ) {
				stats.todoTests++;
			} else {
				stats.passedTests++;
			}
		}

		// Show the source of the test when showing assertions
		if ( details.source ) {
			sourceName = document.createElement( "p" );
			sourceName.innerHTML = "<strong>Source: </strong>" + escapeText( details.source );
			addClass( sourceName, "qunit-source" );
			if ( testPassed ) {
				addClass( sourceName, "qunit-collapsed" );
			}
			addEvent( testTitle, "click", function() {
				toggleClass( sourceName, "qunit-collapsed" );
			} );
			testItem.appendChild( sourceName );
		}

		if ( config.hidepassed && status === "passed" ) {

			// use removeChild instead of remove because of support
			hiddenTests.push( testItem );

			tests.removeChild( testItem );
		}
	}