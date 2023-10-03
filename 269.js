function setDeepProperty(obj, propertyPath, value) {
    if (!obj) {
        throw new Error("Invalid object");
    }
    if (!propertyPath) {
        throw new Error("Invalid property path");
    }
    const pathParts = splitPath(propertyPath);
    const pathPartsLen = pathParts.length;
    for (let i = 0; i < pathPartsLen - 1; i++) {
        const pathPart = pathParts[i];
        if (!(pathPart in obj)) {
            setProp(obj, pathPart, {});
        }
        obj = getProp(obj, pathPart);
    }
    setProp(obj, pathParts[pathPartsLen - 1], value);
    return;
}