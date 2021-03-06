/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const ClassDeclaration = require('../introspect/classdeclaration');
const EnumDeclaration = require('../introspect/enumdeclaration');
const Introspector = require('../introspect/introspector');
const Field = require('../introspect/field');
const leftPad = require('left-pad');
const ModelUtil = require('../modelutil');
const RelationshipDeclaration = require('../introspect/relationshipdeclaration');
const Util = require('../util');
const ValueGeneratorFactory = require('./valuegenerator');
const Globalize = require('../globalize');

/**
 * Generate sample instance data for the specified class declaration
 * and resource instance. The specified resource instance will be
 * updated with either default values or generated sample data.
 * @private
 * @class
 * @memberof module:composer-common
 */
class InstanceGenerator {

    /**
     * Visitor design pattern
     * @param {Object} thing - the object being visited
     * @param {Object} parameters  - the parameter
     * @return {Object} the result of visiting or null
     * @private
     */
    visit(thing, parameters) {
        if (thing instanceof ClassDeclaration) {
            return this.visitClassDeclaration(thing, parameters);
        } else if (thing instanceof RelationshipDeclaration) {
            return this.visitRelationshipDeclaration(thing, parameters);
        } else if (thing instanceof Field) {
            return this.visitField(thing, parameters);
        } else {
            throw new Error('Unrecognised ' + JSON.stringify(thing) );
        }
    }

    /**
     * Visitor design pattern
     * @param {ClassDeclaration} classDeclaration - the object being visited
     * @param {Object} parameters  - the parameter
     * @return {Object} the result of visiting or null
     * @private
     */
    visitClassDeclaration(classDeclaration, parameters) {
        const obj = parameters.stack.pop();
        const properties = classDeclaration.getProperties();
        for(let n=0; n < properties.length; n++) {
            const property = properties[n];
            const value = obj[property.getName()];
            if(Util.isNull(value)) {
                obj[property.getName()] = property.accept(this,parameters);
            }
        }
        return obj;
    }

    /**
     * Visitor design pattern
     * @param {Field} field - the object being visited
     * @param {Object} parameters  - the parameter
     * @return {Object} the result of visiting or null
     * @private
     */
    visitField(field, parameters) {

        if (field.isArray()) {
            let result = [];
            for (let i = 0; i < 3; i++) {
                result.push(this.getFieldValue(field, parameters));
            }
            return result;
        } else {
            return this.getFieldValue(field, parameters);
        }
    }

    /**
     * Get a value for the specified field.
     * @param {Field} field - the object being visited
     * @param {Object} parameters  - the parameter
     * @return {*} A value for the specified field.
     */
    getFieldValue(field, parameters) {
        let type = field.getFullyQualifiedTypeName();
        let valueGenerator = parameters.valueGenerator || ValueGeneratorFactory.sample();
        if (ModelUtil.isPrimitiveType(type)) {
            switch(type) {
            case 'DateTime':
                return valueGenerator.getDateTime();
            case 'Integer':
                return valueGenerator.getInteger();
            case 'Long':
                return valueGenerator.getLong();
            case 'Double':
                return valueGenerator.getDouble();
            case 'Boolean':
                return valueGenerator.getBoolean();
            default:
                return valueGenerator.getString();
            }
        }
        let classDeclaration = parameters.modelManager.getType(type);
        if (classDeclaration instanceof EnumDeclaration) {
            let enumValues = classDeclaration.getOwnProperties();
            return valueGenerator.getEnum(enumValues).getName();
        }
        else if (classDeclaration.isAbstract) {
            let newClassDecl = this.findExtendingLeafType(classDeclaration);
            if(newClassDecl !== null) {
                classDeclaration = newClassDecl;
                type = newClassDecl.getName();
            }
        }

        if (classDeclaration.isConcept()) {
            let concept = parameters.factory.newConcept(classDeclaration.getModelFile().getNamespace(), classDeclaration.getName());
            parameters.stack.push(concept);
            return classDeclaration.accept(this, parameters);
        } else {
            let identifierFieldName = classDeclaration.getIdentifierFieldName();
            let idx = Math.round(Math.random() * 9999).toString();
            idx = leftPad(idx, 4, '0');
            let id = `${identifierFieldName}:${idx}`;
            let resource = parameters.factory.newResource(classDeclaration.getModelFile().getNamespace(), classDeclaration.getName(), id);
            parameters.stack.push(resource);
            return classDeclaration.accept(this, parameters);
        }
    }

    /**
     * Find a type that extends the provided abstract type and return it.
     * TODO: work out whether this has to be a leaf node or whether the closest type can be used
     * It depends really since the closest type will satisfy the model but whether it satisfies
     * any transaction code which attempts to use the generated resource is another matter.
     * @param {any} inputType the class declaration.
     * @return {any} the closest extending concrete class definition - null if none are found.
     */
    findExtendingLeafType(inputType) {
        let modelManager = inputType.getModelFile().getModelManager();
        let returnType = null;
        if(inputType.isAbstract()) {
            let introspector = new Introspector(modelManager);
            let allClassDeclarations = introspector.getClassDeclarations();
            let contenders = [];
            allClassDeclarations.forEach((classDecl) => {
                let superType = classDecl.getSuperType();
                if(!classDecl.isAbstract() && (superType !== null)) {
                    if(superType === inputType.getFullyQualifiedName()) {
                        contenders.push(classDecl);
                    }
                }
            });

            if(contenders.length > 0) {
                returnType = contenders[0];
            } else {
                let formatter = Globalize.messageFormatter('instancegenerator-newinstance-noconcreteclass');
                throw new Error(formatter({
                    type: inputType.getFullyQualifiedName()
                }));
            }
        } else {
            // we haven't been given an abstract type so just return what we were given.
            returnType = inputType;
        }
        return returnType;
    }



    /**
     * Visitor design pattern
     * @param {RelationshipDeclaration} relationshipDeclaration - the object being visited
     * @param {Object} parameters  - the parameter
     * @return {Object} the result of visiting or null
     * @private
     */
    visitRelationshipDeclaration(relationshipDeclaration, parameters) {
        let classDeclaration = parameters.modelManager.getType(relationshipDeclaration.getFullyQualifiedTypeName());
        let identifierFieldName = classDeclaration.getIdentifierFieldName();
        let factory = parameters.factory;
        if (relationshipDeclaration.isArray()) {
            let result = [];
            for (let i = 0; i < 3; i++) {
                let idx = Math.round(Math.random() * 9999).toString();
                idx = leftPad(idx, 4, '0');
                let id = `${identifierFieldName}:${idx}`;
                let relationship = factory.newRelationship(classDeclaration.getModelFile().getNamespace(), classDeclaration.getName(), id);
                result.push(relationship);
            }
            return result;
        } else {
            let idx = Math.round(Math.random() * 9999).toString();
            idx = leftPad(idx, 4, '0');
            let id = `${identifierFieldName}:${idx}`;
            let relationship = factory.newRelationship(classDeclaration.getModelFile().getNamespace(), classDeclaration.getName(), id);
            return relationship;
        }
    }

}

module.exports = InstanceGenerator;
