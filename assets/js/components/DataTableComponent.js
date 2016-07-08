var DataTable = React.createClass({

    getInitialState: function() {
        return {
            dataStore: null,
            filters: {}
        };
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

        var rows = entries.map(function(entry, index) {
            return (
                <tr key={index}>
                    <td>{entry.year}</td>
                    <td>{entry.party}</td>
                    <td>{self.shorten(entry.name, 50)}</td>
                    <td>{entry.street}</td>
                    <td>{entry.plz}</td>
                    <td>{entry.districtName}</td>
                    <td>{formatCurrency(entry.val)} €</td>
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
                            {formatCurrency(total)} €
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