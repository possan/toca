var BinaryFile = require('./binary').BinaryFile;
var fs = require('fs');
var path = require('path');
var util = require('util');
var stream = require('stream');
var memorystreams = require('memory-streams');
var events = require('events');
var Buffer = require('buffer').Buffer;
var PNG = require('node-png').PNG;
var Writable = stream.Writable;


function parse_bfa_image(fn, fnout) {
	console.log('Parse image x: ' + fn + ' -> ' + fnout);
	var f2 = BinaryFile.open(fn);
	var key = f2.readUInt16();
	console.log('key', key);
	f2.readUInt16();
	if (key == 0x410 || key == 0x2B4) {
		var w = f2.readUInt16();
		var h = f2.readUInt16();
		console.log('width='+w+', height='+h);
		console.log('dummy4='+f2.readUInt16());
		var bpc = f2.readUInt8();
		console.log('bpc='+bpc);
		f2.readUInt8();
		if (bpc == 8) {
			f2.readUInt16();
			var c = f2.readUInt16();
			console.log('colors='+c); // colors?
			var palette = [];
			for(var i=0; i<c; i++) {
				var _r = f2.readUInt8();
				var _g = f2.readUInt8();
				var _b = f2.readUInt8();
				var _a = f2.readUInt8();
				palette[i] = {
					r: _r,
					g: _g,
					b: _b,
					a: 0xFF
				};
			}
			console.log('offset after palette '+f2.position);
			if (h < 1024) {
				var png = new PNG({
				    width: w,
				    height: h,
				    filterType: -1
				});
				for(var y=0; y<h; y++) {
					for(var x=0; x<w; x++) {
						// var b = 0;
						var b = f2.readUInt8();
						// var oo = (((h-1)-y) * w + ((w-1)-x)) * 4;
						// var oo = (((h-1)-y) * w + x) * 4;
						var oo = (((h-1)-y) * w + x) * 4;
						png.data[oo+0] = palette[b].r;
						png.data[oo+1] = palette[b].g;
						png.data[oo+2] = palette[b].b;
						png.data[oo+3] = palette[b].a;
					}
				}
				console.log('Writing ' + fnout);

				function MyStream(options) {
					Writable.call(this, options);
				}

				util.inherits(MyStream, Writable);

				var bufs = [];

				MyStream.prototype._write = function (chunk, enc, cb) {
					bufs.push(chunk);
					cb();
				};

				var ws = new MyStream();

				png.pack().pipe(ws);

				png.on('end', function(e) {
					var allbuf = Buffer.concat(bufs);
					console.log('Writing "' + fnout + '" (' + allbuf.length + ' bytes)');
					fs.writeFileSync(fnout, allbuf);

				});
			}
		}
	} else {
		console.error('Unknown key: ' + key);
	}
}


