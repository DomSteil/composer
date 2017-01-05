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

const AssetRegistry = require('./api/assetregistry');
const Factory = require('./api/factory');
const Logger = require('@ibm/ibm-concerto-common').Logger;
const ParticipantRegistry = require('./api/participantregistry');

const LOG = Logger.getLog('Api');

/**
 * A class that contains the root of the transaction processor API. Methods in this
 * class are made available as global functions which can be called by transaction
 * processor functions. The transaction processor API should expose no internal
 * properties or internal methods which could be accessed or misused.
 * @private
 * @class
 * @memberof module:ibm-concerto-runtime
 */
class Api {

    /**
     * Constructor.
     * @param {Factory} factory The factory to use.
     * @param {Resource} participant The current participant.
     * @param {RegistryManager} registryManager The registry manager to use.
     * @private
     */
    constructor(factory, participant, registryManager) {
        const method = 'constructor';
        LOG.entry(method, factory, participant, registryManager);

        /**
         * Get the factory. The factory can be used to create new instances of
         * assets, participants, and transactions for storing in registries. The
         * factory can also be used for creating relationships to assets, particpants,
         * and transactions.
         * @example
         * // Get the factory.
         * var factory = getFactory();
         * @method module:ibm-concerto-runtime#getFactory
         * @public
         * @return {module:ibm-concerto-runtime.Factory} The factory.
         */
        this.getFactory = function getFactory() {
            const method = 'getFactory';
            LOG.entry(method);
            let result = new Factory(factory);
            LOG.exit(method, result);
            return result;
        };

        /**
         * Get an existing asset registry using the unique identifier of the asset
         * registry. An asset registry can be used to retrieve, update, or delete
         * existing assets, or create new assets.
         * @example
         * // Get the vehicle asset registry.
         * return getAssetRegistry('org.acme.Vehicle')
         *   .then(function (vehicleAssetRegistry) {
         *     // Call methods on the vehicle asset registry.
         *   })
         *   .catch(function (error) {
         *     // Add optional error handling here.
         *   });
         * @method module:ibm-concerto-runtime#getAssetRegistry
         * @public
         * @param {string} id The ID of the asset registry.
         * @return {Promise} A promise. The promise is resolved with an {@link
         * module:ibm-concerto-runtime.AssetRegistry AssetRegistry} instance
         * representing the asset registry if it exists. If the asset registry
         * does not exist, or the current user does not have access to the asset
         * registry, then the promise will be rejected with an error that describes
         * the problem.
         */
        this.getAssetRegistry = function getAssetRegistry(id) {
            const method = 'getAssetRegistry';
            LOG.entry(method, id);
            return registryManager.get('Asset', id)
                .then((registry) => {
                    let result = new AssetRegistry(registry);
                    LOG.exit(method, result);
                    return result;
                });
        };

        /**
         * Get an existing participant registry using the unique identifier of the participant
         * registry. An participant registry can be used to retrieve, update, or delete
         * existing participants, or create new participants.
         * @example
         * // Get the driver participant registry.
         * return getParticipantRegistry('org.acme.Driver')
         *   .then(function (driverParticipantRegistry) {
         *     // Call methods on the driver participant registry.
         *   })
         *   .catch(function (error) {
         *     // Add optional error handling here.
         *   });
         * @method module:ibm-concerto-runtime#getParticipantRegistry
         * @public
         * @param {string} id The ID of the participant registry.
         * @return {Promise} A promise. The promise is resolved with an {@link
         * module:ibm-concerto-runtime.ParticipantRegistry ParticipantRegistry} instance
         * representing the participant registry if it exists. If the participant registry
         * does not exist, or the current user does not have access to the participant
         * registry, then the promise will be rejected with an error that describes
         * the problem.
         */
        this.getParticipantRegistry = function getParticipantRegistry(id) {
            const method = 'getParticipantRegistry';
            LOG.entry(method, id);
            return registryManager.get('Participant', id)
                .then((registry) => {
                    let result = new ParticipantRegistry(registry);
                    LOG.exit(method, result);
                    return result;
                });
        };

        /**
         * Get the current participant. The current participant is determined by
         * the identity that was used to submit the current transaction.
         * @example
         * // Get the current participant.
         * var currentParticipant = getCurrentParticipant();
         * // Check to see if the current participant is a driver.
         * if (currentParticipant.getFullyQualifiedType() !== 'org.acme.Driver') {
         *   // Throw an error as the current participant is not a driver.
         *   throw new Error('Current participant is not a driver');
         * }
         * // Check to see if the current participant is the first driver.
         * if (currentParticipant.getFullyQualifiedIdentifier() !== 'org.acme.Driver#DRIVER_1') {
         *   // Throw an error as the current participant is not a driver.
         *   throw new Error('Current participant is not the first driver');
         * }
         * @method module:ibm-concerto-runtime#getCurrentParticipant
         * @public
         * @return {module:ibm-concerto-common.Resource} The current participant,
         * or null if the transaction was submitted using an identity that does
         * not map to a participant.
         */
        this.getCurrentParticipant = function getCurrentParticipant() {
            const method = 'getCurrentParticipant';
            LOG.entry(method);
            let result = participant;
            LOG.exit(method, result);
            return result;
        };

        Object.freeze(this);
        LOG.exit(method);
    }

}

module.exports = Api;