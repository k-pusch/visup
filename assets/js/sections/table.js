var TableSection = function (node, dataStore, geoStore) {
    BaseSection.call(this, node, dataStore, geoStore);

    this.component = ReactDOM.render(
        React.createElement(DataTable, {
            dataStore: dataStore
        }), this.node
    );
};

TableSection.prototype = Object.create(BaseSection.prototype);

TableSection.prototype.constructor = TableSection;

TableSection.prototype.update = function (filters) {
    this.component.updateFilters(filters);
};

TableSection.prototype.requiredFilters = [
    'party', 'name', 'typ', 'district', 'minYear', 'maxYear'
];
