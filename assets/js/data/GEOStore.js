var GEOStore = (function ($, d3) {

    var center = null,
        districts = null;

    var promise = new Promise(function (resolve, reject) {
        d3.json('../assets/js/data/berlin-bezirke.geojson', function (error, geodata) {
            if (error) return reject(error);

            var latitudes = [], longitudes = [];

            districts = {};

            geodata.features.forEach(function (feature) {
                var id = feature.properties.cartodb_id;

                districts[id] = {
                    id: id,
                    name: feature.properties.name,
                    bounds: new Terraformer.Primitive(feature.geometry)
                };

                feature.geometry.coordinates.forEach(function(items) {
                    items.forEach(function (coordinates) {
                        coordinates.forEach(function (coordinate) {
                            var latitude = coordinate[0],
                                longitude = coordinate[1];

                            latitudes.push(latitude);
                            longitudes.push(longitude);
                        })
                    })
                });
            });

            center = [
                (Math.max.apply(Math, latitudes) + Math.min.apply(Math, latitudes)) / 2,
                (Math.max.apply(Math, longitudes) + Math.min.apply(Math, longitudes)) / 2
            ];

            return resolve(true);
        });
    });

    promise.then(null, function (error) {
        console.error(error);
    });

    function getCenter() {
        return center;
    }

    function getDistricts() {
        return districts;
    }

    function getDistrictByCoords(latitude, longitude) {
        var keys = Object.keys(districts),
            point = new Terraformer.Primitive({
                type: 'Point',
                coordinates: [
                    parseFloat(longitude),
                    parseFloat(latitude)
                ]
            });

        var key = keys.find(function (key) {
            return point.within(districts[key].bounds)
        });

        return key ? districts[key] : null;
    }

    var methods = {
        getCenter: getCenter,
        getDistricts: getDistricts,
        getDistrictByCoords: getDistrictByCoords
    };

    function onReady(callback) {
        promise.then(function () {
            callback(methods);
        });
    }

    return {
        onReady: onReady
    }

})(jQuery, d3);