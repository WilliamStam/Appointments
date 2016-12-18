var jsfile = [
	'vendor/components/jquery/jquery.js',
	'vendor/twbs/bootstrap-sass/assets/javascripts/bootstrap.min.js' ,
	'vendor/timrwood/moment/moment.js',
	'vendor/components/jQote2/jquery.jqote2.js',
	'ui/_plugins/jquery.bootstrap.wizard.js',
	//'vendor/components/twitter-bootstrap-wizard/jquery.bootstrap.wizard.min.js',
	'vendor/components/bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min.js',
	'ui/_js/plugins/jquery.getData.js',
	'ui/_js/plugins/jquery.ba-dotimeout.min.js',
	'vendor/Summernote/Summernote/dist/summernote.min.js',
	'ui/_js/plugins/jquery.ba-bbq.js',
	'ui/_js/_.js'
];

var jsfile_admin = [
//	'vendor/components/jquery-hotkeys/jquery.hotkeys.js',
//	'vendor/components/jquery-mousewheel/jquery.mousewheel.js',
//	'vendor/components/nicescroll/jquery.nicescroll.js',
	

//	'vendor/components/hideseek/jquery.hideseek.min.js',
//	'vendor/moxiecode/plupload/js/plupload.full.min.js',
//	'vendor/moxiecode/plupload/js/jquery.plupload.queue/jquery.plupload.queue.js',
	'vendor/components/toastr/toastr.js',
	'vendor/components/TouchSwipe-Jquery-Plugin/jquery.touchSwipe.min.js',
	'vendor/ivaynberg/select2/dist/js/select2.full.min.js',

	'vendor/twitter/typeahead.js/dist/typeahead.bundle.min.js',

	'vendor/weareoutman/clockpicker/dist/bootstrap-clockpicker.min.js',

	'ui/_js/plugins/jquery.highlight.js',
//	'ui/_js/plugins/jquery.ui.touch-punch.min.js',
//	'ui/_js/plugins/jquery.keepalive.js',
//	'ui/_js/plugins/jquery.plupload.js',
	'ui/admin/_js/_.js',
];

module.exports = function (grunt) {
	require('time-grunt')(grunt);
	require('jit-grunt')(grunt, {
		sass: 'grunt-sass'
	});
	
	
	grunt.initConfig({
		
		concat: {
			js: {
				options: {
					separator: ';',
					stripBanners: true,
					sourceMap :true,
					sourceMapName : 'ui/javascript.js.map'
				},
				src: jsfile,
				dest: 'ui/javascript.js',
				nonull: true
			},
			js_quick: {
				options: {
					separator: ';',
					stripBanners: true
				},
				src: jsfile,
				dest: 'ui/javascript.js',
				nonull: true
			},
			js_admin: {
				options: {
					separator: ';',
					stripBanners: true,
					sourceMap :true,
					sourceMapName : 'ui/admin/_javascript.js.map'
				},
				src: jsfile_admin,
				dest: 'ui/admin/_javascript.js',
				nonull: true
			},
			js_admin_quick: {
				options: {
					separator: ';',
					stripBanners: true
				},
				src: jsfile_admin,
				dest: 'ui/admin/_javascript.js',
				nonull: true
			}
			
			
		},
		clean: {
			map: ["ui/**/*.map"],
		},
		
		uglify: {
			js: {
				
				files: {
					'ui/javascript.js': 'ui/javascript.js',
					'ui/admin/_javascript.js': 'ui/admin/_javascript.js',
				}
			}
		},
		sass: {
			options: {
				sourceMap: true
			},
			style: {
				files: {
					"ui/style.css": "ui/_sass/base.scss",
					"ui/front/_style.css": "ui/front/_sass/base.scss",
					"ui/admin/_style.css": "ui/admin/_sass/base.scss",
				}
			}
		},
		cssmin: {
			options: {
				report: "min",
				keepSpecialComments: 0,
				shorthandCompacting: true
			},
			target: {
				files: {
					'ui/style.css': 'ui/style.css',
					'ui/front/_style.css': 'ui/front/_style.css',
					'ui/admin/_style.css': 'ui/admin/_style.css',
				}
			}
		},
		postcss: {
			options: {
				map: false,
				processors: [
					require('autoprefixer')({
						browsers: ['last 2 versions']
					})
				]
			},
			build: {
				src: 'ui/**/*.css'
				
			}
		},
		watch: {
			js: {
				files: ['js/*.js'],
				tasks: ['concat:js'],
				options: {
					spawn: false,
					livereload: true
				}
			},
			css: {
				files: ['sass/*.scss'],
				tasks: ['sass:style'],
				options: {
					spawn: false,
					livereload: true
				}
			}
		}
		
	});
	
	
	
	
	
	
	grunt.registerTask('jsmin', ['uglify:js']);
	grunt.registerTask('js', ['concat:js_quick','concat:js_admin_quick','clean:map']);
	grunt.registerTask('jsmap', ['concat:js','concat:js_admin']);
	grunt.registerTask('css', ['sass:style']);
	grunt.registerTask('autoprefixer', ['postcss:build']);
	grunt.registerTask('build', ['concat:js','concat:js_admin','sass:style', 'uglify:js','postcss:build','cssmin','clean:map']);
	grunt.registerTask('default', ['watch']);

};