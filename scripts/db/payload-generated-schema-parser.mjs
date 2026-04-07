import { readFileSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const DEFAULT_SCHEMA_FILE = path.resolve(
  process.cwd(),
  'src/payload-generated-schema.ts',
);
const PRESENT_DEFINITION = 'present';

function toObjectEntriesSorted(record) {
  return Object.fromEntries(
    Object.entries(record).sort(([left], [right]) => left.localeCompare(right)),
  );
}

function isNamedCallExpression(node, name) {
  return (
    ts.isCallExpression(node) &&
    ts.isIdentifier(node.expression) &&
    node.expression.text === name
  );
}

function readStringLiteralText(node) {
  return ts.isStringLiteralLike(node) ? node.text : null;
}

function unwrapExpression(node) {
  if (!node) return null;
  if (
    ts.isParenthesizedExpression(node) ||
    ts.isAsExpression(node) ||
    ts.isTypeAssertionExpression(node) ||
    ts.isNonNullExpression(node) ||
    ts.isSatisfiesExpression(node)
  ) {
    return unwrapExpression(node.expression);
  }
  return node;
}

function findRootCallExpression(node) {
  let current = unwrapExpression(node);

  while (current) {
    if (ts.isCallExpression(current)) {
      const expression = unwrapExpression(current.expression);

      if (
        expression &&
        (ts.isPropertyAccessExpression(expression) ||
          ts.isElementAccessExpression(expression))
      ) {
        current = unwrapExpression(expression.expression);
        continue;
      }

      return current;
    }

    if (
      ts.isPropertyAccessExpression(current) ||
      ts.isElementAccessExpression(current)
    ) {
      current = unwrapExpression(current.expression);
      continue;
    }

    break;
  }

  return null;
}

function findColumnDbName(node) {
  const rootCall = findRootCallExpression(node);
  if (!rootCall) return null;
  const [firstArgument] = rootCall.arguments;
  return readStringLiteralText(firstArgument);
}

function parseGeneratedSchemaSource(sourceText) {
  const sourceFile = ts.createSourceFile(
    'payload-generated-schema.ts',
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );

  const schemaManifest = {};
  const schemaEnumManifest = {};

  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;

    for (const declaration of statement.declarationList.declarations) {
      if (!declaration.initializer) continue;

      if (isNamedCallExpression(declaration.initializer, 'pgTable')) {
        const [tableNameNode, columnsNode] = declaration.initializer.arguments;
        const tableName = readStringLiteralText(tableNameNode);
        if (!tableName || !ts.isObjectLiteralExpression(columnsNode)) continue;

        const tableColumns = {};
        for (const property of columnsNode.properties) {
          if (!ts.isPropertyAssignment(property)) continue;
          const columnDbName = findColumnDbName(property.initializer);
          if (!columnDbName) continue;
          tableColumns[columnDbName] = PRESENT_DEFINITION;
        }

        schemaManifest[tableName] = toObjectEntriesSorted(tableColumns);
        continue;
      }

      if (isNamedCallExpression(declaration.initializer, 'pgEnum')) {
        const [enumNameNode, labelsNode] = declaration.initializer.arguments;
        const enumName = readStringLiteralText(enumNameNode);
        if (!enumName || !ts.isArrayLiteralExpression(labelsNode)) continue;

        const labels = labelsNode.elements
          .map((element) => readStringLiteralText(element))
          .filter((value) => typeof value === 'string');

        const qualifiedEnumName = enumName.includes('.')
          ? enumName
          : `public.${enumName}`;
        schemaEnumManifest[qualifiedEnumName] = [...new Set(labels)];
      }
    }
  }

  const requiredTables = Object.keys(schemaManifest).sort((a, b) =>
    a.localeCompare(b),
  );

  return {
    schemaManifest: toObjectEntriesSorted(schemaManifest),
    requiredTables,
    schemaEnumManifest: toObjectEntriesSorted(schemaEnumManifest),
  };
}

export function loadPayloadGeneratedSchemaManifestSync(
  schemaFilePath = DEFAULT_SCHEMA_FILE,
) {
  const sourceText = readFileSync(schemaFilePath, 'utf8');
  return parseGeneratedSchemaSource(sourceText);
}
