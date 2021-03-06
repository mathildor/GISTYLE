var simplepolygon = require('../node_modules/simplepolygon');
var destination = require('../node_modules/turf-destination');
var bearing = require('../node_modules/turf-bearing')
var helpers = require('../node_modules/turf-helpers');
var union = require('../node_modules/turf-union');
var difference = require('../node_modules/turf-difference');
var simplify = require('../node_modules/turf-simplify');

module.exports = buffer;

function buffer(feature, radius, units, resolution){
  if (!resolution) resolution = 32; // Same value as JSTS
  if (radius < 0) throw new Error("The buffer radius must be positive");
  if (radius == 0) return feature;
  if (feature.type === 'FeatureCollection') {
    var buffers = [];
    feature.features.forEach(function(ft) {
      var featureBuffer = buffer(ft, radius, units, resolution);
      if (featureBuffer.type === 'Feature') {
        buffers.push(featureBuffer);
      } else { // featureBuffer.type === 'FeatureCollection'
        buffers.push.apply(buffers,featureBuffer.features);
      }
    });
    return helpers.featureCollection(buffers)
  }
  if (feature.geometry === null) return feature;
  if (['LineString', 'MultiLineString', 'Polygon', 'MultiPolygon'].indexOf(feature.geometry.type) > -1) { // turf-simplify() currently handles points and multipoints incorrectly
    feature = simplify(feature, helpers.distanceToDegrees(radius/20, units)); // radius/20 seems like the optimal balance between speed and detail
  }
  if(feature.geometry.type === 'Point') {
    return pointBuffer(feature, radius, units, resolution);
  } else if(feature.geometry.type === 'MultiPoint') {
    var buffers = [];
    feature.geometry.coordinates.forEach(function(coords) {
      buffers.push(pointBuffer(helpers.point(coords), radius, units, resolution));
    });
    return helpers.featureCollection(buffers)
  } else if(feature.geometry.type === 'LineString') {
    return lineBuffer(feature, radius, units, resolution);
  } else if(feature.geometry.type === 'MultiLineString') {
    var buffers = [];
    feature.geometry.coordinates.forEach(function(coords) {
      buffers.push(lineBuffer(helpers.lineString(coords), radius, units, resolution));
    });
    return helpers.featureCollection(buffers)
  } else if(feature.geometry.type === 'Polygon') {
    return polygonBuffer(feature, radius, units, resolution);
  } else if(feature.geometry.type === 'MultiPolygon') {
    var buffers = [];
    feature.geometry.coordinates.forEach(function(coords) {
      buffers.push(polygonBuffer(helpers.polygon(coords), radius, units, resolution));
    });
    return helpers.featureCollection(buffers)
  }
}

function pointBuffer(pt, radius, units, resolution) {
  var pointOffset = [[]];
  var resMultiple = 360/resolution;
  for(var i  = 0; i < resolution; i++) {
    var spoke = destination(pt, radius, i*resMultiple, units);
    pointOffset[0].push(spoke.geometry.coordinates);
  }
  if(!(equalArrays(pointOffset[0][0],pointOffset[0][pointOffset[0].length-1]))) {
    pointOffset[0].push(pointOffset[0][0]);
  }
  return helpers.polygon(pointOffset)
}

function lineBuffer(line, radius, units, resolution) {
  var lineOffset = [];

  line.geometry.coordinates = removeDuplicates(line.geometry.coordinates);

  if (!(equalArrays(line.geometry.coordinates[0],line.geometry.coordinates[line.geometry.coordinates.length-1]))) {

    // situation at first point
    var firstLinePoint = helpers.point(line.geometry.coordinates[0]);
    var secondLinePoint = helpers.point(line.geometry.coordinates[1]);
    var firstLineBearing = bearing(firstLinePoint, secondLinePoint);
    var firstBufferPoint = destination(firstLinePoint, radius, firstLineBearing + 90, units);

    // situation at last point
    var lastLinePoint = helpers.point(line.geometry.coordinates[line.geometry.coordinates.length-1]);
    var secondlastLinePoint = helpers.point(line.geometry.coordinates[line.geometry.coordinates.length-2]);
    var lastLineBearing = bearing(lastLinePoint, secondlastLinePoint);

    lineOffset.push([]);
    lineOffset[0].push.apply(lineOffset[0],[firstBufferPoint.geometry.coordinates]); // Add first buffer point in order to close ring
    lineOffset[0].push.apply(lineOffset[0],lineOffsetOneSide(line, radius, units, resolution, false, true).geometry.coordinates);
    lineOffset[0].push.apply(lineOffset[0],arc(lastLinePoint, radius, lastLineBearing - 90, lastLineBearing + 90, units, resolution, true).geometry.coordinates);
    lineOffset[0].push.apply(lineOffset[0],lineOffsetOneSide(line, radius, units, resolution, true, true).geometry.coordinates);
    lineOffset[0].push.apply(lineOffset[0],arc(firstLinePoint, radius, firstLineBearing - 90, firstLineBearing + 90, units, resolution, true).geometry.coordinates);

    return offsetToBuffer(helpers.polygon(lineOffset));

  } else {

    lineOffset.push(ringOffsetOneSide(line, radius, units, resolution, false, true).geometry.coordinates);
    lineOffset.push(ringOffsetOneSide(line, radius, units, resolution, true, true).geometry.coordinates);

    return offsetToBuffer(helpers.polygon(lineOffset));
  }
}