exports.parse_m3d = function(f, basename) {
	console.log('parse_m3d(?,'+basename+')')
	var tag = f.readString(4);
	console.log('M3D', tag);
	if (tag == 'M3D') {

		var objects = [];

		var object = {
			hier: [],
			meshes: [],
			textures: []
		};

		object.unknown1 = f.readUInt16();
		object.unknown2 = f.readUInt16();
		object.unknown3 = f.readUInt16();
		object.unknown4 = f.readUInt16();

		object.numobjects = totalobjects = f.readUInt16();
		console.log('total objects: ' + totalobjects);

		object.nummeshes = nummeshes = f.readUInt16();
		console.log('num meshes: ' + nummeshes);

		object.nummaterials = nummaterials = f.readUInt16();
		console.log('num materials: ' + nummaterials);

		object.unknown5 = f.readUInt16();
		object.unknown6 = f.readUInt32();
		object.unknown7 = f.readUInt32();
		object.unknown8 = f.readUInt32();

		for(var i=0; i<totalobjects; i++) {
			var before = f.position;
			var len = f.readUInt32();
			// console.log('skip block', len);

			if (len == 0x50) {
				// root object?

				var hierdef = {}
				hierdef.type = 'root?';
				hierdef.meshes = [];

				hierdef.id = i;
				hierdef.parent = f.readUInt32();

				hierdef.matrix = [];
				hierdef.matrix.push(f.readInt32() / 65536.0);
				hierdef.matrix.push(f.readInt32() / 65536.0);
				hierdef.matrix.push(f.readInt32() / 65536.0);
				hierdef.matrix.push(f.readInt32() / 65536.0);

				hierdef.matrix.push(f.readInt32() / 65536.0);
				hierdef.matrix.push(f.readInt32() / 65536.0);
				hierdef.matrix.push(f.readInt32() / 65536.0);
				hierdef.matrix.push(f.readInt32() / 65536.0);

				hierdef.matrix.push(f.readInt32() / 65536.0);
				hierdef.matrix.push(f.readInt32() / 65536.0);
				hierdef.matrix.push(f.readInt32() / 65536.0);
				hierdef.matrix.push(f.readInt32() / 65536.0);

				hierdef.matrix.push(f.readInt32() / 1.0);
				hierdef.matrix.push(f.readInt32() / 1.0);
				hierdef.matrix.push(f.readInt32() / 1.0);
				hierdef.matrix.push(f.readInt32() / 65536.0);

				hierdef.unknown1 = f.readUInt32();
				hierdef.mesh = f.readUInt32();

				object.hier.push(hierdef);
			}

			if (len == 0x54) {

				// sub object?

				var hierdef = {}

				hierdef.type = 'child?';
				hierdef.meshes = [];

				hierdef.id = i;
				hierdef.parent = f.readUInt32();

				hierdef.matrix = [];
				hierdef.matrix.push(f.readInt32() / 65536.0);
				hierdef.matrix.push(f.readInt32() / 65536.0);
				hierdef.matrix.push(f.readInt32() / 65536.0);
				hierdef.matrix.push(f.readInt32() / 65536.0);

				hierdef.matrix.push(f.readInt32() / 65536.0);
				hierdef.matrix.push(f.readInt32() / 65536.0);
				hierdef.matrix.push(f.readInt32() / 65536.0);
				hierdef.matrix.push(f.readInt32() / 65536.0);

				hierdef.matrix.push(f.readInt32() / 65536.0);
				hierdef.matrix.push(f.readInt32() / 65536.0);
				hierdef.matrix.push(f.readInt32() / 65536.0);
				hierdef.matrix.push(f.readInt32() / 65536.0);

				hierdef.matrix.push(f.readInt32() / 1.0);
				hierdef.matrix.push(f.readInt32() / 1.0);
				hierdef.matrix.push(f.readInt32() / 1.0);
				hierdef.matrix.push(f.readInt32() / 65536.0);

				hierdef.unknown1 = f.readUInt32();
				hierdef.unknown2 = f.readUInt32();
				hierdef.mesh = f.readUInt16();
				hierdef.unknown3 = f.readUInt16();

				object.hier.push(hierdef);
			}

			f.skipTo(before + len);
		}

		var point_output = [];
		var line_output = [];

		for(var i=0; i<nummeshes; i++) {
			var meshdef = {
				id: i,
				points: [],
				tris: []
			};

			var before = f.position;
			var name = meshdef.name = f.readString(12);
			console.log('object name', name);
			var len2 = f.readUInt32();

			var numpoints = meshdef.numpoints = f.readUInt16();
			var numtris = meshdef.numtris = f.readUInt16();

			meshdef.unknown1 = f.readInt32();
			meshdef.unknown2 = f.readInt32();
			meshdef.unknown3 = f.readInt32();
			meshdef.unknown4 = f.readInt32();
			meshdef.unknown5 = f.readInt32();
			meshdef.unknown6 = f.readInt32();
			meshdef.unknown7 = f.readInt32();

			for(var j=0; j<numpoints; j++) {
				var pointdef = {};
				pointdef.x = f.readInt32();
				pointdef.y = f.readInt32();
				pointdef.z = f.readInt32();
				pointdef.u = f.readInt32();
				pointdef.v = f.readInt32();
				pointdef.nx = f.readInt32();
				pointdef.ny = f.readInt32();
				pointdef.nz = f.readInt32();
				meshdef.points.push(pointdef);
			}

			// 0x88 = 34x4

			for(var j=0; j<numtris; j++) {
				var tridef = {}
				tridef.unknown0 = f.readUInt16()
				tridef.p0 = f.readUInt16();
				tridef.p1 = f.readUInt16();
				tridef.p2 = f.readUInt16();
				tridef.material = f.readUInt16();
				tridef.c0 = f.readUInt32();
				tridef.c1 = f.readUInt32();
				tridef.c2 = f.readUInt32();
				tridef.unknown2 = f.readUInt16();
				meshdef.tris.push(tridef);
			}

			// f.skipTo(before + len2);
			// console.log();

			object.meshes.push(meshdef);
		}

		for(var i=0; i<nummaterials; i++) {
			var tex = f.readString(12);
			console.log('tex', i, tex);

			object.textures.push({
				id: i,
				texture: tex
			});
		}

		// reassign textures.
		for(var i=0; i<object.meshes.length; i++) {
			var meshdef = object.meshes[i];
			for(var j=0; j<meshdef.tris.length; j++) {
				var tex = object.textures[meshdef.tris[j].material];
				if (tex) {
					meshdef.tris[j].texture = tex.texture;
				}
				delete(meshdef.tris[j].material);
			}
		}

		for(var i=0; i<object.hier.length; i++) {
			var hierdef = object.hier[i];
			/* for(var j=0; j<meshdef.tris.length; j++) {
				meshdef.tris[j].texture = object.textures[meshdef.tris[j].material];
				delete(meshdef.tris[j].material);
			} */
			// hierdef.meshes = [];
			object.meshes[hierdef.mesh].remove = true;
			hierdef.meshes.push(object.meshes[hierdef.mesh]);
		}

		/*
		object.root = {
			matrix: [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1],
			meshes: [],
		}
		*/

		for(var i=0; i<object.meshes.length; i++) {
			var meshdef = object.meshes[i];
			if (!meshdef.remove) {
				object.hier[0].meshes.push(meshdef);
			}
		}

		delete(object.meshes);

		return object;
	}

	return undefined;
}

