(function () {
    var Filter = React.createClass({

        render: function () {
            var partyOptions = DataStore.getFilterValues('party').map(function (party, index) {
                return (
                    <option key={index} value={party}>{party}</option>
                );
            });

            var typOptions = DataStore.getFilterValues('typ').map(function (typ, index) {
                return (
                    <option key={index} value={typ}>{DataStore.getTypName(typ)}</option>
                );
            });

            var yearOptions = DataStore.getFilterValues('year').map(function (year, index) {
                return (
                    <option key={index} value={year}>{year}</option>
                );
            });

            return (
                <div class="form-wrapper">
                    <select name="party" onChange={this.onChange}>
                        <option value="">Alle</option>
                        {partyOptions}
                    </select>

                    <input name="name" type="text" onChange={this.onChange} />

                    <select name="typ" onChange={this.onChange}>
                        <option value="">Alle</option>
                        {typOptions}
                    </select>

                    <select name="minYear" onChange={this.onChange}>
                        <option value="">Alle</option>
                        {yearOptions}
                    </select>

                    <select name="maxYear" onChange={this.onChange}>
                        <option value="">Alle</option>
                        {yearOptions}
                    </select>
                </div>
            );
        },

        onChange: function (event) {
            var target = event.target,
                state = {};

            state[target.name] = target.value || null;

            dataTableComponent.setState(state);
        }
    });

    var DataTable = React.createClass({

        getInitialState: function() {
            return {};
        },

        formatCurrency: function (value) {
            return value.toFixed(2).replace('.', ',')
        },

        render: function() {
            var self = this,
                entries = DataStore.getEntries(this.state);

            var rows = entries.map(function(entry, index) {
                return (
                    <tr key={index}>
                        <td>{entry.year}</td>
                        <td>{entry.party}</td>
                        <td>{entry.name}</td>
                        <td>{entry.street}</td>
                        <td>{entry.plz}</td>
                        <td>{entry.city}</td>
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
                        <th>Stadt</th>
                        <th>Betrag</th>
                    </tr>
                    </thead>
                    <tbody>
                    {rows}
                    </tbody>
                </table>
            );
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
})();
