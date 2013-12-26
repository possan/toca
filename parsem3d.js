var BinaryFile = require('./binary').BinaryFile;
var fs = require('fs');
var path = require('path');
var Buffer = require('buffer').Buffer;
var format = require('./format');

var files = [
	"./Data/Data/Cars/Dashes/Support/COBRA.m3d",
	"./Data/Data/Cars/Dashes/Support/fford.m3d",
	"./Data/Data/Cars/Dashes/Support/FIESTINT.m3d",
	"./Data/Data/Cars/Dashes/Support/JAG.m3d",
	"./Data/Data/Cars/Dashes/Support/laguna.m3d",
	"./Data/Data/Cars/Dashes/Support/LISTER.m3d",
	"./Data/Data/Cars/Dashes/Support/SCORPINT.m3d",
	"./Data/Data/Cars/Dashes/Support/tvr.m3d",
	"./Data/Data/Cars/Dashes/Touring/406.m3d",
	"./Data/Data/Cars/Dashes/Touring/a4.m3d",
	"./Data/Data/Cars/Dashes/Touring/accord.m3d",
	"./Data/Data/Cars/Dashes/Touring/laguna.m3d",
	"./Data/Data/Cars/Dashes/Touring/mondeo.m3d",
	"./Data/Data/Cars/Dashes/Touring/primera.m3d",
	"./Data/Data/Cars/Dashes/Touring/s40.m3d",
	"./Data/Data/Cars/Dashes/Touring/Vectra.m3d",
	"./Data/Data/Cars/Fe/jag.m3d",
	"./Data/Data/Cars/Fe/storm.m3d",
	"./Data/Data/Cars/Fe/tvr.m3d",
	"./Data/Data/Cars/Support/allff2.m3d",
	"./Data/Data/Cars/Support/cobpcall.m3d",
	"./Data/Data/Cars/Support/fiesta.m3d",
	"./Data/Data/Cars/Support/jagpc.m3d",
	"./Data/Data/Cars/Support/LISTEXP.m3d",
	"./Data/Data/Cars/Support/scorp.m3d",
	"./Data/Data/Cars/Support/TVRS12.m3d",
	"./Data/Data/Cars/Touring/ALLAUDI.m3d",
	"./Data/Data/Cars/Touring/ALLhon.m3d",
	"./Data/Data/Cars/Touring/ALLmon.m3d",
	"./Data/Data/Cars/Touring/ALLNISS.m3d",
	"./Data/Data/Cars/Touring/ALLPEU.m3d",
	"./Data/Data/Cars/Touring/ALLREN.m3d",
	"./Data/Data/Cars/Touring/ALLVEC.m3d",
	"./Data/Data/Cars/Touring/ALLVOL.m3d",
	"./Data/Data/Fe/OBJECTS/Cont/JOYPAD.m3d",
	"./Data/Data/Fe/OBJECTS/Cont/JOYSTIK.m3d",
	"./Data/Data/Fe/OBJECTS/Cont/KEYBORD.m3d",
	"./Data/Data/Fe/OBJECTS/Cont/STEER.m3d",
	"./Data/Data/Podium/bhcrowds.m3d",
	"./Data/Data/Podium/brcrowds.m3d",
	"./Data/Data/Podium/crcrowds.m3d",
	"./Data/Data/Podium/cup.m3d",
	"./Data/Data/Podium/docrowds.m3d",
	"./Data/Data/Podium/kncrowds.m3d",
	"./Data/Data/Podium/oucrowds.m3d",
	"./Data/Data/Podium/sicrowds.m3d",
	"./Data/Data/Podium/sncrowds.m3d",
	"./Data/Data/Podium/thcrowds.m3d"
];

files.forEach(function(file) {
	format.parse_m3d_file(file);
});
