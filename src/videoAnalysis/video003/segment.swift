// VIDEO-003: recorte del presentador (máscara de persona) y caja de la cara por frame con Apple Vision (macOS 12+).
// Uso: swift segment.swift <video> <dirSalida> [calidad: fast|balanced|accurate]
// Salida: <dir>/mask/%05d.png (gris 8 bits, tamaño del video) y <dir>/faces.json ([{t, x, y, w, h}] normalizado, origen arriba-izquierda).
import AVFoundation
import Vision
import CoreImage
import Foundation

let args = CommandLine.arguments
let url = URL(fileURLWithPath: args[1])
let out = URL(fileURLWithPath: args[2])
let quality = args.count > 3 ? args[3] : "balanced"
try FileManager.default.createDirectory(at: out.appendingPathComponent("mask"), withIntermediateDirectories: true)
let asset = AVAsset(url: url)
let track = asset.tracks(withMediaType: .video)[0]
let reader = try AVAssetReader(asset: asset)
let output = AVAssetReaderTrackOutput(track: track, outputSettings: [kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA])
reader.add(output)
reader.startReading()
let ctx = CIContext(options: [.workingColorSpace: NSNull()])
let seg = VNGeneratePersonSegmentationRequest()
seg.qualityLevel = quality == "accurate" ? .accurate : (quality == "fast" ? .fast : .balanced)
seg.outputPixelFormat = kCVPixelFormatType_OneComponent8
var faces: [[String: Double]] = []
var i = 0
while let sample = output.copyNextSampleBuffer() {
  guard let pb = CMSampleBufferGetImageBuffer(sample) else { continue }
  let t = CMSampleBufferGetPresentationTimeStamp(sample).seconds
  let W = CVPixelBufferGetWidth(pb), H = CVPixelBufferGetHeight(pb)
  let face = VNDetectFaceRectanglesRequest()
  let h = VNImageRequestHandler(cvPixelBuffer: pb, options: [:])
  try h.perform([seg, face])
  if let m = seg.results?.first?.pixelBuffer {
    var img = CIImage(cvPixelBuffer: m)
    img = img.transformed(by: CGAffineTransform(scaleX: CGFloat(W) / img.extent.width, y: CGFloat(H) / img.extent.height))
    let name = out.appendingPathComponent(String(format: "mask/%05d.png", i))
    try ctx.writePNGRepresentation(of: img, to: name, format: .L8, colorSpace: CGColorSpaceCreateDeviceGray())
  }
  if let f = (face.results ?? []).max(by: { $0.boundingBox.width < $1.boundingBox.width }) {
    let b = f.boundingBox
    faces.append(["t": t, "x": b.minX, "y": 1 - b.maxY, "w": b.width, "h": b.height])
  } else { faces.append(["t": t, "x": -1, "y": -1, "w": 0, "h": 0]) }
  i += 1
  if i % 100 == 0 { FileHandle.standardError.write("\(i) frames\n".data(using: .utf8)!) }
}
let data = try JSONSerialization.data(withJSONObject: faces)
try data.write(to: out.appendingPathComponent("faces.json"))
print("frames:", i)
