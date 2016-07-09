var Filter = React.createClass({

    filters: {
        party: {className: 'select-field', options: ['party'], label: 'Partei'},
        name: {className: 'input-field', options: null, label: 'Spender'},
        typ: {className: 'select-field', options: ['typ'], label: 'Spendentyp'},
        district: {className: 'select-field', options: ['district'], label: 'Bezirk'},
        minYear: {className: 'select-field', options: ['year', 'value', 'asc'], label: 'Von Jahr'},
        maxYear: {className: 'select-field', options: ['year', 'value', 'asc'], label: 'Bis Jahr'}
    },

    getInitialState: function() {
        return {
            filters: this.props.initialFilters,
            selection: {}
        };
    },

    renderOptions: function (field, orderBy, order) {
        return this.props.dataStore.getFilterValues(field, orderBy, order).map(function (option, index) {
            return (
                <option key={index} value={option.value}>{option.name}</option>
            );
        });
    },

    renderFilter: function (name) {
        var config = this.filters[name],
            id = '{name}-filter'.render({name: name});

        if (config.className === 'select-field') {
            var options = this.renderOptions.apply(this, config.options),
                selected = this.state.selection[name] || '';

            return (
                <div key={id} className={config.className}>
                    <select id={id} name={name} value={selected} onChange={this.onChange}>
                        <option value="">Alle</option>
                        {options}
                    </select>
                    <label for={id}>{config.label}</label>
                </div>
            )
        } else {
            return (
                <div key={id} className={config.className}>
                    <input id={id} name={name} type="text" onChange={this.onChange} />
                    <label for={id}>{config.label}</label>
                </div>
            )
        }
    },

    render: function () {
        var self = this, filters = this.state.filters.map(function (filter) {
            return self.renderFilter(filter);
        });

        return (
            <div class="form-wrapper">
                {filters}
            </div>
        );
    },

    onChange: function (event) {
        var target = event.target,
            filter = {};

        filter[target.name] = target.value || null;

        this.props.updateFilters(filter);
    },

    setFilters: function (filters) {
        this.setState({filters: filters}, null);
    },

    setSelection: function (selection) {
        this.setState({selection: selection}, null);
    }

});