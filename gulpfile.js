(function () {
	"use strict";

	var
		gulp = require("gulp"),
		jshint = require("gulp-jshint"),
		jhStylish = require("jshint-stylish"),
		chokidar = require("glob-chokidar"),
		stylus = require("gulp-stylus"),
		nib = require("nib"),
		chalk = require("chalk"),
		fs = require("fs"),
		paths = {
			js: {
				source: ["src/js/*.js"],
				listen: ["src/js/**/*.js"],
				dest: "public/js"
			},

			css: {
				listen: ["src/styl/**/*.styl"],
				source: ["src/styl/*.styl"],
				dest: "public/css"
			}
		};

	/* Style */

	gulp.task("csswatch", ["styl"], function() {
		chokidar(paths.css.listen, function(ev, path) {
			console.log("[" + chalk.green("glob-chokidar") + "] File event '" + chalk.cyan(ev) + "' in file: " + chalk.magenta(path));

			gulp.start("styl");
		});
	});

	gulp.task("styl", function() {
		return gulp.src(paths.css.source)
			.pipe(stylus({use: [nib()], url: 'url'})
			.on('error', stylError))
			.pipe(gulp.dest(paths.css.dest));
	});

	/* Scripts */

	gulp.task("jswatch", function() {
		chokidar(paths.js.listen, function(ev, path) {
			console.log("[" + chalk.green("glob-chokidar") + "] File event '" + chalk.cyan(ev) + "' in file: " + chalk.magenta(path));

			gulp.src(path)
				.pipe(jshint({
					"undef": true,
					"unused": true,
					"devel": true,
					"latedef": "nofunc",
					"newcap": true,
					"noempty": true,
					"strict": true,
					"onevar": true
				}))
				.pipe(jshint.reporter(jhStylish))
				.pipe(gulp.dest(paths.js.dest));
		});
	});

	gulp.task("watch", ["jswatch", "csswatch"]);

	gulp.task("default", ["watch"]);

	function stylError(err) {
		console.log(err.message);
		//console.log(err.stack);

		this.emit('end');
	}
})();