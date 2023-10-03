function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
/* this == yyval */

var $0 = $$.length - 1;
switch (yystate) {
case 1:

      return $$[$0-1];

break;
case 2:

      this.$ = yy.callVariable($$[$0][0]);

break;
case 3:

      this.$ = yy.toNumber($$[$0]);

break;
case 4:

      this.$ = yy.trimEdges($$[$0]);

break;
case 5:

      this.$ = yy.evaluateByOperator('&', [$$[$0-2], $$[$0]]);

break;
case 6:

      this.$ = yy.evaluateByOperator('=', [$$[$0-2], $$[$0]]);

break;
case 7:

      this.$ = yy.evaluateByOperator('+', [$$[$0-2], $$[$0]]);

break;
case 8:

      this.$ = $$[$0-1];

break;
case 9:

      this.$ = yy.evaluateByOperator('<=', [$$[$0-3], $$[$0]]);

break;
case 10:

      this.$ = yy.evaluateByOperator('>=', [$$[$0-3], $$[$0]]);

break;
case 11:

      this.$ = yy.evaluateByOperator('<>', [$$[$0-3], $$[$0]]);

break;
case 12:

      this.$ = yy.evaluateByOperator('NOT', [$$[$0-2], $$[$0]]);

break;
case 13:

      this.$ = yy.evaluateByOperator('>', [$$[$0-2], $$[$0]]);

break;
case 14:

      this.$ = yy.evaluateByOperator('<', [$$[$0-2], $$[$0]]);

break;
case 15:

      this.$ = yy.evaluateByOperator('-', [$$[$0-2], $$[$0]]);

break;
case 16:

      this.$ = yy.evaluateByOperator('*', [$$[$0-2], $$[$0]]);

break;
case 17:

      this.$ = yy.evaluateByOperator('/', [$$[$0-2], $$[$0]]);

break;
case 18:

      this.$ = yy.evaluateByOperator('^', [$$[$0-2], $$[$0]]);

break;
case 19:

      var n1 = yy.invertNumber($$[$0]);

      this.$ = n1;

      if (isNaN(this.$)) {
          this.$ = 0;
      }

break;
case 20:

      var n1 = yy.toNumber($$[$0]);

      this.$ = n1;

      if (isNaN(this.$)) {
          this.$ = 0;
      }

break;
case 21:

      this.$ = yy.callFunction($$[$0-2]);

break;
case 22:

      this.$ = yy.callFunction($$[$0-3], $$[$0-1]);

break;
case 26: case 27: case 28:

      this.$ = yy.cellValue($$[$0]);

break;
case 29: case 30: case 31: case 32: case 33: case 34: case 35: case 36: case 37:

      this.$ = yy.rangeValue($$[$0-2], $$[$0]);

break;
case 38: case 42:

      this.$ = [$$[$0]];

break;
case 39:

      this.$ = yy.trimEdges(yytext).split(',');

break;
case 40: case 41:

      $$[$0-2].push($$[$0]);
      this.$ = $$[$0-2];

break;
case 43:

      this.$ = (Array.isArray($$[$0-2]) ? $$[$0-2] : [$$[$0-2]]);
      this.$.push($$[$0]);

break;
case 44:

      this.$ = $$[$0];

break;
case 45:

      this.$ = ($$[$0-2] + '.' + $$[$0]) * 1;

break;
case 46:

      this.$ = $$[$0-1] * 0.01;

break;
case 47:

      this.$ = yy.throwError($$[$0]);

break;
}
}