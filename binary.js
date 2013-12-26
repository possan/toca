var fs = require('fs');

var BinaryFileObject = function() {
	this.length = 0;
	this.position = 0;
	this.buffer = null;
}

BinaryFileObject.prototype.load = function(fn) {
	this.buffer = fs.readFileSync(fn);
	// console.log(this.buffer);
	this.length = this.buffer.length;
	this.position = 0;
}

BinaryFileObject.prototype.skip = function(b) {
	this.position += b;
	return b;
}

BinaryFileObject.prototype.skipTo = function(b) {
	this.position = b;
	return b;
}

BinaryFileObject.prototype.readUInt8 = function() {
	var b = this.buffer.readUInt8(this.position);
	this.position ++;
	return b;
}

BinaryFileObject.prototype.readUInt16 = function() {
	var b = this.buffer.readUInt16LE(this.position);
	this.position += 2;
	return b;
}

BinaryFileObject.prototype.readUInt32 = function() {
	var b = this.buffer.readUInt32LE(this.position);
	this.position += 4;
	return b;
}

BinaryFileObject.prototype.readInt32 = function() {
	var b = this.buffer.readInt32LE(this.position);
	this.position += 4;
	return b;
}

BinaryFileObject.prototype.readString = function(len) {
	var ret = '';
	var found_end = false;
	for(var i=0; i<len; i++) {
		var ch = this.readUInt8();
		if (ch > 32 && ch < 128 && !found_end)
			ret += String.fromCharCode(ch);
		else
			found_end = true;
	}
	return ret;
}

BinaryFileObject.prototype.readBytes = function(len) {
	var ret = new Buffer(len);
	for(var i=0; i<len; i++)
		ret[i] = this.readUInt8();
	return ret;
}

var BinaryFile = {}

BinaryFile.open = function(fn) {
	var fp = new BinaryFileObject();
	fp.load(fn);
	return fp;
}

exports.BinaryFile = BinaryFile;
