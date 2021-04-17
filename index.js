// From the article https://lihautan.com/step-by-step-guide-for-writing-a-babel-transformation/
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
const util = require('util');

const parseWithJSX = x => parse(x, {
    plugins: ['jsx', 'react']
});

const deepLog = (target) => util.inspect(target, { showHidden: false, depth: null });

const brief = `
const MyFirstComponent = () => <div className="hi anmol"> n World</div>;
const PageUntransformed = () => (
    <div>
        <MyFirstComponent />
        <div>Something else goes here</div>
    </div>
);

const PageTransformed = () => (
    <div>
        {MyFirstComponent()}
        <div>Something else goes here</div>
    </div>
);

const ProblemTransform = () => {MyFirstComponent()}  // bad, should not transform to JSXExpressionContainer, but just expression
const BetterTransform = () => MyFirstComponent()
`;

const code = `
    class ClassComponent extends React.Component { render() { return null; } }
`;

// parse the code -> ast
const ast = parseWithJSX(code);
// transform the ast
traverse(ast, {
  enter(path) {
    // in this example change all the variable `n` to `x`
    if (path.isIdentifier({ name: 'n' })) {
      path.node.name = 'x';
    }

    if (path.node.type === "JSXElement") {
        console.log('found JSX element', path.node);
        // const changedHTMLElement = 'nOt a valid JSX identifier';
        // path.node.openingElement.name.name = changedHTMLElement;
        // path.node.closingElement.name.name = changedHTMLElement;
    }
  },
});


// if(jSXElement.node.name == "MyFunctionComponent")

// // display the AST after transformation
// console.log('AFTER', ast.program.body);
console.log('after', deepLog(ast.program.body));

// generate code <- ast
const output = generate(ast);
console.log(output.code); 
/*
GOAL

JSXExpressionContainer
    FunctionCall
        name of the function (PHASE ONE)
        pass the attributes as properties of a new object (PHASE TWO)

DETECTION PHASE THREE

JSXElement
    are not standard HTML
    are React functional components
*/

// TODO: Find hardcoded JSX ELEMENT name and replace AST subtree (path) with new 
// JSXExpressionContainer node with a function call expression (not sure what the node type is for that) 
// which has the same name

// TODO: pass the props from the previous JSX element into the function call

// TODO: detecting if a JSX ELEMENT is a functional component (semantic parsing???)

// TODO: only replace AST subtree (path) with new JSXExpressionContainer IF it's a child of another JSXElement
