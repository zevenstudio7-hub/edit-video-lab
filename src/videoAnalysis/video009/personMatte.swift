// VIDEO-009: matte del sujeto por fotograma con Vision (VNGeneratePersonSegmentationRequest).
// Entrada: carpeta con fotogramas JPG (f00001.jpg…). Salida: carpeta con PNG en gris (blanco = persona), mismo tamaño.
// Uso: swift personMatte.swift <carpeta-jpg> <carpeta-salida> [fast|balanced|accurate]
// Vision corre en el equipo; ningún fotograma sale de él.
import Foundation
import Vision
import CoreImage
import CoreGraphics
import ImageIO

let args = CommandLine.arguments
let inDir = URL(fileURLWithPath: args[1]), outDir = URL(fileURLWithPath: args[2])
let q: VNGeneratePersonSegmentationRequest.QualityLevel = {
  switch args.count > 3 ? args[3] : "accurate" {
  case "fast": return .fast
  case "balanced": return .balanced
  default: return .accurate
  }
}()
try FileManager.default.createDirectory(at: outDir, withIntermediateDirectories: true)
let files = try FileManager.default.contentsOfDirectory(atPath: inDir.path).filter { $0.hasSuffix(".jpg") }.sorted()
let ctx = CIContext(options: [.useSoftwareRenderer: false])
let cs = CGColorSpaceCreateDeviceGray()

for (i, name) in files.enumerated() {
  autoreleasepool {
    let url = inDir.appendingPathComponent(name)
    guard let src = CGImageSourceCreateWithURL(url as CFURL, nil), let img = CGImageSourceCreateImageAtIndex(src, 0, nil) else { return }
    let req = VNGeneratePersonSegmentationRequest()
    req.qualityLevel = q
    req.outputPixelFormat = kCVPixelFormatType_OneComponent8
    let h = VNImageRequestHandler(cgImage: img, options: [:])
    do { try h.perform([req]) } catch { FileHandle.standardError.write("fallo \(name): \(error)\n".data(using: .utf8)!); return }
    guard let buf = req.results?.first?.pixelBuffer else { return }
    var ci = CIImage(cvPixelBuffer: buf)
    // la máscara sale a otra resolución: se escala al tamaño del fotograma
    let sx = CGFloat(img.width) / ci.extent.width, sy = CGFloat(img.height) / ci.extent.height
    ci = ci.transformed(by: CGAffineTransform(scaleX: sx, y: sy))
    guard let out = ctx.createCGImage(ci, from: CGRect(x: 0, y: 0, width: img.width, height: img.height), format: .L8, colorSpace: cs) else { return }
    let dest = CGImageDestinationCreateWithURL(outDir.appendingPathComponent(name.replacingOccurrences(of: ".jpg", with: ".png")) as CFURL, "public.png" as CFString, 1, nil)!
    CGImageDestinationAddImage(dest, out, nil)
    CGImageDestinationFinalize(dest)
  }
  if i % 50 == 0 { FileHandle.standardError.write("\(i)/\(files.count)\n".data(using: .utf8)!) }
}
