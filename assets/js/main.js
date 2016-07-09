(function ($) {
    var $loadAnimation = $('.loadanimation'),
        $main = $('main'),
        $sections = $main.find('section'),
        $scripts = $('script'),
        $tabs = $('#tabs'),
        $filter = $('#filter');

    var activeSection = 'table',
        sections = {},
        filterComponent,
        _filters;

    var reactComponents = $scripts
        .filter(function (index, node) {
            return node.type === 'text/babel';
        }).map(function (index, node) {
            return $(node).data('component');
        }).toArray();

    /**
     * Babel does not send an event when it has finished
     * compiling the templates. We have to wait and try.
     */
    function wait (components) {
        for (var c = 0, component; c < components.length; c++) {
            component = components[c];

            if (typeof window[component] === 'undefined') {
                // A component is still not available. Wait again ...
                return window.setTimeout(function () {
                    wait(components);
                }, 25);
            }
        }

        return init();  // Finally all components are loaded. Start initialisation ...
    }

    /**
     * Is called after all components are loaded.
     */
    function init() {
        GEOStore.onReady(function (geoStore) {
            DataStore.onReady(function (dataStore) {
                $sections.each(function (index, node) {
                    var component = $(node).data('component'),
                        cls = window[component];

                    sections[node.id] = new cls(node, dataStore, geoStore);
                });

                var section = sections[activeSection],
                    requiredFilters = section.requiredFilters;

                filterComponent = ReactDOM.render(
                    React.createElement(Filter, {
                        dataStore: dataStore,
                        initialFilters: requiredFilters,
                        updateFilters: setFilters
                    }), $filter.get(0)
                );

                $loadAnimation.fadeOut('slow');
            });
        });
    }

    function setFilters(filters) {
        _filters = _.assign(_filters, filters);

        sections[activeSection].update(_filters);

        filterComponent.setSelection(_filters);
    }

    $tabs.on('click', 'li', function (event) {
        var $tab = $(event.target),
            target = $tab.data('target'),
            section = sections[target],
            requiredFilters = section.requiredFilters;

        if (target === activeSection) return;

        $tabs.find('li').removeClass('active');
        $tab.addClass('active');

        section.update(_filters);
        filterComponent.setFilters(requiredFilters);

        sections[activeSection].hide();
        section.show();

        activeSection = target;
    });

    wait(reactComponents);

})(jQuery);
