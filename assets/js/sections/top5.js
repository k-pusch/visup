var TopFiveSection = function (node, dataStore, geoStore) {
    BaseSection.call(this, node, dataStore, geoStore);

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

    var width = 400,
        height = 400,
        radius = Math.min(width, height) / 2,
        translate = 'translate(x, y)'.replace('x', String(width / 2)).replace('y', String(height / 2)),
        colors = {
            'SPD'           : d3.scale.ordinal().range(['#d32f2f', '#ef5350', '#e57373', '#ef9a9a', '#ffebee']),
            'CDU'           : d3.scale.ordinal().range(['#212121', '#424242', '#616161', '#757575', '#9E9E9E']),
            'GRÜNE'         : d3.scale.ordinal().range(['#33691E', '#558B2F', '#689F38', '#7CB342', '#8BC34A']),
            'PDS'           : d3.scale.ordinal().range(['#4A148C', '#6A1B9A', '#7B1FA2', '#8E24AA', '#BA68C8']),
            'LINKE'         : d3.scale.ordinal().range(['#5E35B1', '#7E57C2', '#9575CD', '#B39DDB', '#D1C4E9']),
            'AFD'           : d3.scale.ordinal().range(['#81D4FA', '#03A9F4', '#4FC3F7', '#81D4FA', '#B3E5FC']),
            'FDP'           : d3.scale.ordinal().range(['#F57F17', '#FBC02D', '#FDD835', '#FFEB3B', '#FFF59D']),
            'PRO D'         : d3.scale.ordinal().range(['#004D40', '#00796B', '#009688', '#4DB6AC', '#B2DFDB']),
            'CSU'           : d3.scale.ordinal().range(['#0D47A1', '#1565C0', '#1976D2', '#1E88E5', '#2196F3']),
            'DIE PARTEI'    : d3.scale.ordinal().range(['#E64A19', '#BF360C', '#FF5722', '#FF7043', '#FFAB91'])
        },
        pieGenerator = d3.layout.pie().value(function (donor) { return donor.value }),
        arcGenerator = d3.svg.arc().outerRadius(radius).innerRadius(radius * 0.7),
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

    var tooltip = d3.select('#top5').append('div').classed('tooltip hidden', true);

    var path = g
        .selectAll('path')
        .data(function (party) {
            return pieGenerator(party.donors.map(function (donor) {
                return _.assign({party: party.party}, donor);
            }));
        })
        .enter()
        .append('path')
        .attr('d', arcGenerator)
        .attr('fill', function (donor) {
            return colors[donor.data.party](donor.data.name)
        })
        .on('mouseenter', function (donor) {
            var value = formatCurrency(donor.value);

            tooltip.classed('hidden', false).html(
                '{name}: {value} €'
                    .replace('{name}', donor.data.name)
                    .replace('{value}', value)
            )
        })
        .on('mouseleave', function () {
            tooltip.classed('hidden', true);
        });

    var headline = svg
        .append('text')
        .text(function (party) {
            return party.party;
        })
        .attr('x', (width/2.4))
        .attr('y', 130)
        .attr('transform', function () {
            var x = -40,
                y = 0;

            return 'translate(x,y)'
                .replace('x', String(x))
                .replace('y', String(y));
        })
        .classed('headline', true);

    var legend = g
        .selectAll('.legend')
        .data(function (party) {
            return party.donors.map(function (donor, index, donors) {
                return {party: party.party, name: donor.name, count: donors.length}
            });
        })
        .enter()
        .append('g')
        .classed('legend', true)
        .attr('transform', function (donor, index) {
            var height = legendRectSize + legendSpacing,
                offset = height * donor.count / 2,
                x = -4 * legendRectSize,
                y = index * height - offset;

            return 'translate(x, y)'
                .replace('x', String(x))
                .replace('y', String(y));
        });

    legend.append('rect')
        .attr('width', legendRectSize)
        .attr('height', legendRectSize)
        .style('fill', function (donor) {
            return colors[donor.party](donor.name);
        })
        .style('stroke', function (donor) {
            return colors[donor.party](donor.name);
        });

    legend.append('text')
        .attr('x', legendRectSize + legendSpacing)
        .attr('y', legendRectSize - legendSpacing)
        .text(function (donor) {
            var name = donor.name;

            if (name.length > 22) {
                return name.substring(0, 22 - 3).concat('...');
            }

            return name;
        });
};

TopFiveSection.prototype = Object.create(BaseSection.prototype);

TopFiveSection.prototype.constructor = TopFiveSection;