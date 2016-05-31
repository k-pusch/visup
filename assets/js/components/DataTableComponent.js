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
            <table>
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
