'use strict';
var yeoman = require('yeoman-generator');
var changeCase = require('change-case');
var chalk = require('chalk');
var path = require('path');
var yosay = require('yosay');
var process = require('process');
var fs = require('fs-extra');
var glob = require('glob');
var replace = require('replace');

module.exports = yeoman.generators.Base.extend({
  initializing: function () {
    this.pkg = require('../package.json');
  },
  askForProjectName: function () {
    var done = this.async();

    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the ' + chalk.red('Hedley') + ' generator!'
    ));

    var prompts = [{
      name: 'projectName',
      message: 'What is the project machine name?',
      default: 'skeleton'
    }];

    this.prompt(prompts, function (props) {
      this.projectName = props.projectName;

      done();
    }.bind(this));
  },

  askForGithubRepo: function () {
    var done = this.async();

    var prompts = [{
      name: 'githubRepo',
      message: 'What is the GitHub repo URL?',
      default: ''
    }];

    this.prompt(prompts, function (props) {
      this.githubRepo = props.githubRepo;

      done();
    }.bind(this));
  },


  writing: {
    app: function() {
      var self = this;
      var files = glob.sync(self.templatePath() + '/**/*');

      files.forEach(function(file) {
        if (fs.lstatSync(file).isDirectory()) {
          // Don't try to copy a directory.
          return;
        }

        var fileName = file.replace(self.templatePath('/'), '');
        var newFileName = fileName
          .replace(/skeleton/g, self.projectName)
          .replace(/Skeleton/g, changeCase.pascalCase(self.projectName));


        var dir = path.dirname(newFileName);
        var baseName = path.basename(newFileName);
        var extension = path.extname(baseName);

        if (extension !== '.scss') {
          // If not a SCSS file, convert the prefix of the underscore to a dot.
          baseName = baseName.replace(/^_/g, '.');
        }

        newFileName = dir ? dir + '/' + baseName : baseName;

        if (extension !== '.png') {
          // Not an image.
          var contents = self.fs.read(self.templatePath(fileName));
          var newContents = contents
            .replace(/skeleton/g, self.projectName)
            .replace(/Skeleton/g, changeCase.pascalCase(self.projectName));

          self.fs.write(newFileName, newContents);
        }
        else {
          self.fs.copy(self.templatePath(fileName), self.destinationPath(newFileName));
        }

      });
    }
  },

  install: {

    /**
     * Install bower/ npm on the "client" directory.
     */
    client: function() {
      if (this.options['skip-install']) {
        // @todo: Improve message.
        this.log('Skip install');
        return;
      }

      this.log('bower install');
      this.bowerInstall(null, {cwd: 'client'});

      this.log('npm install');
      this.npmInstall(null, {cwd: 'client'});

      this.log('Composer install');
      this.spawnCommand('composer', ['install'], {cwd: './behat'});

      this.log('Drupal install');
      this.spawnCommand('bash', ['install', '-dly']);
    }
  }
});