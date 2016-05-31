var Filter = React.createClass({

    render: function () {
        var options = DataStore.getFilterValues('party').map(function (party, index) {
            return (
                <option key={index}>{party}</option>
            );
        });

        return (
            <div class="form-wrapper">
                <select onChange={this.onChangeParty}>
                    <option value="">Alle</option>
                    {options}
                </select>

                <input type="text" onChange={this.onChangeDonor} />
            </div>
        );
    },

    onChangeParty: function(event) {
        //dataTableComponent.setState({party: event.target.value});
    },

    onChangeDonor: function(event) {
        //dataTableComponent.setState({donor: event.target.value});
    }
});