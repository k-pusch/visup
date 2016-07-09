var HistorySection = function (node, dataStore, geoStore) {
    BaseSection.call(this, node, dataStore, geoStore);

    var colors = {
        'SPD': '#d32f2f',
        'CDU': '#212121',
        'GRÜNE': '#33691E',
        'PDS': '#4A148C',
        'LINKE': '#5E35B1',
        'AFD': '#81D4FA',
        'FDP': '#F57F17',
        'PRO D': '#004D40',
        'CSU': '#0D47A1',
        'DIE PARTEI': '#E64A19'
    };

    var years = dataStore.getFilterValues('year', 'value', 'asc').map(function (year) {
        return year.value;
    });

    var allValues = [];

    var parties = dataStore.getFilterValues('party').map(function (party) {
        var name = party.name, values = years.map(function (year) {
            return {
                year: year,
                value: dataStore.aggregate.filter({party: name, year: year})
            }
        });

        allValues.push.apply(allValues, values);

        return {
            name: name,
            years: values
        }
    });

    var margins = {
        top: 30,
        right: 30,
        bottom: 30,
        left: 80
    };

    var height, width, bounds = {
        width: width = 900,
        height: height = 500,
        innerWidth: width - margins.left - margins.right,
        innerHeight: height - margins.top - margins.bottom
    };

    var scales = {
        x: d3.scale.linear().range([0, bounds.innerWidth]),
        y: d3.scale.linear().range([bounds.innerHeight, 0])
    };

    var axes = {
        x: d3.svg.axis().scale(scales.x).orient('bottom').tickFormat(function (value) {
            return value;
        }),
        y: d3.svg.axis().scale(scales.y).orient('left').tickFormat(function (value) {
            var formatted = formatCurrency(value),
                bits = formatted.split(',');

            return '{value} €'.render({
                value: bits[0]
            })
        })
    };

    var lineGenerator = d3.svg.line()
        .x(function (year) {
            return scales.x(year.year);
        })
        .y(function (year) {
            return scales.y(year.value);
        });

    var svg = d3.select(node).append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', 'translate({x}, {y})'.render({
                x: margins.left,
                y: margins.top
            })
        );

    scales.x.domain(d3.extent(years));
    scales.y.domain(d3.extent(allValues, function (year) { return year.value }));

    svg.append('g')
        .classed('x-axis', true)
        .attr('transform', 'translate(0, {h})'.render({h: bounds.innerHeight}))
        .call(axes.x);

    svg.append('g')
        .classed('y-axis', true)
        .call(axes.y);

    svg.selectAll('.line').data(parties).enter()
        .append('path')
        .classed('line', true)
        .attr('style', function (party) {
            return 'stroke: {color}; stroke-width: 3; fill: none'.render({
                color: colors[party.name]
            })
        })
        .attr('d', function (party) {
            return lineGenerator(party.years);
        });
};

HistorySection.prototype = Object.create(BaseSection.prototype);

HistorySection.prototype.constructor = HistorySection;