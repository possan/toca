var TOCAModel = function() {
	this.rootObject = new THREE.Mesh();
	this.mesh_by_name = {};
	this.material_by_name = {};
	this.mesh_names = [];
	this.material_by_meshname = {};
	this.queued_textures = [];
	this.singleGeometry = new THREE.Geometry();
}

TOCAModel.prototype.load = function(def) {
	for (var j=0; j<def.hier.length; j++) {
		var hierdef = def.hier[j];

		var mtx = new THREE.Matrix4();
		mtx.set(
			hierdef.matrix[0] / 1.0,
			hierdef.matrix[4] / 1.0,
			hierdef.matrix[8] / 1.0,
			hierdef.matrix[12] / 65536.0,

			hierdef.matrix[1] / 1.0,
			hierdef.matrix[5] / 1.0,
			hierdef.matrix[9] / 1.0,
			hierdef.matrix[13] / 65536.0,

			hierdef.matrix[2] / 1.0,
			hierdef.matrix[6] / 1.0,
			hierdef.matrix[10] / 1.0,
			hierdef.matrix[14] / 65536.0,

			hierdef.matrix[3] / 1.0,
			hierdef.matrix[7] / 1.0,
			hierdef.matrix[11] / 1.0,
			hierdef.matrix[15] / 1.0
		);

		console.log(mtx);

		var tempobject = new THREE.Mesh();
		tempobject.matrixAutoUpdate = false;
		tempobject.matrix = mtx;
		tempobject.matrixWorldNeedsUpdate = true;
		// tempobject.position.x = hierdef.matrix[12] / 65536.0;
		// tempobject.position.y = hierdef.matrix[13] / 65536.0;
		// tempobject.position.z = hierdef.matrix[14] / 65536.0;
		// tempobject.scale.x = tempobject.scale.y = tempobject.scale.z = 1;

		this.rootObject.add( tempobject );

		for (var i=0; i<hierdef.meshes.length; i++) {
			var meshdef = hierdef.meshes[i];
			console.log('mesh #' + i + ' "'+meshdef.name+'" ' + meshdef.numtris+' tris.');

			// console.log('unreferenced mesh:', meshdef);
			var mesh = this._loadMesh(meshdef, j == 0, mtx);
			tempobject.add( mesh );
		}
	}

	this.singleGeometry.computeCentroids();
	this.singleGeometry.computeFaceNormals();
}

TOCAModel.prototype._startLoadingMaterial = function(nam) {
	if (this.queued_textures.indexOf(nam) != -1)
		return;

	var _this = this;
	this.queued_textures.push(nam);

	// var mat = new THREE.MeshNormalMaterial();
	var mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
	this.material_by_name[nam] = mat;

	var dummy = THREE.ImageUtils.loadTexture('raw/' + nam + '.png', {}, function(tex) {
		console.log('loaded texture', tex);
		mat.map = tex;
		mat.needsUpdate = true;

		_this.rootObject.traverse(function(child) {
			child.needsUpdate = true;
		});
	});
}

TOCAModel.prototype._getNamedMaterial = function(nam) {
	return this.material_by_name[nam];
}

