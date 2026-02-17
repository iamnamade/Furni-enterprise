param(
  [string]$Source = "public/logo.png",
  [string]$Output = "public/favicon.ico",
  [int]$Size = 64
)

if (!(Test-Path -LiteralPath $Source)) {
  Write-Error "Source image not found: $Source"
  exit 1
}

Add-Type -AssemblyName System.Drawing

$image = [System.Drawing.Image]::FromFile((Resolve-Path -LiteralPath $Source))
try {
  $bitmap = New-Object System.Drawing.Bitmap($Size, $Size)
  try {
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    try {
      $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
      $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
      $graphics.Clear([System.Drawing.Color]::Transparent)
      $graphics.DrawImage($image, 0, 0, $Size, $Size)
    } finally {
      $graphics.Dispose()
    }

    $pngStream = New-Object System.IO.MemoryStream
    try {
      $bitmap.Save($pngStream, [System.Drawing.Imaging.ImageFormat]::Png)
      $pngBytes = $pngStream.ToArray()

      $fs = [System.IO.File]::Open($Output, [System.IO.FileMode]::Create, [System.IO.FileAccess]::Write)
      try {
        $bw = New-Object System.IO.BinaryWriter($fs)
        try {
          # ICONDIR
          $bw.Write([UInt16]0) # reserved
          $bw.Write([UInt16]1) # icon type
          $bw.Write([UInt16]1) # image count

          # ICONDIRENTRY
          $bw.Write([Byte]0) # width (0 == 256 for ICO; browsers accept PNG payload)
          $bw.Write([Byte]0) # height
          $bw.Write([Byte]0) # palette
          $bw.Write([Byte]0) # reserved
          $bw.Write([UInt16]1) # color planes
          $bw.Write([UInt16]32) # bpp
          $bw.Write([UInt32]$pngBytes.Length) # image data size
          $bw.Write([UInt32]22) # image data offset

          # image data (PNG)
          $bw.Write($pngBytes)
        } finally {
          $bw.Dispose()
        }
      } finally {
        $fs.Dispose()
      }
    } finally {
      $pngStream.Dispose()
    }
  } finally {
    $bitmap.Dispose()
  }
} finally {
  $image.Dispose()
}

Write-Host "Created favicon: $Output"
