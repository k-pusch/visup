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
                yearOptions = this.renderOptions('year');

            return (
                <div class="form-wrapper">
                    <div className="select-field">
                        <select id="party" name="party" onChange={this.onChange}>
                            <option value="">Alle</option>
                            {partyOptions}
                        </select>
                        <label for="party">Partei</label>
                    </div>

                    <div className="input-field">
                        <input name="name" id="name" type="text" onChange={this.onChange} />
                        <label for="name"> Spender </label>
                    </div>

                    <div className="select-field">
                        <select id="type" name="typ" onChange={this.onChange}>
                            <option value="">Alle</option>
                            {typOptions}
                        </select>
                        <label for="type"> Spendentyp </label>
                    </div>

                    <div className="select-field">
                        <select id="minyear" name="minYear" onChange={this.onChange}>
                            <option value="">Alle</option>
                            {yearOptions}
                        </select>
                        <label for="minyear"> Von Jahr </label>
                    </div>

                    <div className="select-field">
                        <select id="maxyear" name="maxYear" onChange={this.onChange}>
                            <option value="">Alle</option>
                            {yearOptions}
                        </select>
                        <label for="maxyear"> Bis Jahr </label>
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
            return value.toFixed(2).replace('.', ',')
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

        render: function() {
            var self = this, entries = self.getEntries();

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

        paths.enter().append('path')
            .attr('d', function (district) {
                return path(district.bounds)
            })
            .attr('id', function (district) {
                return 'district-?'.replace('?', district.id);
            })
            .append('title').text(function (district) {
                return district.name;
            });

    });
})();
