// Renders every page of a PDF to PNG at 2x. Usage: swift pdf-to-png.swift <in.pdf> <outdir>
import AppKit
import PDFKit

let args = CommandLine.arguments
guard args.count == 3, let doc = PDFDocument(url: URL(fileURLWithPath: args[1])) else {
    FileHandle.standardError.write("usage: pdf-to-png <in.pdf> <outdir>\n".data(using: .utf8)!)
    exit(1)
}
let outDir = URL(fileURLWithPath: args[2])
for i in 0..<doc.pageCount {
    guard let page = doc.page(at: i) else { continue }
    let box = page.bounds(for: .mediaBox)
    let image = page.thumbnail(of: NSSize(width: box.width * 2, height: box.height * 2), for: .mediaBox)
    guard let tiff = image.tiffRepresentation,
          let rep = NSBitmapImageRep(data: tiff),
          let png = rep.representation(using: .png, properties: [:]) else { continue }
    try png.write(to: outDir.appendingPathComponent(String(format: "page-%03d.png", i + 1)))
}