function polygonBuffer(poly, radius, units, resolution) {
  var polygonOffset = [];

  poly = rewind(poly);

  poly.geometry.coordinates[0] = removeDuplicates(poly.geometry.coordinates[0]);
  for (var i = 1; i < poly.geometry.coordinates.length; i++) {
    poly.geometry.coordinates[i] = removeDuplicates(poly.geometry.coordinates[i]);
  }

  polygonOffset.push(ringOffsetOneSide(helpers.lineString(poly.geometry.coordinates[0]), radius, units, resolution, false, true).geometry.coordinates);
  for (var i = 1; i < poly.geometry.coordinates.length; i++) {
    polygonOffset.push(ringOffsetOneSide(helpers.lineString(poly.geometry.coordinates[i]), radius, units, resolution, false, true).geometry.coordinates);
  }

  return offsetToBuffer(helpers.polygon(polygonOffset));
}

function lineOffsetOneSide(line, radius, units, resolution, reverse, right) {
  if (reverse === undefined) var reverse = false;
  if (right === undefined) var right = true;
  if (reverse) line.geometry.coordinates = line.geometry.coordinates.reverse();
  var coords = line.geometry.coordinates;
  var lineOffset = [];
  if (coords.length == 2) return helpers.lineString(lineOffset)

  for (var i = 1; i < coords.length-1; i++) {
    var previousLinePoint = helpers.point(coords[i-1]);
    var currentLinePoint = helpers.point(coords[i]);
    var nextLinePoint = helpers.point(coords[i+1]);
    var previousLineBearing = bearing(currentLinePoint, previousLinePoint);
    var nextLineBearing = bearing(currentLinePoint, nextLinePoint);
    lineOffset.push.apply(lineOffset, arc(currentLinePoint, radius, previousLineBearing - Math.pow(-1, right + 1) * 90, nextLineBearing + Math.pow(-1, right + 1) * 90, units, resolution, right, true).geometry.coordinates);
  }

  return helpers.lineString(lineOffset)
}

function ringOffsetOneSide(ring, radius, units, resolution, reverse, right) {
  if (reverse === undefined) var reverse = false;
  if (right === undefined) var right = true;
  if (reverse) ring.geometry.coordinates = ring.geometry.coordinates.reverse();
  var coords = ring.geometry.coordinates; // ring is a lineString
  var ringOffset = [];

  // situation at current point = point 0
  var previousRingPoint = helpers.point(coords[coords.length-2]);
  var currentRingPoint = helpers.point(coords[0]);
  var nextRingPoint = helpers.point(coords[1]);
  var nextRingBearing = bearing(currentRingPoint, nextRingPoint);
  var currentBufferPoint = destination(currentRingPoint, radius, nextRingBearing + 90, units);
  var previousRingBearing = bearing(currentRingPoint, previousRingPoint);

  ringOffset.push.apply(ringOffset, [currentBufferPoint.geometry.coordinates]); // Add first buffer point in order to close ring
  ringOffset.push.apply(ringOffset, lineOffsetOneSide(ring, radius, units, resolution, false, right).geometry.coordinates);
  ringOffset.push.apply(ringOffset, arc(currentRingPoint, radius, previousRingBearing - Math.pow(-1, right + 1) * 90, nextRingBearing + Math.pow(-1, right + 1) * 90, units, resolution, right, true).geometry.coordinates);

  return helpers.lineString(ringOffset)
}

function arc(pt, radius, bearing1, bearing2, units, resolution, right, shortcut) {
  if (right === undefined) var right = true;
  if (shortcut === undefined) var shortcut = false;
  var arc = [];
  var resMultiple = 360/resolution;
  var angle = (Math.pow(-1, right + 1) * (bearing1 - bearing2)).modulo(360);
  var numSteps = Math.floor(angle/resMultiple);
  var step = numSteps; // Counting steps first is easier than checking angle (angle involves checking 'right', 'modulo(360)', lefthandedness of bearings
  var bearing = bearing1;
  // Add spoke for bearing1
  var spoke = destination(pt, radius, bearing1, units);
  arc.push(spoke.geometry.coordinates);
  // Add spokes for all bearings between bearing1 to bearing2
  // But don't add spokes if the angle is reflex and the shortcut preference is set. In that case, just add bearing1 and bearing2. This prevents double, zigzag-overlapping arcs, and potentially non-unique vertices, when a lineOffsetOneSide is run on both sides.
  if (!(angle > 180 && shortcut)) {
    while (step) {
      bearing = bearing + Math.pow(-1, !right + 1) * resMultiple;
      spoke = destination(pt, radius, bearing, units);
      arc.push(spoke.geometry.coordinates);
      step--;
    }
  } else {
  arc.push(pt.geometry.coordinates);
  }
  // Add spoke for bearing 2, but only if this spoke has not been added yet. Do this by checking the destination point, since slightly different bearings can create equal destination points.
  var spokeBearing2 = destination(pt, radius, bearing2, units);
  if (!equalArrays(spokeBearing2.geometry.coordinates,spoke.geometry.coordinates)) {
    arc.push(spokeBearing2.geometry.coordinates);
  }
  return helpers.lineString(arc)
}

