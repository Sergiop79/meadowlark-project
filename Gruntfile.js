module.exports = function (grunt) {
  'use strict';

  // load plugins
  [
    'grunt-cafe-mocha',
    'grunt-contrib-jshint',
    'grunt-exec',
  ].forEach(function (task) {
    grunt.loadNpmTasks(task);
  });


  // configure plugins
  grunt.initConfig({
    cafemocha: {
      all: {
        src: 'qa/tests-*.js',
        options: {
          ui: 'tdd'
        }
      }
    },

    jshint: {
      options: {
        node: true,
        globals: {
          test: true,
          suite: true,
          setup: true
        }
      },
      app: ['meadowlark.js', 'public/js/**/*.js', 'lib/**/*.js'],
      qa: ['Gruntfile.js', 'public/qa/**/*.js', 'qa/**/*.js']
    },

    exec: {
      linkchecker: {
        cmd: 'linkchecker http://localhost:3000'
      }
    }
  });

  // register tasks
  grunt.registerTask('default', ['cafemocha', 'jshint', 'exec']);
};
