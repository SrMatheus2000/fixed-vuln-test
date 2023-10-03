function _setNestedProperty(currentObject, currentProperty, segments, index) {
            if (currentObject === Reflect.getPrototypeOf({})) {
                throw new ObjectPrototypeMutationError("Attempting to mutate Object.prototype");
            }

            if (!currentObject[currentProperty]) {
                const nextPropIsNumber = Number.isInteger(Number(segments[index + 1]));
                const nextPropIsArrayWildcard = segments[index + 1] === ARRAY_WILDCARD;

                if (nextPropIsNumber || nextPropIsArrayWildcard) {
                    currentObject[currentProperty] = [];
                } else {
                    currentObject[currentProperty] = {};
                }
            }

            if (isLastSegment(segments, index)) {
                currentObject[currentProperty] = value;
            }

            return currentObject[currentProperty];
        }