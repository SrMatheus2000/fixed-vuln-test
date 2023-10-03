function getLexer(string) {
    let lexer = new Lexer();
    lexer.addRule(/"((?:\\.|[^"])*)($|")/, (lexeme, txt) => {
        return {type: LEX_QUOTE, value: parseString(txt)};
    });

    lexer.addRule(/'((?:\\.|[^'])*)($|')/, (lexeme, txt) => {
        return {type: LEX_QUOTE, value: parseString(txt)};
    });

    // floats with a dot
    lexer.addRule(/[\-0-9]*\.[0-9]*([eE][\+\-]?)?[0-9]*/, lexeme => {
        return {type: LEX_FLOAT, value: parseFloat(lexeme)};
    });

    // floats without a dot but with e notation
    lexer.addRule(/\-?[0-9]+([eE][\+\-]?)[0-9]*/, lexeme => {
        return {type: LEX_FLOAT, value: parseFloat(lexeme)};
    });
    
    lexer.addRule(/[\-0-9]+/, lexeme => {
        return {type: LEX_INT, value: parseInt(lexeme)};
    });

    lexSpc.forEach(item => {
        lexer.addRule(item[0], lexeme => {
            return {type: item[1], value: lexeme};
        });
    });

    lexer.addRule(/\s/, lexeme => {
        // chomp whitespace...
    });

    lexer.addRule(/./, lexeme => {
        let lt = LEX_TOKEN;
        let val = lexeme;


        return {type: lt, value: val};
    });

    lexer.setInput(string);

    return lexer;
}