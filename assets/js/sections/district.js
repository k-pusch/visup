var DistrictSection = function (node, dataStore, geoStore) {
    BaseSection.call(this, node, dataStore, geoStore);

    var districts = geoStore.getDistricts();

    this.districts = _.values(districts);

    this.bounds = {
        width: 600,
        height: 500,
        center: geoStore.getCenter(),
        scale: 48541.672162333
    };

    this.map = d3.select(node)
        .append('svg')
        .attr('id', 'map')
        .attr('width', this.bounds.width)
        .attr('height', this.bounds.height);

    this.tooltip = d3.select(node)
        .append('div')
        .classed('tooltip hidden', true);

    this.projection = d3.geo.mercator()
        .scale(this.bounds.scale)
        .center(this.bounds.center)
        .translate([
            this.bounds.width / 2,
            this.bounds.height / 2
        ]);

    this.pathGenerator = d3.geo.path().projection(this.projection);

    this.paths = this.map.selectAll('path');
};

DistrictSection.prototype = Object.create(BaseSection.prototype);

DistrictSection.prototype.constructor = DistrictSection;

DistrictSection.prototype.requiredFilters = ['party', 'typ', 'minYear', 'maxYear'];

DistrictSection.prototype.update = function (filters) {
    var self = this, aggregate = self.dataStore.aggregate.filter;

    var districts = this.districts.map(function (district) {
        var filter = _.assign({}, filters, {district: district.id}),
            total = aggregate(filter);

        return _.assign({total: total}, district);
    });

    var max = _.max(districts, 'total').total || 0.0;

    var paths = this.paths.data(districts);

    paths.enter()
        .append('path')
        .attr('d', function (district) {
            return self.pathGenerator(district.bounds)
        })
        .attr('id', function (district) {
            return 'district-{id}'.render({id: district.id});
        })
        .attr('style', function (district) {
            var total = district.total || 0,
                value = (255 * (1 - total / max)).toFixed(0);

            return 'fill: rgb(255, #, #)'.replace(/#/g, value)
        })
        .on('mouseenter', function (district) {
            var total = formatCurrency(district.total || 0),
                tooltip = '{name}: {total} €'.render({
                    name: district.name, total: total
                });

            self.tooltip
                .classed('hidden', false)
                .html(tooltip);
        })
        .on('mouseleave', function () {
            self.tooltip.classed('hidden', true);
        });

    paths.exit().remove();

    /* TODO: find a way to remove or update previous paths */

};
