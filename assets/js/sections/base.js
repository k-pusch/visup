/**
 * @param {HTMLElement} node
 * @param {DataStore} dataStore
 * @param {GEOStore} geoStore
 * @constructor
 */
var BaseSection = function (node, dataStore, geoStore) {
    this.node = node;
    this.dataStore = dataStore;
    this.geoStore = geoStore;
};

/**
 * @type {HTMLElement}
 */
BaseSection.prototype.node = null;

/**
 * @type {Array}
 */
BaseSection.prototype.requiredFilters = [];

/**
 * @param {Object} filters
 */
BaseSection.prototype.update = function (filters) {};

/**
 * Hides this section.
 */
BaseSection.prototype.hide = function () {
    this.node.classList.add('hidden');
};

/**
 * Shows this section.
 */
BaseSection.prototype.show = function () {
    this.node.classList.remove('hidden');
};