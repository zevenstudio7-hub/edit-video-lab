// VIDEO-004: dónde está el sujeto, para colocar S8 según el sujeto (SUBTITULOS.md, regla «Posición según el sujeto»).
// Por cada muestra: caja de la cara (Apple Vision) y extensión horizontal de la persona (máscara de segmentación)
// en la franja de la cabeza (de la parte alta de la cara a su centro). Coordenadas normalizadas de la toma, origen arriba-izquierda.
// Uso: swift measureSubject.swift <video> <salida.json> <desde_s> <hasta_s> [paso_s=0.2]
import AVFoundation
import Vision
import CoreImage
import Foundation

let args = CommandLine.arguments
let url = URL(fileURLWithPath: args[1])
let outURL = URL(fileURLWithPath: args[2])
let from = Double(args[3])!
let to = Double(args[4])!
let step = args.count > 5 ? Double(args[5])! : 0.2

let asset = AVAsset(url: url)
let gen = AVAssetImageGenerator(asset: asset)
gen.appliesPreferredTrackTransform = true
gen.requestedTimeToleranceBefore = .zero
gen.requestedTimeToleranceAfter = .zero
gen.maximumSize = CGSize(width: 1440, height: 810)

var samples: [[String: Any]] = []
var t = from
while t <= to {
  defer { t += step }
  guard let img = try? gen.copyCGImage(at: CMTime(seconds: t, preferredTimescale: 600), actualTime: nil) else { continue }
  let W = img.width, H = img.height
  let handler = VNImageRequestHandler(cgImage: img)
  let face = VNDetectFaceRectanglesRequest()
  let seg = VNGeneratePersonSegmentationRequest()
  seg.qualityLevel = .balanced
  seg.outputPixelFormat = kCVPixelFormatType_OneComponent8
  try? handler.perform([face, seg])
  var row: [String: Any] = ["t": t]
  // la cara más grande es la del presentador
  if let f = (face.results ?? []).max(by: { $0.boundingBox.width < $1.boundingBox.width }) {
    let b = f.boundingBox
    let fx = b.minX, fy = 1 - b.maxY, fw = b.width, fh = b.height
    row["cara"] = ["x": fx, "y": fy, "w": fw, "h": fh]
    if let mask = seg.results?.first?.pixelBuffer {
      CVPixelBufferLockBaseAddress(mask, .readOnly)
      let mw = CVPixelBufferGetWidth(mask), mh = CVPixelBufferGetHeight(mask)
      let bpr = CVPixelBufferGetBytesPerRow(mask)
      let base = CVPixelBufferGetBaseAddress(mask)!.assumingMemoryBound(to: UInt8.self)
      // franja de la cabeza: de la parte alta de la cara hasta su centro
      let y0 = max(0, Int(fy * Double(mh))), y1 = min(mh - 1, Int((fy + fh / 2) * Double(mh)))
      var minX = mw, maxX = -1
      if y0 <= y1 {
        for y in y0...y1 {
          for x in 0..<mw where base[y * bpr + x] > 127 {
            if x < minX { minX = x }
            if x > maxX { maxX = x }
          }
        }
      }
      CVPixelBufferUnlockBaseAddress(mask, .readOnly)
      if maxX >= 0 { row["persona"] = ["x0": Double(minX) / Double(mw), "x1": Double(maxX + 1) / Double(mw)] }
    }
  }
  _ = (W, H)
  samples.append(row)
}
let data = try JSONSerialization.data(withJSONObject: ["video": url.path, "paso_s": step, "muestras": samples], options: [.prettyPrinted])
try data.write(to: outURL)
print("muestras:", samples.count)
