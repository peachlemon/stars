/**
 * Created by taoyong on 15/3/9.
 */
module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);

  var config = {
    pkg: grunt.file.readJSON('package.json'),
    path: {
      root: 'web',
      app: {
        js: ['<%= path.root =>/lib','<%= path.root =>/js'],
        css: '<%= path.root =>/css',
        html: '<%= path.root =>/html'
      }
    },
    watch: {
      script: {
        files: [
          '<%= path.app.js =>/*.js'
        ],
        task: [

        ]
      },
      css: {
        files: [
          '<%= path.app.css =>/*.css'
        ],
        task: [

        ]
      },
      html: {
        files: [
          '<%= path.app.html =>/*.html'
        ],
        task: [

        ]
      }
    }
  };

  grunt.initConfig(config);

  grunt.registerTask('server', function() {
    require('./server.js');
  });

  grunt.registerTask('build', ['server', 'watch']);
};