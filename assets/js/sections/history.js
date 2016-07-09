var HistorySection = function (node, dataStore, geoStore) {
    BaseSection.call(this, node, dataStore, geoStore);

    var years = dataStore.getFilterValues('year', 'value', 'asc').map(function (year) {
        return year.value;
    });

    var parties = dataStore.getFilterValues('party').map(function (party) {
        var name = party.name, values = {};

        years.forEach(function (year) {
            values[year] = dataStore.aggregate.filter({party: name, year: year});
        });

        return {
            name: name,
            years: values
        }
    });

    console.log(parties);
};

HistorySection.prototype = Object.create(BaseSection.prototype);

HistorySection.prototype.constructor = HistorySection;