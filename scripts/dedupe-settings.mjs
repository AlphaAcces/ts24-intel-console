/* eslint-disable no-undef */
import { readFileSync, writeFileSync } from 'node:fs';

const [inputPath, outputPath] = process.argv.slice(2);
if (!inputPath || !outputPath) {
  console.error('Usage: node dedupe-settings.mjs <input> <output>');
  process.exit(1);
}

const text = readFileSync(inputPath, 'utf8');
let index = 0;
const length = text.length;
const duplicatePaths = [];

function skipWhitespace() {
  while (index < length) {
    const ch = text[index];
    if (ch === ' ' || ch === '\n' || ch === '\r' || ch === '\t') {
      index += 1;
    } else {
      break;
    }
  }
}

function parseValue(path) {
  skipWhitespace();
  if (index >= length) {
    throw new Error('Unexpected end of input');
  }
  const ch = text[index];
  if (ch === '{') {
    return parseObject(path);
  }
  if (ch === '[') {
    return parseArray(path);
  }
  if (ch === '"') {
    return parseString();
  }
  if (ch === '-' || (ch >= '0' && ch <= '9')) {
    return parseNumber();
  }
  if (text.startsWith('true', index)) {
    index += 4;
    return true;
  }
  if (text.startsWith('false', index)) {
    index += 5;
    return false;
  }
  if (text.startsWith('null', index)) {
    index += 4;
    return null;
  }
  throw new Error(`Unexpected token ${ch} at position ${index}`);
}

function parseObject(path) {
  const obj = {};
  index += 1; // skip {
  skipWhitespace();
  if (text[index] === '}') {
    index += 1;
    return obj;
  }
  while (index < length) {
    skipWhitespace();
    const key = parseString();
    skipWhitespace();
    if (text[index] !== ':') {
      throw new Error(`Expected : after key at position ${index}`);
    }
    index += 1;
    const nextPath = [...path, key];
    const value = parseValue(nextPath);
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      duplicatePaths.push(nextPath.join('.'));
    }
    obj[key] = value;
    skipWhitespace();
    if (text[index] === '}') {
      index += 1;
      break;
    }
    if (text[index] !== ',') {
      throw new Error(`Expected , or } at position ${index}`);
    }
    index += 1;
  }
  return obj;
}

function parseArray(path) {
  const arr = [];
  index += 1; // skip [
  skipWhitespace();
  if (text[index] === ']') {
    index += 1;
    return arr;
  }
  let idx = 0;
  while (index < length) {
    const nextPath = [...path, String(idx)];
    arr.push(parseValue(nextPath));
    skipWhitespace();
    if (text[index] === ']') {
      index += 1;
      break;
    }
    if (text[index] !== ',') {
      throw new Error(`Expected , or ] at position ${index}`);
    }
    index += 1;
    idx += 1;
  }
  return arr;
}

function parseString() {
  let result = '';
  index += 1; // skip opening "
  while (index < length) {
    const ch = text[index];
    if (ch === '"') {
      index += 1;
      return result;
    }
    if (ch === '\\') {
      index += 1;
      if (index >= length) {
        throw new Error('Unexpected end of input in escape sequence');
      }
      const escapeChar = text[index];
      switch (escapeChar) {
        case '"':
          result += '"';
          break;
        case '\\':
          result += '\\';
          break;
        case '/':
          result += '/';
          break;
        case 'b':
          result += '\b';
          break;
        case 'f':
          result += '\f';
          break;
        case 'n':
          result += '\n';
          break;
        case 'r':
          result += '\r';
          break;
        case 't':
          result += '\t';
          break;
        case 'u': {
          const hex = text.slice(index + 1, index + 5);
          if (!/^([0-9a-fA-F]{4})$/.test(hex)) {
            throw new Error(`Invalid unicode escape at position ${index}`);
          }
          result += String.fromCharCode(parseInt(hex, 16));
          index += 4;
          break;
        }
        default:
          throw new Error(`Invalid escape character ${escapeChar} at position ${index}`);
      }
      index += 1;
    } else {
      result += ch;
      index += 1;
    }
  }
  throw new Error('Unterminated string literal');
}

function parseNumber() {
  const start = index;
  if (text[index] === '-') {
    index += 1;
  }
  if (text[index] === '0') {
    index += 1;
  } else {
    while (index < length && text[index] >= '0' && text[index] <= '9') {
      index += 1;
    }
  }
  if (text[index] === '.') {
    index += 1;
    while (index < length && text[index] >= '0' && text[index] <= '9') {
      index += 1;
    }
  }
  if (text[index] === 'e' || text[index] === 'E') {
    index += 1;
    if (text[index] === '+' || text[index] === '-') {
      index += 1;
    }
    while (index < length && text[index] >= '0' && text[index] <= '9') {
      index += 1;
    }
  }
  return Number(text.slice(start, index));
}

const data = parseValue([]);
skipWhitespace();
if (index !== length) {
  throw new Error('Unexpected trailing characters');
}

writeFileSync(outputPath, JSON.stringify(data, null, 4));

if (duplicatePaths.length > 0) {
  console.log('Duplicate keys detected at paths:');
  duplicatePaths.forEach(path => console.log(`- ${path}`));
} else {
  console.log('No duplicate keys detected.');
}
