import * as path from "path";
import {
  Parser,
  Source,

  SourceKind
} from "assemblyscript/dist/assemblyscript.js";
import { Transform } from "assemblyscript/dist/transform.js";

export function posixRelativePath(from: string, to: string): string {
  const relativePath = path.relative(from, to);
  return relativePath.split(path.sep).join(path.posix.sep);
}
export function isEntry(source: Source): boolean {
  return source.sourceKind == SourceKind.USER_ENTRY;
}

class MyTransform extends Transform {
  parser: Parser = new Parser;

  afterParse(parser: Parser): void {
    this.parser = parser;
    const writeFile = this.writeFile;
    const baseDir = this.baseDir;
    let newParser = new Parser(parser.diagnostics);
    let sources = this.parser.sources;

    sources.forEach((source) => {

      if (source.internalPath == "assembly/index") {

        parser.donelog.delete(source.internalPath);
        parser.seenlog.delete(source.internalPath);
        // Remove from programs sources
        this.parser.sources = this.parser.sources.filter(
          (_source: Source) => _source !== source
        );
        this.program.sources = this.program.sources.filter(
          (_source: Source) => _source !== source
        );

        let sourceText = source.text +
          "\n"+
          "export function __guest_call(operation_size: usize, payload_size: usize): bool { \n" +
          "return handleEvent(operation_size, payload_size); \n" +
          "}\n";

        console.log(sourceText);
        let writeOut = /\/\/.*@nearfile .*out/.test(source.text);
        if (writeOut) {
          writeFile(
            posixRelativePath("out", source.normalizedPath),
            sourceText,
            baseDir
          );
        }
        // Parses file and any new imports added to the source
        newParser.parseFile(
          sourceText,
          posixRelativePath(isEntry(source) ? "" : "./", source.normalizedPath),
          isEntry(source)
        );

        let newSource = newParser.sources.pop()!;
        this.program.sources.push(newSource);
        parser.donelog.add(source.internalPath);
        parser.seenlog.add(source.internalPath);
        parser.sources.push(newSource);

      }

    });

  }
}
export default MyTransform;