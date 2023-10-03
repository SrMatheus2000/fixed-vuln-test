function unique_name_56(hljs) {
  const commentMode = hljs.COMMENT(/\(\*/, /\*\)/);

  const nonTerminalMode = {
    className: "attribute",
    begin: /^[ ]*[a-zA-Z]+([\s_-]+[a-zA-Z]+)*/
  };

  const specialSequenceMode = {
    className: "meta",
    begin: /\?.*\?/
  };

  const ruleBodyMode = {
    begin: /=/,
    end: /[.;]/,
    contains: [
      commentMode,
      specialSequenceMode,
      {
        // terminals
        className: 'string',
        variants: [
          hljs.APOS_STRING_MODE,
          hljs.QUOTE_STRING_MODE,
          {
            begin: '`',
            end: '`'
          }
        ]
      }
    ]
  };

  return {
    name: 'Extended Backus-Naur Form',
    illegal: /\S/,
    contains: [
      commentMode,
      nonTerminalMode,
      ruleBodyMode
    ]
  };
}