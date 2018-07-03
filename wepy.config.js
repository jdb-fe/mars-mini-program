const path = require('path');
const fs = require('fs');
var prod = process.env.NODE_ENV === 'production';
var apiJson = require(path.join(__dirname, '/mock/api.json'));
const env = process.env.API_ENV ? process.env.API_ENV : 'prod';
var chokidar = require('chokidar');
var os = require('os');
var exec = require('child_process');
// One-liner for current directory, ignores .dotfiles
chokidar.watch('./src/', {
  ignored: /(^|[\/\\])\../
}).on('change', (event, pathFile) => {
  try {
    apiJson = JSON.parse(fs.readFileSync(path.join(__dirname, '/mock/api.json')).toString());
  } catch (e) {
    console.log('读取 api json文件报错了，请检查api 文件');
  }
});
module.exports = {
  wpyExt: '.wpy',
  eslint: true,
  cliLogs: !prod,
  build: {
    web: {
      htmlTemplate: path.join('src', 'index.template.html'),
      htmlOutput: path.join('web', 'index.html'),
      jsOutput: path.join('web', 'index.js')
    }
  },
  resolve: {
    alias: {
      counter: path.join(__dirname, 'src/components/counter'),
      '@': path.join(__dirname, 'src')
    },
    aliasFields: ['wepy'],
    modules: ['node_modules']
  },
  compilers: {
    less: {
      compress: prod
    },
    sass: {
      outputStyle: 'compressed'
    },
    babel: {
      sourceMap: true,
      presets: [
        'env'
      ],
      plugins: [
        'transform-class-properties',
        'transform-decorators-legacy',
        'transform-object-rest-spread',
        'transform-export-extensions',
      ]
    }
  },
  plugins: {},
  appConfig: {
    noPromiseAPI: ['createSelectorQuery']
  }
}

var pluginsObject = {
  // 压缩sass
  // module.exports.compilers['sass'] = {outputStyle: 'compressed'},
  // 压缩js
  uglifyjs: {
    filter: /\.js$/,
    config: {}
  },
  imagemin: {
    filter: /\.(jpg|png|jpeg)$/,
    config: {
      jpg: {
        quality: 80
      },
      png: {
        quality: 80
      }
    }
  }
};
var replacePlugin = {
  replace: {
    filter: /\.js$/,
    config: {
      find: /<<([^<<]*Api)>>/g,
      replace: function (matchs, word) {
        let targetApi = apiJson && apiJson[word] && apiJson[word][env];
        if (targetApi) {
          /**
           * @desc 小程序在手机预览时，需要替换localhost为本机ip地址
           */
          if(env == 'serve'){
            var interfaces = os.networkInterfaces();
            var addresses = [];
            for (var k in interfaces) {
              for (var k2 in interfaces[k]) {
                var address = interfaces[k][k2];
                if (address.family === 'IPv4' && !address.internal) {
                  addresses.push(address.address);
                }
              }
            }
            var LOCAL_SERVICE_IP = addresses && addresses[0];
            targetApi = targetApi.replace(/localhost/, LOCAL_SERVICE_IP)
          }
          return targetApi;
        } else {
          throw Error('mock/api.json 文件下没有配置对应接口  ' + word + '  对应环境的接口');
        }
      }
    }
  }
};
if (prod) {
  module.exports.plugins = Object.assign(pluginsObject, replacePlugin);
} else {
  module.exports.plugins = replacePlugin;
}

if (env === 'serve') {
  setTimeout(() => {
    exec.exec('node server.js');
  }, 1000);
} else {
  console.log('非serve环境，不启动服务器')
}