exports.save_m3d_file = function(object, basename) {
	var fn = 'raw/'+basename+'.m3d-object.json';
	console.log('write', fn);
	fs.writeFileSync(fn, JSON.stringify(object, null, 2));

	fn = 'raw/'+basename+'.m3d-object.js';
	console.log('write', fn);
	fs.writeFileSync(fn, 'var file_object = ' + JSON.stringify(object, null, 2) + ';');
}

exports.parse_m3d_file = function(fn) {
	console.log('parse_m3d_file('+fn+')')
	var basename = path.basename(fn, '.m3d');
	var f = BinaryFile.open(fn);
	var obj = exports.parse_m3d(f, basename);
	if (obj) {
		exports.save_m3d_file(obj, basename);
	}
}

exports.parse_bfa = function(f, basename) {
	var nume = f.readUInt16();
	console.log('num entities', nume);

	var l = f.readUInt16();
	console.log('dummy=' + l);

	var l2 = f.readUInt16();
	console.log('dummy='+ l2);

	var entries = [];

	var object = {};

	for(var i=0; i<nume; i++) {

		// 1070 bytes header innan 64k data
		// 24 bytes per entry

		var na = f.readString(12);
		console.log('filename: "' + na + '"');

		var l3 = f.readUInt16();
		console.log('dummy='+ l3);

		var index = f.readUInt16();
		console.log('index='+ index);

		var l4 = f.readUInt32();
		console.log('size='+ l4);

		var l = f.readUInt16();
		console.log('dummy=' + l);

		var l2 = f.readUInt16();
		console.log('dummy='+ l2);

		entries.push({
			// output_filename: 'raw/'+basename+'_' + i + '_'+na,
			// raw_filename: 'raw/'+basename+'_'+na,
			// output_filename: 'raw/'+basename+'_'+na+'.png',
			raw_filename: 'raw/'+na,
			output_filename: 'raw/'+na+'.png',
			// filename: na,
			index: index,
			size: l4
		});
	}

	entries.forEach(function(e) {
		var data = f.readBytes(e.size);
		console.log('writing raw file: ' + e.raw_filename);
		fs.writeFileSync(e.raw_filename, data);
	});

	entries.forEach(function(e) {
		parse_bfa_image(e.raw_filename, e.output_filename);
	});
}

exports.parse_bfa_file = function(fn) {
	var basename = path.basename(fn, '.bfa');
	var f = BinaryFile.open(fn);
	exports.parse_bfa(f, basename);
}

exports.parse_bfx = function(f2, basename) {
	// console.log('basename', basename);
	// console.log('length:', f2.length);
	var merged = {
		hier: [],
		meshes: [],
		textures: []
	};

	var n = 0;
	while(f2.position < f2.length) {
		// console.log('position before:', f2.position);
		f2.readUInt32(); // length
		var obj = exports.parse_m3d(f2, basename+'-'+n);
		if (obj) {
			merged = exports.concat_object(merged, obj);
		} else {
			return false;
		}
		// console.log('position after:', f2.position);
		n ++;
	}

	exports.save_m3d_file(merged, basename+'-merged');
	return true;
}

exports.parse_bfx_file = function(fn) {
	var basename = path.basename(fn, '.bfx');
	var f = BinaryFile.open(fn);
	exports.parse_bfx(f, basename);
}

exports.concat_object = function(old, neu) {
	var ret = {
		hier: [],
		// meshes: [],
		textures: []
	};

	old.hier.forEach(function(h) { ret.hier.push(h); });
	neu.hier.forEach(function(h) { ret.hier.push(h); });

	// old.meshes.forEach(function(h) { ret.meshes.push(h); });
	// neu.meshes.forEach(function(h) { ret.meshes.push(h); });

	old.textures.forEach(function(h) { ret.textures.push(h); });
	neu.textures.forEach(function(h) { ret.textures.push(h); });

	return ret;
}


