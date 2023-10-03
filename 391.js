function unique_name_199 (node, initialScope) {
        const calleeNode = node.callee
        const args = getElementValues(node.arguments, initialScope)

        if (args != null) {
            if (calleeNode.type === "MemberExpression") {
                const object = getStaticValueR(calleeNode.object, initialScope)
                const property = calleeNode.computed
                    ? getStaticValueR(calleeNode.property, initialScope)
                    : { value: calleeNode.property.name }

                if (object != null && property != null) {
                    const receiver = object.value
                    const methodName = property.value
                    if (callAllowed.has(receiver[methodName])) {
                        return { value: receiver[methodName](...args) }
                    }
                    if (callPassThrough.has(receiver[methodName])) {
                        return { value: args[0] }
                    }
                }
            } else {
                const callee = getStaticValueR(calleeNode, initialScope)
                if (callee != null) {
                    const func = callee.value
                    if (callAllowed.has(func)) {
                        return { value: func(...args) }
                    }
                    if (callPassThrough.has(func)) {
                        return { value: args[0] }
                    }
                }
            }
        }

        return null
    }