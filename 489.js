function compiler(markdown, options) {
  options = options || {};
  options.overrides = options.overrides || {};
  options.slugify = options.slugify || slugify;

  const createElementFn = options.createElement || React.createElement;

  // eslint-disable-next-line no-unused-vars
  function h(tag, props, ...children) {
    const overrideProps = get(options.overrides, `${tag}.props`, {});

    return createElementFn(
      getTag(tag, options.overrides),
      {
        ...props,
        ...overrideProps,
        className:
          cx(props && props.className, overrideProps.className) || undefined,
      },
      ...children
    );
  }

  function compile(input) {
    let inline = false;

    if (options.forceInline) {
      inline = true;
    } else if (!options.forceBlock) {
      /**
       * should not contain any block-level markdown like newlines, lists, headings,
       * thematic breaks, blockquotes, tables, etc
       */
      inline = SHOULD_RENDER_AS_BLOCK_R.test(input) === false;
    }

    const arr = emitter(
      parser(
        inline
          ? input
          : `${input.replace(TRIM_NEWLINES_AND_TRAILING_WHITESPACE_R, '')}\n\n`,
        { inline }
      )
    );

    let jsx;
    if (arr.length > 1) {
      jsx = inline ? <span key="outer">{arr}</span> : <div key="outer">{arr}</div>;
    } else if (arr.length === 1) {
      jsx = arr[0];

      // TODO: remove this for React 16
      if (typeof jsx === 'string') {
        jsx = <span key="outer">{jsx}</span>;
      }
    } else {
      // TODO: return null for React 16
      jsx = <span key="outer" />;
    }

    return jsx;
  }

  function attrStringToMap(str) {
    const attributes = str.match(ATTR_EXTRACTOR_R);

    return attributes
      ? attributes.reduce(function(map, raw, index) {
          const delimiterIdx = raw.indexOf('=');

          if (delimiterIdx !== -1) {
            const key = normalizeAttributeKey(
              raw.slice(0, delimiterIdx)
            ).trim();
            const value = unquote(raw.slice(delimiterIdx + 1).trim());

            const mappedKey = ATTRIBUTE_TO_JSX_PROP_MAP[key] || key;
            const normalizedValue = (map[
              mappedKey
            ] = attributeValueToJSXPropValue(key, value));

            if (
              HTML_BLOCK_ELEMENT_R.test(normalizedValue) ||
              HTML_SELF_CLOSING_ELEMENT_R.test(normalizedValue)
            ) {
              map[mappedKey] = React.cloneElement(
                compile(normalizedValue.trim()),
                { key: index }
              );
            }
          } else {
            map[ATTRIBUTE_TO_JSX_PROP_MAP[raw] || raw] = true;
          }

          return map;
        }, {})
      : undefined;
  }

  /* istanbul ignore next */
  if (process.env.NODE_ENV !== 'production') {
    if (typeof markdown !== 'string') {
      throw new Error(`markdown-to-jsx: the first argument must be
                             a string`);
    }

    if (
      Object.prototype.toString.call(options.overrides) !== '[object Object]'
    ) {
      throw new Error(`markdown-to-jsx: options.overrides (second argument property) must be
                             undefined or an object literal with shape:
                             {
                                htmltagname: {
                                    component: string|ReactComponent(optional),
                                    props: object(optional)
                                }
                             }`);
    }
  }

  const footnotes = [];
  const refs = {};

  /**
   * each rule's react() output function goes through our custom h() JSX pragma;
   * this allows the override functionality to be automatically applied
   */
  const rules = {
    blockQuote: {
      match: blockRegex(BLOCKQUOTE_R),
      order: PARSE_PRIORITY_HIGH,
      parse(capture, parse, state) {
        return {
          content: parse(
            capture[0].replace(BLOCKQUOTE_TRIM_LEFT_MULTILINE_R, ''),
            state
          ),
        };
      },
      react(node, output, state) {
        return (
          <blockquote key={state.key}>{output(node.content, state)}</blockquote>
        );
      },
    },

    breakLine: {
      match: anyScopeRegex(BREAK_LINE_R),
      order: PARSE_PRIORITY_HIGH,
      parse: captureNothing,
      react(_, __, state) {
        return <br key={state.key} />;
      },
    },

    breakThematic: {
      match: blockRegex(BREAK_THEMATIC_R),
      order: PARSE_PRIORITY_HIGH,
      parse: captureNothing,
      react(_, __, state) {
        return <hr key={state.key} />;
      },
    },

    codeBlock: {
      match: blockRegex(CODE_BLOCK_R),
      order: PARSE_PRIORITY_MAX,
      parse(capture /*, parse, state*/) {
        let content = capture[0].replace(/^ {4}/gm, '').replace(/\n+$/, '');
        return {
          content: content,
          lang: undefined,
        };
      },

      react(node, output, state) {
        return (
          <pre key={state.key}>
            <code className={node.lang ? `lang-${node.lang}` : ''}>
              {node.content}
            </code>
          </pre>
        );
      },
    },

    codeFenced: {
      match: blockRegex(CODE_BLOCK_FENCED_R),
      order: PARSE_PRIORITY_MAX,
      parse(capture /*, parse, state*/) {
        return {
          content: capture[3],
          lang: capture[2] || undefined,
          type: 'codeBlock',
        };
      },
    },

    codeInline: {
      match: simpleInlineRegex(CODE_INLINE_R),
      order: PARSE_PRIORITY_LOW,
      parse(capture /*, parse, state*/) {
        return {
          content: capture[2],
        };
      },
      react(node, output, state) {
        return <code key={state.key}>{node.content}</code>;
      },
    },

    /**
     * footnotes are emitted at the end of compilation in a special <footer> block
     */
    footnote: {
      match: blockRegex(FOOTNOTE_R),
      order: PARSE_PRIORITY_MAX,
      parse(capture /*, parse, state*/) {
        footnotes.push({
          footnote: capture[2],
          identifier: capture[1],
        });

        return {};
      },
      react: renderNothing,
    },

    footnoteReference: {
      match: inlineRegex(FOOTNOTE_REFERENCE_R),
      order: PARSE_PRIORITY_HIGH,
      parse(capture /*, parse*/) {
        return {
          content: capture[1],
          target: `#${capture[1]}`,
        };
      },
      react(node, output, state) {
        return (
          <a key={state.key} href={sanitizeUrl(node.target)}>
            <sup key={state.key}>{node.content}</sup>
          </a>
        );
      },
    },

    gfmTask: {
      match: inlineRegex(GFM_TASK_R),
      order: PARSE_PRIORITY_HIGH,
      parse(capture /*, parse, state*/) {
        return {
          completed: capture[1].toLowerCase() === 'x',
        };
      },
      react(node, output, state) {
        return (
          <input
            checked={node.completed}
            key={state.key}
            readOnly
            type="checkbox"
          />
        );
      },
    },

    heading: {
      match: blockRegex(HEADING_R),
      order: PARSE_PRIORITY_HIGH,
      parse(capture, parse, state) {
        return {
          content: parseInline(parse, capture[2], state),
          id: options.slugify(capture[2]),
          level: capture[1].length,
        };
      },
      react(node, output, state) {
        const Tag = `h${node.level}`;
        return (
          <Tag id={node.id} key={state.key}>
            {output(node.content, state)}
          </Tag>
        );
      },
    },

    headingSetext: {
      match: blockRegex(HEADING_SETEXT_R),
      order: PARSE_PRIORITY_MAX,
      parse(capture, parse, state) {
        return {
          content: parseInline(parse, capture[1], state),
          level: capture[2] === '=' ? 1 : 2,
          type: 'heading',
        };
      },
    },

    htmlBlock: {
      /**
       * find the first matching end tag and process the interior
       */
      match: anyScopeRegex(HTML_BLOCK_ELEMENT_R),
      order: PARSE_PRIORITY_HIGH,
      parse(capture, parse, state) {
        const [, whitespace] = capture[3].match(HTML_LEFT_TRIM_AMOUNT_R);
        const trimmer = new RegExp(`^${whitespace}`, 'gm');
        const trimmed = capture[3].replace(trimmer, '');

        const parseFunc = containsBlockSyntax(trimmed)
          ? parseBlock
          : parseInline;

        const tagName = capture[1].toLowerCase();
        const noInnerParse =
          DO_NOT_PROCESS_HTML_ELEMENTS.indexOf(tagName) !== -1;

        return {
          attrs: attrStringToMap(capture[2]),
          /**
           * if another html block is detected within, parse as block,
           * otherwise parse as inline to pick up any further markdown
           */
          content: noInnerParse ? capture[3] : parseFunc(parse, trimmed, state),

          noInnerParse,

          tag: noInnerParse ? tagName : capture[1]
        };
      },
      react(node, output, state) {
        return (
          <node.tag key={state.key} {...node.attrs}>
            {node.noInnerParse ? node.content : output(node.content, state)}
          </node.tag>
        );
      },
    },

    htmlComment: {
      match: anyScopeRegex(HTML_COMMENT_R),
      order: PARSE_PRIORITY_HIGH,
      parse() {
        return {};
      },
      react: renderNothing,
    },

    htmlSelfClosing: {
      /**
       * find the first matching end tag and process the interior
       */
      match: anyScopeRegex(HTML_SELF_CLOSING_ELEMENT_R),
      order: PARSE_PRIORITY_HIGH,
      parse(capture /*, parse, state*/) {
        return {
          attrs: attrStringToMap(capture[2] || ''),
          tag: capture[1],
        };
      },
      react(node, output, state) {
        return <node.tag {...node.attrs} key={state.key} />;
      },
    },

    image: {
      match: simpleInlineRegex(IMAGE_R),
      order: PARSE_PRIORITY_HIGH,
      parse(capture /*, parse, state*/) {
        return {
          alt: capture[1],
          target: unescapeUrl(capture[2]),
          title: capture[3],
        };
      },
      react(node, output, state) {
        return (
          <img
            key={state.key}
            alt={node.alt || undefined}
            title={node.title || undefined}
            src={sanitizeUrl(node.target)}
          />
        );
      },
    },

    link: {
      match: inlineRegex(LINK_R, false),
      order: PARSE_PRIORITY_LOW,
      parse(capture, parse, state) {
        return {
          content: parseSimpleInline(parse, capture[1], state),
          target: unescapeUrl(capture[2]),
          title: capture[3],
        };
      },
      react(node, output, state) {
        return (
          <a key={state.key} href={sanitizeUrl(node.target)} title={node.title}>
            {output(node.content, state)}
          </a>
        );
      },
    },

    // https://daringfireball.net/projects/markdown/syntax#autolink
    linkAngleBraceStyleDetector: {
      match: inlineRegex(LINK_AUTOLINK_R),
      order: PARSE_PRIORITY_MAX,
      parse(capture /*, parse, state*/) {
        return {
          content: [
            {
              content: capture[1],
              type: 'text',
            },
          ],
          target: capture[1],
          type: 'link',
        };
      },
    },

    linkBareUrlDetector: {
      match: inlineRegex(LINK_AUTOLINK_BARE_URL_R),
      order: PARSE_PRIORITY_MAX,
      parse(capture /*, parse, state*/) {
        return {
          content: [
            {
              content: capture[1],
              type: 'text',
            },
          ],
          target: capture[1],
          title: undefined,
          type: 'link',
        };
      },
    },

    linkMailtoDetector: {
      match: inlineRegex(LINK_AUTOLINK_MAILTO_R),
      order: PARSE_PRIORITY_MAX,
      parse(capture /*, parse, state*/) {
        let address = capture[1];
        let target = capture[1];

        // Check for a `mailto:` already existing in the link:
        if (!AUTOLINK_MAILTO_CHECK_R.test(target)) {
          target = 'mailto:' + target;
        }

        return {
          content: [
            {
              content: address.replace('mailto:', ''),
              type: 'text',
            },
          ],
          target: target,
          type: 'link',
        };
      },
    },

    list: {
      match(source, state, prevCapture) {
        // We only want to break into a list if we are at the start of a
        // line. This is to avoid parsing "hi * there" with "* there"
        // becoming a part of a list.
        // You might wonder, "but that's inline, so of course it wouldn't
        // start a list?". You would be correct! Except that some of our
        // lists can be inline, because they might be inside another list,
        // in which case we can parse with inline scope, but need to allow
        // nested lists inside this inline scope.
        const isStartOfLine = LIST_LOOKBEHIND_R.exec(prevCapture);
        const isListBlock = state._list || !state.inline;

        if (isStartOfLine && isListBlock) {
          source = isStartOfLine[1] + source;

          return LIST_R.exec(source);
        } else {
          return null;
        }
      },
      order: PARSE_PRIORITY_HIGH,
      parse(capture, parse, state) {
        const bullet = capture[2];
        const ordered = bullet.length > 1;
        const start = ordered ? +bullet : undefined;
        const items = capture[0]
          // recognize the end of a paragraph block inside a list item:
          // two or more newlines at end end of the item
          .replace(BLOCK_END_R, '\n')
          .match(LIST_ITEM_R);

        let lastItemWasAParagraph = false;
        const itemContent = items.map(function(item, i) {
          // We need to see how far indented the item is:
          const space = LIST_ITEM_PREFIX_R.exec(item)[0].length;

          // And then we construct a regex to "unindent" the subsequent
          // lines of the items by that amount:
          const spaceRegex = new RegExp('^ {1,' + space + '}', 'gm');

          // Before processing the item, we need a couple things
          const content = item
            // remove indents on trailing lines:
            .replace(spaceRegex, '')
            // remove the bullet:
            .replace(LIST_ITEM_PREFIX_R, '');

          // Handling "loose" lists, like:
          //
          //  * this is wrapped in a paragraph
          //
          //  * as is this
          //
          //  * as is this
          const isLastItem = i === items.length - 1;
          const containsBlocks = content.indexOf('\n\n') !== -1;

          // Any element in a list is a block if it contains multiple
          // newlines. The last element in the list can also be a block
          // if the previous item in the list was a block (this is
          // because non-last items in the list can end with \n\n, but
          // the last item can't, so we just "inherit" this property
          // from our previous element).
          const thisItemIsAParagraph =
            containsBlocks || (isLastItem && lastItemWasAParagraph);
          lastItemWasAParagraph = thisItemIsAParagraph;

          // backup our state for restoration afterwards. We're going to
          // want to set state._list to true, and state.inline depending
          // on our list's looseness.
          const oldStateInline = state.inline;
          const oldStateList = state._list;
          state._list = true;

          // Parse inline if we're in a tight list, or block if we're in
          // a loose list.
          let adjustedContent;
          if (thisItemIsAParagraph) {
            state.inline = false;
            adjustedContent = content.replace(LIST_ITEM_END_R, '\n\n');
          } else {
            state.inline = true;
            adjustedContent = content.replace(LIST_ITEM_END_R, '');
          }

          const result = parse(adjustedContent, state);

          // Restore our state before returning
          state.inline = oldStateInline;
          state._list = oldStateList;

          return result;
        });

        return {
          items: itemContent,
          ordered: ordered,
          start: start,
        };
      },
      react(node, output, state) {
        const Tag = node.ordered ? 'ol' : 'ul';

        return (
          <Tag key={state.key} start={node.start}>
            {node.items.map(function generateListItem(item, i) {
              return <li key={i}>{output(item, state)}</li>;
            })}
          </Tag>
        );
      },
    },

    newlineCoalescer: {
      match: blockRegex(CONSECUTIVE_NEWLINE_R),
      order: PARSE_PRIORITY_LOW,
      parse: captureNothing,
      react(/*node, output, state*/) {
        return '\n';
      },
    },

    paragraph: {
      match: blockRegex(PARAGRAPH_R),
      order: PARSE_PRIORITY_LOW,
      parse: parseCaptureInline,
      react(node, output, state) {
        return <p key={state.key}>{output(node.content, state)}</p>;
      },
    },

    ref: {
      match: inlineRegex(REFERENCE_IMAGE_OR_LINK),
      order: PARSE_PRIORITY_MAX,
      parse(capture /*, parse*/) {
        refs[capture[1]] = {
          target: capture[2],
          title: capture[4],
        };

        return {};
      },
      react: renderNothing,
    },

    refImage: {
      match: simpleInlineRegex(REFERENCE_IMAGE_R),
      order: PARSE_PRIORITY_MAX,
      parse(capture) {
        return {
          alt: capture[1] || undefined,
          ref: capture[2],
        };
      },
      react(node, output, state) {
        return (
          <img
            key={state.key}
            alt={node.alt}
            src={sanitizeUrl(refs[node.ref].target)}
            title={refs[node.ref].title}
          />
        );
      },
    },

    refLink: {
      match: inlineRegex(REFERENCE_LINK_R),
      order: PARSE_PRIORITY_MAX,
      parse(capture, parse, state) {
        return {
          content: parse(capture[1], state),
          fallbackContent: parse(capture[0].replace(SQUARE_BRACKETS_R, '\\$1'), state),
          ref: capture[2],
        };
      },
      react(node, output, state) {
        return refs[node.ref] ? (
          <a
            key={state.key}
            href={sanitizeUrl(refs[node.ref].target)}
            title={refs[node.ref].title}
          >
            {output(node.content, state)}
          </a>
        ) : <span key={state.key}>{output(node.fallbackContent, state)}</span>;
      },
    },

    table: {
      match: blockRegex(NP_TABLE_R),
      order: PARSE_PRIORITY_HIGH,
      parse: parseTable,
      react(node, output, state) {
        return (
          <table key={state.key}>
            <thead>
              <tr>
                {node.header.map(function generateHeaderCell(content, i) {
                  return (
                    <th key={i} style={getTableStyle(node, i)}>
                      {output(content, state)}
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {node.cells.map(function generateTableRow(row, i) {
                return (
                  <tr key={i}>
                    {row.map(function generateTableCell(content, c) {
                      return (
                        <td key={c} style={getTableStyle(node, c)}>
                          {output(content, state)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        );
      },
    },

    text: {
      // Here we look for anything followed by non-symbols,
      // double newlines, or double-space-newlines
      // We break on any symbol characters so that this grammar
      // is easy to extend without needing to modify this regex
      match: anyScopeRegex(TEXT_PLAIN_R),
      order: PARSE_PRIORITY_MIN,
      parse(capture /*, parse, state*/) {
        return {
          content: capture[0]
            // nbsp -> unicode equivalent for named chars
            .replace(HTML_CHAR_CODE_R, (full, inner) => {
              return namedCodesToUnicode[inner]
                ? namedCodesToUnicode[inner]
                : full;
            }),
        };
      },
      react(node /*, output, state*/) {
        return node.content;
      },
    },

    textBolded: {
      match: simpleInlineRegex(TEXT_BOLD_R),
      order: PARSE_PRIORITY_MED,
      parse(capture, parse, state) {
        return {
          // capture[1] -> the syntax control character
          // capture[2] -> inner content
          content: parse(capture[2], state),
        };
      },
      react(node, output, state) {
        return <strong key={state.key}>{output(node.content, state)}</strong>;
      },
    },

    textEmphasized: {
      match: simpleInlineRegex(TEXT_EMPHASIZED_R),
      order: PARSE_PRIORITY_LOW,
      parse(capture, parse, state) {
        return {
          // capture[1] -> opening * or _
          // capture[2] -> inner content
          content: parse(capture[2], state),
        };
      },
      react(node, output, state) {
        return <em key={state.key}>{output(node.content, state)}</em>;
      },
    },

    textEscaped: {
      // We don't allow escaping numbers, letters, or spaces here so that
      // backslashes used in plain text still get rendered. But allowing
      // escaping anything else provides a very flexible escape mechanism,
      // regardless of how this grammar is extended.
      match: simpleInlineRegex(TEXT_ESCAPED_R),
      order: PARSE_PRIORITY_HIGH,
      parse(capture /*, parse, state*/) {
        return {
          content: capture[1],
          type: 'text',
        };
      },
    },

    textStrikethroughed: {
      match: simpleInlineRegex(TEXT_STRIKETHROUGHED_R),
      order: PARSE_PRIORITY_LOW,
      parse: parseCaptureInline,
      react(node, output, state) {
        return <del key={state.key}>{output(node.content, state)}</del>;
      },
    },
  };

  // Object.keys(rules).forEach(key => {
  //     let { match, parse } = rules[key];

  //     rules[key].match = (...args) => {
  //         const start = performance.now();
  //         const result = match(...args);
  //         const delta = performance.now() - start;

  //         if (delta > 5)
  //             console.warn(
  //                 `Slow match for ${key}: ${delta.toFixed(3)}ms, input: ${
  //                     args[0]
  //                 }`
  //             );

  //         return result;
  //     };

  //     rules[key].parse = (...args) => {
  //         const start = performance.now();
  //         const result = parse(...args);
  //         const delta = performance.now() - start;

  //         if (delta > 5)
  //             console.warn(`Slow parse for ${key}: ${delta.toFixed(3)}ms`);

  //         console.log(`${key}:parse`, `${delta.toFixed(3)}ms`, args[0]);

  //         return result;
  //     };
  // });

  const parser = parserFor(rules);
  const emitter = reactFor(ruleOutput(rules));

  const jsx = compile(markdown);

  if (footnotes.length) {
    jsx.props.children.push(
      <footer key="footer">
        {footnotes.map(function createFootnote(def) {
          return (
            <div id={def.identifier} key={def.identifier}>
              {def.identifier}
              {emitter(parser(def.footnote, { inline: true }))}
            </div>
          );
        })}
      </footer>
    );
  }

  return jsx;
}