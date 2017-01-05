/*
 * IBM Confidential
 * OCO Source Materials
 * IBM Concerto - Blockchain Solution Framework
 * Copyright IBM Corp. 2016
 * The source code for this program is not published or otherwise
 * divested of its trade secrets, irrespective of what has
 * been deposited with the U.S. Copyright Office.
 */

'use strict';

const Logger = require('@ibm/ibm-concerto-common').Logger;

const LOG = Logger.getLog('Factory');

/**
 * Do not attempt to create an instance of this class.<br>
 * You must use the {@link module:ibm-concerto-runtime#getFactory getFactory}
 * method instead.
 *
 * @class Factory
 * @classdesc A factory creates new instances of assets, participants, transactions,
 * and relationships.
 * @memberof module:ibm-concerto-runtime
 * @public
 */

/**
 * A class that represents a factory in the transaction processor API. The
 * transaction processor API should expose no internal properties or internal
 * methods which could be accessed or misused.
 * @private
 */
class Factory {

    /**
     * Constructor.
     * @param {Factory} factory The factory to use.
     * @private
     */
    constructor(factory) {
        const method = 'constructor';
        LOG.entry(method, factory);

        /**
         * Create a new instance of an asset, participant, or transaction. The
         * properties of the new instance should be set as standard JavaScript
         * object properties. The new instance can then be stored in a registry
         * using the appropriate registry APIs, for example {@link
         * module:ibm-concerto-runtime.AssetRegistry AssetRegistry}.
         * @example
         * // Get the factory.
         * var factory = getFactory();
         * // Create a new vehicle.
         * var vehicle = factory.newInstance('org.acme', 'Vehicle', 'VEHICLE_1');
         * // Set the properties of the new vehicle.
         * vehicle.colour = 'BLUE';
         * vehicle.manufacturer = 'Toyota';
         * @public
         * @method module:ibm-concerto-runtime.Factory#newInstance
         * @param {string} ns The namespace of the resource to create.
         * @param {string} type The type of the resource to create.
         * @param {string} id The identifier of the new resource.
         * @return {Resource} The new instance of the resource.
         * @throws {Error} If the specified type (specified by the namespace and
         * type) is not defined in the current version of the business network.
         */
        this.newInstance = function newInstance(ns, type, id) {
            return factory.newInstance(ns, type, id);
        };

        /**
         * Create a new relationship with a given namespace, type, and identifier.
         * A relationship is a typed pointer to an instance. For example, a new
         * relationship with namespace 'org.acme', type 'Vehicle' and identifier
         * 'VEHICLE_1' creates` a pointer that points at an existing instance of
         * org.acme.Vehicle with the identifier 'VEHICLE_1'.
         * @example
         * // The existing driver of the vehicle.
         * var driver;
         * // Get the factory.
         * var factory = getFactory();
         * // Create a new relationship to the vehicle.
         * var vehicle = factory.newRelationship('org.acme', 'Vehicle', 'VEHICLE_1');
         * // Set the relationship as the value of the vehicle property of the driver.
         * driver.vehicle = vehicle;
         * @public
         * @method module:ibm-concerto-runtime.Factory#newRelationship
         * @param {string} ns The namespace of the resource referenced by the relationship.
         * @param {string} type The type of the resource referenced by the relationship.
         * @param {string} id The identifier of the resource referenced by the relationship.
         * @return {Relationship} The new instance of the relationship.
         * @throws {Error} If the specified type (specified by the namespace and
         * type) is not defined in the current version of the business network.
         */
        this.newRelationship = function newRelationship(ns, type, id) {
            return factory.newRelationship(ns, type, id);
        };

        Object.freeze(this);
        LOG.exit(method);
    }

}

module.exports = Factory;