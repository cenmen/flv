const http = require("http")
const fs = require("fs") //引入文件读取模块

http.createServer(function (req, res) {
  const url = req.url
  const file = __dirname + url

  fs.readFile(file, function (err, data) {
    if (err) {
      res.writeHeader(404, {
        "content-type": 'text/html;charset="utf-8"',
      })
      res.write("<h1>404 Not Found</h1>")
      res.end()
    } else {
      res.writeHeader(200, {
        "Access-Control-Allow-Origin": "*",
      })
      res.write(data)
      res.end()
    }
  })
}).listen(1001)

console.log("服务器开启成功")
