var DistrictsComponent = React.createClass({

    getInitialState: function() {
        return {
            filters: {}
        };
    },

    render: function () {
        var ds = this.paths,
            aggregate = this.props.dataStore.aggregate.filter,
            filters = this.state.filters,
            totals = {};

        this.districts.forEach(function (district) {
            var id = district.id,
                filter = _.assign({}, filters, {district: id});

            totals[id] = aggregate(filter);
        });

        var values = _.values(totals),
            max = _.max(values) || 0.0;

        var paths = this.districts.map(function (district) {
            var id = 'district-{id}'.render({id: district.id}),
                d = ds[district.id],
                total = totals[district.id] || 0,
                value = (255 * (1 - total / max)).toFixed(0),
                style = {
                    fill: 'rgb(255, #, #)'.replace(/#/g, value)
                },
                title = '{name}: {total} €'.render({
                    name: district.name, total: formatCurrency(total)
                });

            return (
                <path key={id} id={id} d={d} style={style} title={title} />
            )
        });

        return (
            <svg id="map" width={this.bounds.width} height={this.bounds.height}>
                {paths}
            </svg>
        );
    },

    componentWillMount: function () {
        var geoStore = this.props.geoStore,
            districts = geoStore.getDistricts();

        this.districts = _.values(districts);

        var bounds = this.bounds = {
            width: 600,
            height: 500,
            center: geoStore.getCenter(),
            scale: 48541.672162333
        };

        var projection = d3.geo.mercator()
            .scale(bounds.scale)
            .center(bounds.center)
            .translate([
                bounds.width / 2,
                bounds.height / 2
            ]);

        var pathGenerator = d3.geo.path().projection(projection),
            paths = {};

        this.districts.forEach(function (district) {
            paths[district.id] = pathGenerator(district.bounds)
        });

        this.paths = paths;
    },

    setFilters: function (filters) {
        this.setState({filters: filters}, null);
    }

});