(function () {
    var Filter = React.createClass({

        getInitialState: function() {
            return {
                dataStore: null
            };
        },

        renderOptions: function (field) {
            var dataStore = this.state.dataStore;

            if (dataStore === null) return;

            return dataStore.getFilterValues(field).map(function (option, index) {
                return (
                    <option key={index} value={option.value}>{option.name}</option>
                );
            });
        },

        render: function () {
            var partyOptions = this.renderOptions('party'),
                typOptions = this.renderOptions('typ'),
                districtOptions = this.renderOptions('district'),
                yearOptions = this.renderOptions('year');

            return (
                <div class="form-wrapper">
                    <div className="select-field">
                        <select id="party-filter" name="party" onChange={this.onChange}>
                            <option value="">Alle</option>
                            {partyOptions}
                        </select>
                        <label for="party-filter">Partei</label>
                    </div>

                    <div className="input-field">
                        <input id="name-filter" name="name" type="text" onChange={this.onChange} />
                        <label for="name-filter"> Spender </label>
                    </div>

                    <div className="select-field">
                        <select id="type-filter" name="typ" onChange={this.onChange}>
                            <option value="">Alle</option>
                            {typOptions}
                        </select>
                        <label for="type-filter"> Spendentyp </label>
                    </div>

                    <div className="select-field">
                        <select id="district-filter" name="district" onChange={this.onChange}>
                            <option value="">Alle</option>
                            {districtOptions}
                        </select>
                        <label for="district-filter"> Bezirk </label>
                    </div>

                    <div className="select-field">
                        <select id="minyear-filter" name="minYear" onChange={this.onChange}>
                            <option value="">Alle</option>
                            {yearOptions}
                        </select>
                        <label for="minyear-filter"> Von Jahr </label>
                    </div>

                    <div className="select-field">
                        <select id="maxyear-filter" name="maxYear" onChange={this.onChange}>
                            <option value="">Alle</option>
                            {yearOptions}
                        </select>
                        <label for="maxyear-filter"> Bis Jahr </label>
                    </div>
                </div>
            );
        },

        onChange: function (event) {
            var target = event.target,
                filter = {};

            filter[target.name] = target.value || null;

            dataTableComponent.updateFilters(filter);
        },

        componentDidMount: function () {
            var self = this;

            DataStore.onReady(function (dataStore) {
                self.setState({
                    dataStore: dataStore
                }, null);
            });
        }

    });

    var DataTable = React.createClass({

        getInitialState: function() {
            return {
                dataStore: null,
                filters: {}
            };
        },

        formatCurrency: function (value) {
            var fixed = value.toFixed(2),
                bits = fixed.split('.'),
                number = bits[0],
                decimal = bits[1];

            if (number.length <= 3) {
                return number + ',' + decimal;
            }

            var remainder = number.length % 3,
                head, tail, groups;

            if (remainder) {
                head = number.substr(0, remainder);
                tail = number.substr(remainder);
                groups = [head];

            } else {
                tail = number;
                groups = [];
            }

            for (var start = 0; start < tail.length; start += 3) {
                groups.push(tail.substr(start, 3));
            }

            return groups.join('.') + ',' + decimal;
        },

        shorten: function (value, length) {
            if (value.length > length) {
                var shortValue = value.substring(0, length - 3).concat('...');

                return (
                    <abbr title={value}>{shortValue}</abbr>
                )
            }

            return value;
        },

        updateFilters: function (filter) {
            this.setState({
                filters: _.extend(this.state.filters, filter)
            }, null);
        },

        getEntries: function () {
            var dataStore = this.state.dataStore;

            if (dataStore === null) return [];

            return dataStore.getEntries(this.state.filters);
        },

        getAggregate: function (entries) {
            var dataStore = this.state.dataStore;

            if (dataStore === null) return 0.00;

            return dataStore.aggregate.entries(entries);
        },

        render: function() {
            var self = this, entries = self.getEntries(), total = self.getAggregate(entries);

            /* TODO: show spinner until data store is ready */

            var rows = entries.map(function(entry, index) {
                return (
                    <tr key={index}>
                        <td>{entry.year}</td>
                        <td>{entry.party}</td>
                        <td>{self.shorten(entry.name, 50)}</td>
                        <td>{entry.street}</td>
                        <td>{entry.plz}</td>
                        <td>{entry.districtName}</td>
                        <td>{self.formatCurrency(entry.val)} €</td>
                    </tr>
                );
            });

            return (
                <table className="striped">
                    <thead>
                        <tr>
                            <th>Jahr</th>
                            <th>Partei</th>
                            <th>Spender</th>
                            <th>Straße</th>
                            <th>PLZ</th>
                            <th>Bezirk</th>
                            <th>Betrag</th>
                        </tr>
                    </thead>
                    <tfoot>
                        <tr>
                            <th>Gesamt</th>
                            <th colspan="6">
                                {self.formatCurrency(total)} €
                            </th>
                        </tr>
                    </tfoot>
                    <tbody>
                        {rows}
                    </tbody>
                </table>
            );
        },

        componentDidMount: function () {
            var self = this;

            DataStore.onReady(function (dataStore) {
                self.setState({
                    dataStore: dataStore
                }, null);
            });
        }
    });

    var filterComponent = ReactDOM.render(
        <Filter />,
        document.getElementById('filter')
    );

    var dataTableComponent = ReactDOM.render(
        <DataTable />,
        document.getElementById('table')
    );

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
                .append('title').text(function (district) {
                    return district.name;
                });

        });
    });
})();
