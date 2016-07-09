var DistrictSection = function (node, dataStore, geoStore) {
    BaseSection.call(this, node, dataStore, geoStore);

    var map = d3.select('#map'),
        width = map.attr('width'),
        height = map.attr('height'),
        center = geoStore.getCenter(),
        districts = geoStore.getDistricts();

    districts = _.values(districts);

    var projection = d3.geo.mercator()
        .scale(48541.672162333)
        .center(center)
        .translate([width / 2, height / 2]);

    var path = d3.geo.path().projection(projection);
    var paths = map.selectAll('path').data(districts);

    var totals = dataStore.aggregate.field('district'),
        values = _.values(totals),
        max = _.max(values);

    var tooltip = d3.select('#district').append('div').classed('tooltip hidden', true);

    paths.enter().append('path')
        .attr('d', function (district) {
            return path(district.bounds)
        })
        .attr('id', function (district) {
            return 'district-?'.replace('?', district.id);
        })
        .attr('style', function (district) {
            var total = totals[district.id] || 0,
                value = (255 * (1 - total / max)).toFixed(0);

            return 'fill: rgb(255, #, #)'.replace(/#/g, value)
        })
        .on('mouseenter', function (district) {
            var total = formatCurrency(totals[district.id] || 0);

            tooltip.classed('hidden', false).html(
                '{name}: {total} €'
                    .replace('{name}', district.name)
                    .replace('{total}', total)
            );
        })
        .on('mouseleave', function () {
            tooltip.classed('hidden', true);
        });
};

DistrictSection.prototype = Object.create(BaseSection.prototype);

DistrictSection.prototype.constructor = DistrictSection;
