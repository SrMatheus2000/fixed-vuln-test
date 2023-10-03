function fixInvalidChildren(nodes) {
			var ni, node, parent, parents, newParent, currentNode, tempNode, childNode, i;
			var nonEmptyElements, nonSplitableElements, textBlockElements, specialElements, sibling, nextNode;

			nonSplitableElements = makeMap('tr,td,th,tbody,thead,tfoot,table');
			nonEmptyElements = schema.getNonEmptyElements();
			textBlockElements = schema.getTextBlockElements();
			specialElements = schema.getSpecialElements();

			for (ni = 0; ni < nodes.length; ni++) {
				node = nodes[ni];

				// Already removed or fixed
				if (!node.parent || node.fixed) {
					continue;
				}

				// If the invalid element is a text block and the text block is within a parent LI element
				// Then unwrap the first text block and convert other sibling text blocks to LI elements similar to Word/Open Office
				if (textBlockElements[node.name] && node.parent.name == 'li') {
					// Move sibling text blocks after LI element
					sibling = node.next;
					while (sibling) {
						if (textBlockElements[sibling.name]) {
							sibling.name = 'li';
							sibling.fixed = true;
							node.parent.insert(sibling, node.parent);
						} else {
							break;
						}

						sibling = sibling.next;
					}

					// Unwrap current text block
					node.unwrap(node);
					continue;
				}

				// Get list of all parent nodes until we find a valid parent to stick the child into
				parents = [node];
				for (parent = node.parent; parent && !schema.isValidChild(parent.name, node.name) &&
					!nonSplitableElements[parent.name]; parent = parent.parent) {
					parents.push(parent);
				}

				// Found a suitable parent
				if (parent && parents.length > 1) {
					// Reverse the array since it makes looping easier
					parents.reverse();

					// Clone the related parent and insert that after the moved node
					newParent = currentNode = self.filterNode(parents[0].clone());

					// Start cloning and moving children on the left side of the target node
					for (i = 0; i < parents.length - 1; i++) {
						if (schema.isValidChild(currentNode.name, parents[i].name)) {
							tempNode = self.filterNode(parents[i].clone());
							currentNode.append(tempNode);
						} else {
							tempNode = currentNode;
						}

						for (childNode = parents[i].firstChild; childNode && childNode != parents[i + 1];) {
							nextNode = childNode.next;
							tempNode.append(childNode);
							childNode = nextNode;
						}

						currentNode = tempNode;
					}

					if (!newParent.isEmpty(nonEmptyElements)) {
						parent.insert(newParent, parents[0], true);
						parent.insert(node, newParent);
					} else {
						parent.insert(node, parents[0], true);
					}

					// Check if the element is empty by looking through it's contents and special treatment for <p><br /></p>
					parent = parents[0];
					if (parent.isEmpty(nonEmptyElements) || parent.firstChild === parent.lastChild && parent.firstChild.name === 'br') {
						parent.empty().remove();
					}
				} else if (node.parent) {
					// If it's an LI try to find a UL/OL for it or wrap it
					if (node.name === 'li') {
						sibling = node.prev;
						if (sibling && (sibling.name === 'ul' || sibling.name === 'ul')) {
							sibling.append(node);
							continue;
						}

						sibling = node.next;
						if (sibling && (sibling.name === 'ul' || sibling.name === 'ul')) {
							sibling.insert(node, sibling.firstChild, true);
							continue;
						}

						node.wrap(self.filterNode(new Node('ul', 1)));
						continue;
					}

					// Try wrapping the element in a DIV
					if (schema.isValidChild(node.parent.name, 'div') && schema.isValidChild('div', node.name)) {
						node.wrap(self.filterNode(new Node('div', 1)));
					} else {
						// We failed wrapping it, then remove or unwrap it
						if (specialElements[node.name]) {
							node.empty().remove();
						} else {
							node.unwrap();
						}
					}
				}
			}
		}