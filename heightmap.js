var HeightMap = function() {
	this.n = new SimplexNoise();
}

HeightMap.prototype.getHeight = function(x, y) {
	var f = this.n.noise(x / 250.0, y / 250.0);
	return f * 3.0 - 10.0;
}
