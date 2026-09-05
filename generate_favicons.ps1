Add-Type -AssemblyName System.Drawing

$srcPath = "e:\framer agent\logo-18-cropped.png"
$srcImg = [System.Drawing.Image]::FromFile($srcPath)

function Generate-Favicon($source, $size, $padding) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    
    # Fill background with black
    $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::Black)
    $g.FillRectangle($brush, 0, 0, $size, $size)
    $brush.Dispose()
    
    # Draw logo with padding
    $drawSize = $size - (2 * $padding)
    $destRect = New-Object System.Drawing.Rectangle($padding, $padding, $drawSize, $drawSize)
    $g.DrawImage($source, $destRect, 0, 0, $source.Width, $source.Height, [System.Drawing.GraphicsUnit]::Pixel)
    $g.Dispose()
    
    return $bmp
}

# 1. 16x16 with 1px padding (logo is 14x14)
$f16 = Generate-Favicon $srcImg 16 1
$f16.Save("e:\framer agent\favicon-16x16.png", [System.Drawing.Imaging.ImageFormat]::Png)
$f16.Dispose()

# 2. 32x32 with 2px padding (logo is 28x28)
$f32 = Generate-Favicon $srcImg 32 2
$f32.Save("e:\framer agent\favicon-32x32.png", [System.Drawing.Imaging.ImageFormat]::Png)

# 3. favicon.ico from 32x32 bitmap
$iconHandle = $f32.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($iconHandle)
$stream = [System.IO.File]::Create("e:\framer agent\favicon.ico")
$icon.Save($stream)
$stream.Close()
$f32.Dispose()

# 4. apple-touch-icon.png (180x180 with 15px padding)
$f180 = Generate-Favicon $srcImg 180 15
$f180.Save("e:\framer agent\apple-touch-icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$f180.Dispose()

# 5. favicon.png (192x192 with 16px padding)
$f192 = Generate-Favicon $srcImg 192 16
$f192.Save("e:\framer agent\favicon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$f192.Dispose()

$srcImg.Dispose()
Write-Host "High-visibility favicons generated successfully."
