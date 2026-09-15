import AppKit
// usage: svg2png <in.svg> <out.png> <hex> <px>
let a = CommandLine.arguments
var svg = try! String(contentsOfFile: a[1], encoding: .utf8)
svg = svg.replacingOccurrences(of: "currentColor", with: "#" + a[3])
guard let img = NSImage(data: svg.data(using: .utf8)!) else { print("cannot load svg"); exit(1) }
let px = CGFloat(Double(a[4])!)
let ratio = img.size.width / img.size.height
let w = ratio >= 1 ? px : px * ratio, h = ratio >= 1 ? px / ratio : px
let rep = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: Int(w), pixelsHigh: Int(h), bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
NSGraphicsContext.saveGraphicsState()
NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: rep)
img.draw(in: NSRect(x: 0, y: 0, width: w, height: h))
NSGraphicsContext.restoreGraphicsState()
try! rep.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: a[2]))
print("ok", Int(w), Int(h))
