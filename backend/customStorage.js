var fs = require('fs')

function getDestination (req, file, cb) {
  cb(null, '/public/uploads')
}

function MyCustomStorage (opts) {
  this.getDestination = (opts.destination || getDestination)
}

MyCustomStorage.prototype._handleFile = function _handleFile (req, file, cb) {
  this.getDestination(req, file, function (err, path) {
    if (err) return cb(err)

    const writeStream = fs.createWriteStream(path, { flags: 'a' });

    file.stream.pipe(writeStream)
      .on('error', cb)
      .on('finish', () => {
        cb(null, {
          path: path,
          size: writeStream.bytesWritten
        });
      });
  })
}

MyCustomStorage.prototype._removeFile = function _removeFile (req, file, cb) {
  fs.unlink(file.path, cb)
}

module.exports = function (opts) {
  return new MyCustomStorage(opts)
}