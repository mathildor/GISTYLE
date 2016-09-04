# GISTYLE

## About
GISTYLE is a Web-GIS created for a course at NTNU (The Norwegian University of Science and Technology), called Programming in Geomatics.
It's main goal of the project was to create a GIS that contains basic geospatial analysis, and it should be easy to use, also for those without any experience with GIS from before.

## Implementation
#### Mean-stack
The application is built with the Mean-stack. This means that I've used MongoDB, Express.js, AngularJS and Node.js.

#### Libraries
For most of the geospatial analysis the Mapbox library [Turf.js](http://turfjs.org/) was used. The interactive map is created by using [Leaflet.js](http://leafletjs.com/).

## Functionality
The GIS has log-in functionality, you can create projects and all changes are saved automatically to your user.

#### Tools implemented
- Buffer
- Merge
- Intersection (Between polygons)
- Within (Points within polygons)
- Difference
- Upload new layer (GeoJSON)
- Draw new layer (Polygon)
- Edit styling of layer

## Limitations and bugs
The GIS is still under development, and there are still bugs.
- When uploading GeoJSON´s with more than one type is not supported
- Buffer returns wrong results because of projection errors
- Deleting default layers are added again if you refresh page
- Tutorial section does still not have explanation of everything, and the correct videos are not added yet.

## Demo
The project was presented at FOSS4G in Norway 2016, and the presentation can be seen in this [video](https://vimeo.com/album/4125736/video/181135135), from time 6:40.