TOCAModel.prototype._loadMesh = function(meshdef, first, mtx) {
	var _this = this;
	var rootmesh = new THREE.Mesh();

	var textures = [];
	var geom_by_texture = {};

	for( var i=0; i<meshdef.tris.length; i++) {
		var tridef = meshdef.tris[i];
		this._startLoadingMaterial(tridef.texture);
		if (textures.indexOf(tridef.texture) == -1) {
			textures.push(tridef.texture);
		}
	}

	textures.forEach(function(tex) {
		var geom = new THREE.Geometry();

		// copy all vertices to all meshes
		for(var i=0; i<meshdef.points.length; i++) {
			var point = meshdef.points[i];
			var vec = new THREE.Vector3(
				point.x / 65536.0,
				point.y / 65536.0,
				point.z / 65536.0
			);
			geom.vertices.push(vec);
		}
		geom_by_texture[tex] = geom;
	});

	/*
	if (first) {
		for(var i=0; i<meshdef.points.length; i++) {
			var point = meshdef.points[i];
			var vec = new THREE.Vector3(
				point.x / 65536.0,
				point.y / 65536.0,
				point.z / 65536.0
			);
			this.singleGeometry.vertices.push(vec);
		}
	}
	*/

	for( var i=0; i<meshdef.tris.length; i++) {
		var tridef = meshdef.tris[i];
		var geom = geom_by_texture[tridef.texture];

		var v0 = meshdef.points[tridef.p0];
		var v1 = meshdef.points[tridef.p1];
		var v2 = meshdef.points[tridef.p2];

		var nc = new THREE.Vector3(
			(v0.nx + v1.nx + v2.nx) / 3.0,
			(v0.ny + v1.ny + v2.ny) / 3.0,
			(v0.nz + v1.nz + v2.nz) / 3.0
		);

		var f = new THREE.Face3( tridef.p0, tridef.p1, tridef.p2 );

		f.vertexNormals = [
			new THREE.Vector3(v0.nx, v0.ny, v0.nz),
			new THREE.Vector3(v1.nx, v1.ny, v1.nz),
			new THREE.Vector3(v2.nx, v2.ny, v2.nz)
		];

		f.normal = nc;

		geom.faces.push(f);

		var firstvisble = this.singleGeometry.vertices.length;

		var t0 = new THREE.Vector3(
			v0.x / 65536.0,
			v0.y / 65536.0,
			v0.z / 65536.0
		);

		var t1 = new THREE.Vector3(
			v1.x / 65536.0,
			v1.y / 65536.0,
			v1.z / 65536.0
		);

		var t2 = new THREE.Vector3(
			v2.x / 65536.0,
			v2.y / 65536.0,
			v2.z / 65536.0
		);

		t0 = t0.applyMatrix4(mtx);
		t1 = t1.applyMatrix4(mtx);
		t2 = t2.applyMatrix4(mtx);

		this.singleGeometry.vertices.push(t0);
		this.singleGeometry.vertices.push(t1);
		this.singleGeometry.vertices.push(t2);

		var f2 = new THREE.Face3(
			firstvisble,
			firstvisble + 1,
			firstvisble + 2
		);

		this.singleGeometry.faces.push(f2);

		// }
		// }

		geom.faceVertexUvs[0].push([
			new THREE.Vector2(v0.u / 65536.0, -v0.v / 65536.0),
			new THREE.Vector2(v1.u / 65536.0, -v1.v / 65536.0),
			new THREE.Vector2(v2.u / 65536.0, -v2.v / 65536.0)
		]);
	}

	textures.forEach(function(tex) {
		var mat = _this._getNamedMaterial(tex);
		var geom = geom_by_texture[tex];

		geom.computeCentroids();
		geom.computeFaceNormals();

		var mesh = new THREE.Mesh(geom, mat);
		mesh.needsUpdate = true;

		setTimeout(function() {
			rootmesh.add( mesh );
		}, 500);
	});

	rootmesh.needsUpdate = true;
	this.mesh_by_name[meshdef.name] = rootmesh;
	this.mesh_names.push(meshdef.name);

	return rootmesh;
}

TOCAModel.prototype.setvis = function(name, vis) {
	var mesh = this.mesh_by_name[name];
	if (mesh) {
		mesh.traverse(function(child) {
			if (vis != child.visible) {
				child.visible = vis;
				child.needsUpdate = true;
			}
		});
	}
}

TOCAModel.prototype.setvis2 = function(name, vis) {
	var _this = this;
	this.mesh_names.forEach(function(name2) {
		if (name2.indexOf(name) != -1 || name == '') {
			_this.setvis(name2, vis);
		}
	});
}

TOCAModel.prototype.loadFromURL = function(url) {
	var _this = this;
	var xhr = new XMLHttpRequest();
	var length = 0;
	xhr.onreadystatechange = function () {
		if ( xhr.readyState === xhr.DONE ) {
			if ( xhr.status === 200 || xhr.status === 0 ) {
				if ( xhr.responseText ) {
					var blob = JSON.parse( xhr.responseText );
					console.log('Loaded blob', blob);
					_this.load(blob);
				} else {
					console.warn( "THREE.JSONLoader: [" + url + "] seems to be unreachable or file there is empty" );
				}
				// context.onLoadComplete();
			} else {
				console.error( "THREE.JSONLoader: Couldn't load [" + url + "] [" + xhr.status + "]" );
			}
		}
	};
	xhr.open( "GET", url, true );
	xhr.withCredentials = this.withCredentials;
	xhr.send( null );
}
