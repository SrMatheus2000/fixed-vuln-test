nodes => {
  if (!Array.isArray(nodes)) {
    return Node.onDuplicate([nodes])
  }

  if (nodes && nodes.length > 0) {
    const lastNode = nodes[nodes.length - 1]
    const parent = lastNode.parent
    const editor = lastNode.editor

    editor.deselect(editor.multiselection.nodes)

    // duplicate the nodes
    const oldSelection = editor.getDomSelection()
    let afterNode = lastNode
    const clones = nodes.map(node => {
      const clone = node.clone()
      if (node.parent.type === 'object') {
        const existingFieldNames = node.parent.getFieldNames()
        clone.field = findUniqueName(node.field, existingFieldNames)
      }
      parent.insertAfter(clone, afterNode)
      afterNode = clone
      return clone
    })

    // set selection to the duplicated nodes
    if (nodes.length === 1) {
      if (clones[0].parent.type === 'object') {
        // when duplicating a single object property,
        // set focus to the field and keep the original field name
        clones[0].dom.field.innerHTML = this._escapeHTML(nodes[0].field)
        clones[0].focus('field')
      } else {
        clones[0].focus()
      }
    } else {
      editor.select(clones)
    }
    const newSelection = editor.getDomSelection()

    editor._onAction('duplicateNodes', {
      paths: nodes.map(getInternalPath),
      clonePaths: clones.map(getInternalPath),
      afterPath: lastNode.getInternalPath(),
      parentPath: parent.getInternalPath(),
      oldSelection: oldSelection,
      newSelection: newSelection
    })
  }
}