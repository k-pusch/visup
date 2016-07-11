var DataStore = (function (_, data) {

    var fields = [
        'year',
        'party',
        'name',
        'street',
        'plz',
        'city',
        'typ',
        'district'
    ];

    var options = {
        district: {},
        typ: {
            nat: 'Natürliche Person',
            jur: 'Juristische Person'
        }
    };

    var mapping = {};

    var init = function (geoStore) {
        var districtObjects = geoStore.getDistricts(),
            districts = options.district;

        Object.keys(districtObjects).forEach(function (id) {
            districts[id] = districtObjects[id].name;
        });

        data.forEach(function (entry) {
            var district = geoStore.getDistrictByCoords(entry.lat, entry.lon);

            entry.district = district.id;
            entry.districtName = district.name;
        });

        fields.forEach(function (field) {
            var values = {};

            data.forEach(function (entry, index) {
                var value = entry[field];

                if (value in values) {
                    values[value].push(index);
                } else {
                    values[value] = [index];
                }
            });

            mapping[field] = values;
        });
    };

    var promise = new Promise(function (resolve, reject) {
        GEOStore.onReady(
            function (geoStore) {
                init(geoStore);
                return resolve(true);
            },
            function (error) {
                return reject(error);
            }
        );
    });

    var filters = {
        party: function (value) {
            return mapping.party[value];
        },
        name: function (value) {
            var values = mapping.name;

            value = value.toLowerCase();

            var names = Object.keys(values).filter(function (name) {
                return name.toLowerCase().indexOf(value) >= 0
            });

            if (names.length === 0) return [];

            return names.map(function (name) {
                return values[name];
            }).reduce(function (entries, current) {
                return _.union(entries, current);
            });
        },
        typ: function (value) {
            return mapping.typ[value];
        },
        year: function (value) {
            return mapping.year[value];
        },
        limitYear: function (compare) {
            var values = mapping.year,
                years = Object.keys(values).filter(compare);

            /* no need to check for empty years here, since we use
             a select we have at least one equal year to value */

            return years.map(function (year) {
                return values[year];
            }).reduce(function (entries, current) {
                return _.union(entries, current);
            })
        },
        minYear: function (value) {
            return filters.limitYear(function (year) { return year >= value});
        },
        maxYear: function (value) {
            return filters.limitYear(function (year) { return year <= value});
        },
        district: function (value) {
            return mapping.district[value];
        }
    };

    var getEntries = function (filter) {
        if (typeof filter === 'undefined') {
            /* no filters to apply */
            return data;

        } else if (typeof filter !== 'object') {
            throw 'Invalid type for filters. Supply an object, not ?.'.replace('?', typeof filter)
        }

        var names = Object.keys(filter).filter(function (name) {
            return filter[name] !== null;
        });

        if (names.length === 0) return data;  /* no filters to apply */

        return names.map(function (name) {
            var value = filter[name],
                func = filters[name];
            return func(value) || [];
        }).reduce(function (entries, current) {
            return _.intersection(entries, current);
        }).map(function (index) {
            return data[index];
        });
    };

    var getFilterValues = function (field, orderBy, order) {
        var data = mapping[field],
            values = Object.keys(data),
            names = options[field] || {},
            filters = values.map(function (value) {
                var entries = data[value];

                return {
                    value: value,
                    name: names[value] || value,
                    count: entries.length,
                    total: orderBy === 'total' ? aggregateEntries(entries) : 0
                }
            });

        return _.orderBy(filters, [orderBy || 'name'], [order || 'asc']);
    };

    var getEntriesForIDs = function (ids) {
        return ids.map(function (id) {
            return data[id];
        })
    };

    var aggregateEntries = function (entries) {
        return entries.reduce(function (value, entry) {
            return value + entry.val;
        }, 0.00)
    };

    var aggregateField = function (field) {
        return _.mapValues(mapping[field], function (ids) {
            var entries = getEntriesForIDs(ids);
            return aggregateEntries(entries);
        });
    };

    var aggregateFilter = function (filter) {
        var entries = getEntries(filter);
        return aggregateEntries(entries);
    };

    var onReady = function (callback) {
        promise.then(function () {
            return callback(methods);
        });
    };

    var dump = function () {
        var computed = {
            entries: data,
            mapping: mapping,
            options: options
        };

        var string = JSON.stringify(computed);

        console.log(string);
    };

    var methods = {
        dump: dump,
        getEntries: getEntries,
        getFilterValues: getFilterValues,
        aggregate: {
            entries: aggregateEntries,
            field: aggregateField,
            filter: aggregateFilter
        }
    };

    return {
        onReady: onReady
    }

})(_, partyData);