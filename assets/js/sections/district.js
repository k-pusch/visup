var DistrictSection = function (node, dataStore, geoStore) {
    BaseSection.call(this, node, dataStore, geoStore);

    this.component = ReactDOM.render(
        React.createElement(DistrictsComponent, {
            dataStore: dataStore,
            geoStore: geoStore
        }), document.getElementById('district-map-wrapper')
    );

    var $section = $(node),
        tooltip = $section.find('.tooltip');

    $section.on('mouseenter', 'path', function () {
        tooltip.html($(this).attr('title')).removeClass('hidden');
    });

    $section.on('mouseleave', 'path', function () {
        tooltip.addClass('hidden');
    });
};

DistrictSection.prototype = Object.create(BaseSection.prototype);

DistrictSection.prototype.constructor = DistrictSection;

DistrictSection.prototype.requiredFilters = ['party', 'typ', 'minYear', 'maxYear'];

DistrictSection.prototype.update = function (filters) {
    this.component.setFilters(filters);
};
