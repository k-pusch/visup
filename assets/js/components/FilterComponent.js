var Filter = React.createClass({

    getInitialState: function() {
        return {
            dataStore: null
        };
    },

    renderOptions: function (field, orderBy, order) {
        var dataStore = this.state.dataStore;

        if (dataStore === null) return;

        return dataStore.getFilterValues(field, orderBy, order).map(function (option, index) {
            return (
                <option key={index} value={option.value}>{option.name}</option>
            );
        });
    },

    render: function () {
        var partyOptions = this.renderOptions('party'),
            typOptions = this.renderOptions('typ'),
            districtOptions = this.renderOptions('district'),
            yearOptions = this.renderOptions('year', 'value', 'asc');

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

        this.props.dataTableComponent.updateFilters(filter);
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