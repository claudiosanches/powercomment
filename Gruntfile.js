module.exports = function(grunt) {
    "use strict";

    grunt.initConfig({

        // gets the package vars
        pkg: grunt.file.readJSON("package.json"),
        svn_settings: {
            path: "../../../wp_plugins/<%= pkg.name %>",
            tag: "<%= svn_settings.path %>/tags/<%= pkg.version %>",
            trunk: "<%= svn_settings.path %>/trunk",
            exclude: [
                ".git/",
                ".gitignore",
                ".sass-cache/",
                "node_modules/",
                "Gruntfile.js",
                "README.md",
                "package.json",
                "*.zip",
                "js/powercomment-admin.js",
                "js/jquery.validate.min.js",
                "js/powercomment.js"
            ]
        },

        // javascript linting with jshint
        jshint: {
            options: {
                "bitwise": true,
                "eqeqeq": true,
                "eqnull": true,
                "immed": true,
                "newcap": true,
                "es5": true,
                "esnext": true,
                "latedef": true,
                "noarg": true,
                "node": true,
                "undef": true,
                "browser": true,
                "trailing": true,
                "jquery": true,
                "curly": true
            },
            all: [
                "Gruntfile.js",
                "js/powercomment-admin.js",
                "js/powercomment.js"
            ]
        },

        // uglify to concat and minify
        uglify: {
            dist: {
                files: {
                    "js/powercomment.min.js": ["js/jquery.validate.min.js", "js/powercomment.js"],
                    "js/powercomment-admin.min.js": ["js/powercomment-admin.js"]
                }
            }
        },

        // watch for changes and trigger compass, jshint and uglify
        watch: {
            js: {
                files: [
                    "<%= jshint.all %>"
                ],
                tasks: ["jshint", "uglify"]
            }
        },

        // rsync commands used to take the files to svn repository
        rsync: {
            tag: {
                src: "./",
                dest: "<%= svn_settings.tag %>",
                recursive: true,
                exclude: "<%= svn_settings.exclude %>"
            },
            trunk: {
                src: "./",
                dest: "<%= svn_settings.trunk %>",
                recursive: true,
                exclude: "<%= svn_settings.exclude %>"
            }
        },

        // shell command to commit the new version of the plugin
        shell: {
            svn_add: {
                command: "svn add --force * --auto-props --parents --depth infinity -q",
                options: {
                    stdout: true,
                    stderr: true,
                    execOptions: {
                        cwd: "<%= svn_settings.path %>"
                    }
                }
            },
            svn_commit: {
                command: "svn commit -m 'updated the plugin version to <%= pkg.version %>'",
                options: {
                    stdout: true,
                    stderr: true,
                    execOptions: {
                        cwd: "<%= svn_settings.path %>"
                    }
                }
            }
        },

        // creates a zip of the plugin
        zipdir: {
            "powercomment": {
                src: ["./"],
                dest: "./<%= pkg.name %>.zip",
                exclude: "<%= svn_settings.exclude %>"
            }
        }

    });

    // load tasks
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-rsync");
    grunt.loadNpmTasks("grunt-shell");
    grunt.loadNpmTasks("grunt-wx-zipdir");

    // default task
    grunt.registerTask("default", [
        "jshint",
        "uglify"
    ]);

    // deploy task
    grunt.registerTask("deploy", [
        "default",
        "rsync:tag",
        "rsync:trunk",
        "shell:svn_add",
        "shell:svn_commit"
    ]);

    // zip task
    grunt.registerTask("zip", [
        "default",
        "zipdir"
    ]);
};
