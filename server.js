// Require the framework and instantiate it
const fastify = require('fastify')();
fastify.register(require('fastify-formbody'));
const fs = require('fs');
const path = require('path');
const os = require('os');
// Declare a route
fastify.get('/data/:fileName', responseMock);
fastify.post('/data/:fileName', responseMock);
/**
 * 读取json mock 数据
 * @param {*} request
 * @param {*} reply
 */
async function responseMock(request, reply) {
  console.log('--------------')
  let fileName = request.params.fileName;
  let obj = null;
  try {
    // require 有缓存问题
    let objStr = fs.readFileSync(path.join(__dirname, '/mock/data/' + fileName)).toString();
    if (objStr) {
      obj = JSON.parse(objStr);
    }
  } catch (e) {
    console.log('无法打开 => ' + fileName + ' 文件');
  }

  console.log('----------',fileName);

  if (!obj || obj == undefined) {
    reply
      .code(404)
      .header('Content-Type', 'application/json')
      .send({
        err: '你请求的mock 数据不存在'
      })
  } else {
    reply
      .code(200)
      .header('Content-Type', 'application/json')
      .send(obj)
  }

}

function getLocalIP(){
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
  return LOCAL_SERVICE_IP;
}

// Run the server!
const start = async () => {
  try {
    let ip = getLocalIP();
    await fastify.listen(3000,ip)
    fastify.log.info(`server listening on ${fastify.server.address().port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()