function filterNetWinding(fc, filterFn) {
  var output = {type: 'FeatureCollection', features: []};
  var i = fc.features.length;
  while (i--) {
    if (filterFn(fc.features[i].properties.netWinding)) {
        output.features.push({type: "Feature", geometry: fc.features[i].geometry, properties: {}});
    }
  }
  return output;
}

function unionFeatureCollection(fc) {
  // Note: union takes a polygon, but return a polygon or multipolygon (which it can not take in). In case of buffes, however, it will always return a polygon
  if (fc.features.length == 0) return {type: "Feature", geometry: null, properties: {}};
  var incrementalUnion = fc.features[0];
  if (fc.features.length == 1) return incrementalUnion;
  for (var i = 1; i < fc.features.length; i++) {
    incrementalUnion = union(incrementalUnion, fc.features[i]);
  }
  return incrementalUnion
}

function offsetToBuffer(polygonOffset) {
  // You can inspect the polygonOffset here
  // console.log(JSON.stringify(polygonOffset));
  var sp = simplepolygon(polygonOffset);
  // You can inspect the simplepolygon output here
  // console.log(JSON.stringify(sp));
  var unionWithWindingOne = unionFeatureCollection(filterNetWinding(sp, function (netWinding){return netWinding == 1}));
  var unionWithWindingZero = unionFeatureCollection(filterNetWinding(sp, function (netWinding){return netWinding == 0}));
  // This last one might have winding -1, so we might have to rewind it if the difference algorithm requires so

  if (unionWithWindingOne.geometry == null) return {type: "Feature", geometry: null, properties: {}};
  if (unionWithWindingZero.geometry == null) return unionWithWindingOne;
  return difference(unionWithWindingOne, unionWithWindingZero);
}

function winding(poly){
  // compute winding of first ring
  var coords = poly.geometry.coordinates[0];
  var leftVtxIndex = 0;
  for (var i = 0; i < coords.length-1; i++) { if (coords[i][0] < coords[leftVtxIndex][0]) leftVtxIndex = i; }
  var prevVtx = coords[(leftVtxIndex-1).modulo(coords.length-1)];
  var leftVtx = coords[leftVtxIndex];
  var nxtVtx = coords[(leftVtxIndex+1).modulo(coords.length-1)];
  var atan1 = Math.atan((prevVtx[1]-leftVtx[1])/(prevVtx[0]-leftVtx[0]));
  var atan2 = Math.atan((nxtVtx[1]-leftVtx[1])/(nxtVtx[0]-leftVtx[0]));
  return (atan1 > atan2) ? 1 : -1;
}

function rewind(poly){
  // outer ring to winding +1, inner rings to winding -1
  if (winding(helpers.polygon([poly.geometry.coordinates[0]])) == -1) poly.geometry.coordinates[0] = poly.geometry.coordinates[0].reverse();
  for (var i = 1; i < poly.geometry.coordinates.length; i++) {
    if (winding(helpers.polygon([poly.geometry.coordinates[i]])) == 1) poly.geometry.coordinates[i] = poly.geometry.coordinates[i].reverse();
  }
  return poly
}

function removeDuplicates(arr) {
  for (var i = arr.length-1; i > 0; i--) {
    if (equalArrays(arr[i],arr[i-1])) {
      arr.splice(i,1);
    }
  }
  return arr;
}


// Function to compare Arrays of numbers. From http://stackoverflow.com/questions/7837456/how-to-compare-arrays-in-javascript
function equalArrays(array1, array2) {
  // if the other array is a falsy value, return
  if (!array1 || !array2)
      return false;

  // compare lengths - can save a lot of time
  if (array1.length != array2.length)
      return false;

  for (var i = 0, l=array1.length; i < l; i++) {
      // Check if we have nested arrays
      if (array1[i] instanceof Array && array2[i] instanceof Array) {
          // recurse into the nested arrays
          if (!equalArrays(array1[i],array2[i]))
              return false;
      }
      else if (array1[i] != array2[i]) {
          // Warning - two different object instances will never be equal: {x:20} != {x:20}
          return false;
      }
  }
  return true;
}

// Fix Javascript modulo for negative number. From http://stackoverflow.com/questions/4467539/javascript-modulo-not-behaving
Number.prototype.modulo = function(n) {
    return ((this%n)+n)%n;
}
