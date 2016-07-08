(function () {
    var components = ['DataTable', 'Filter'];

    /**
     * Babel does not send an event when it has finished
     * compiling the templates. We have to wait and try.
     */
    function wait () {
        for (var c = 0, component; c < components.length; c++) {
            component = components[c];

            if (typeof window[component] === 'undefined') {
                return window.setTimeout(wait, 25);  // A component is still not available. Wait again ...
            }
        }

        return init();  // Finally all components are loaded. Start initialisation ...
    }

    /**
     * Is called after all components are loaded.
     */
    function init() {
        var dataTableComponent = ReactDOM.render(
            React.createElement(DataTable, {}),
            document.getElementById('table')
        );

        ReactDOM.render(
            React.createElement(Filter, {dataTableComponent: dataTableComponent}),
            document.getElementById('filter')
        );
    }

    wait();

    /* init map */
    GEOStore.onReady(function (geoStore) {
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

        DataStore.onReady(function (dataStore) {
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

            _.defer(function () {
                var parties = dataStore.getFilterValues('party');

                var donations = parties.map(function (party) {
                    var entries = dataStore.getEntries({party: party.value}),
                        names = entries.map(function (entry) { return entry.name });

                    var donors = _.uniq(names).map(function (name) {
                        return {
                            name: name,
                            value: dataStore.aggregate.filter({party: party.value, name: name})
                        };
                    });

                    var sorted = _.orderBy(donors, ['value'], ['desc']);

                    return {
                        party: party.name,
                        donors: sorted.slice(0, 5)
                    };
                });

                var width = 300,
                    height = 300,
                    radius = Math.min(width, height) / 2,
                    translate = 'translate(x, y)'.replace('x', String(width / 2)).replace('y', String(height / 2)),
                    colors = d3.scale.ordinal().range(['#ffebee', '#ef9a9a', '#e57373', '#ef5350', '#d32f2f']),
                    pieGenerator = d3.layout.pie().value(function (donor) { return donor.value }),
                    arcGenerator = d3.svg.arc().outerRadius(radius).innerRadius(radius * 0.6),
                    legendRectSize = 18,
                    legendSpacing = 4;

                var top5 = d3.select('#top5');

                var svg = top5
                    .selectAll('svg')
                    .data(donations)
                    .enter()
                    .append('svg')
                    .classed('chart', true)
                    .attr('width', width)
                    .attr('height', height);

                var g = svg
                    .append('g')
                    .attr('transform', translate);

                var path = g
                    .selectAll('path')
                    .data(function (party) {
                        return pieGenerator(party.donors)
                    })
                    .enter()
                    .append('path')
                    .attr('d', arcGenerator)
                    .attr('fill', function (donor) {
                        return colors(donor.data.name)
                    });

                var title = path
                    .append('title')
                    .text(function (donor) {
                        var value = formatCurrency(donor.value);

                        return '{name}: {value} €'
                            .replace('{name}', donor.data.name)
                            .replace('{value}', value);
                    });

                var legend = g
                    .selectAll('.legend')
                    .data(function (party) {
                        return party.donors.map(function (donor, index, donors) {
                            return {party: party.name, name: donor.name, count: donors.length}
                        });
                    })
                    .enter()
                    .append('g')
                    .classed('legend', true)
                    .attr('transform', function (donor, index) {
                        var height = legendRectSize + legendSpacing,
                            offset = height * donor.count / 2,
                            x = -2 * legendRectSize,
                            y = index * height - offset;

                        return 'translate(x, y)'
                            .replace('x', String(x))
                            .replace('y', String(y));
                    });

                legend.append('rect')
                    .attr('width', legendRectSize)
                    .attr('height', legendRectSize)
                    .style('fill', function (donor) {
                        return colors(donor.name);
                    })
                    .style('stroke', function (donor) {
                        return colors(donor.name);
                    });

                legend.append('text')
                    .attr('x', legendRectSize + legendSpacing)
                    .attr('y', legendRectSize - legendSpacing)
                    .text(function (donor) {
                        return donor.name;
                    });
            });
        });

        $('.loadanimation').fadeOut('slow');
    });

})();