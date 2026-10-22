Add-Type -AssemblyName System.Drawing

$size = 256
$bmp = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

$g.Clear([System.Drawing.Color]::Transparent)

# Background rounded rect path
$rect = New-Object System.Drawing.Rectangle(8, 8, ($size - 16), ($size - 16))
$radius = 48
$diameter = $radius * 2

$path = New-Object System.Drawing.Drawing2D.GraphicsPath
$path.AddArc($rect.X, $rect.Y, $diameter, $diameter, 180, 90)
$path.AddArc($rect.Right - $diameter, $rect.Y, $diameter, $diameter, 270, 90)
$path.AddArc($rect.Right - $diameter, $rect.Bottom - $diameter, $diameter, $diameter, 0, 90)
$path.AddArc($rect.X, $rect.Bottom - $diameter, $diameter, $diameter, 90, 90)
$path.CloseFigure()

# Purple gradient fill
$c1 = [System.Drawing.Color]::FromArgb(255, 108, 92, 231) # #6C5CE7
$c2 = [System.Drawing.Color]::FromArgb(255, 162, 155, 254) # #A29BFE
$brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $c1, $c2, [System.Drawing.Drawing2D.LinearGradientMode]::ForwardDiagonal)
$g.FillPath($brush, $path)

# Draw subtle outer border
$borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(60, 255, 255, 255), 3)
$g.DrawPath($borderPen, $path)

# Helper for rounded keycaps
function Draw-Keycap([System.Drawing.Graphics]$g, [float]$x, [float]$y, [float]$w, [float]$h, [float]$r) {
    $kp = New-Object System.Drawing.Drawing2D.GraphicsPath
    $d = $r * 2
    $kp.AddArc($x, $y, $d, $d, 180, 90)
    $kp.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
    $kp.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
    $kp.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
    $kp.CloseFigure()
    
    $keyBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(235, 255, 255, 255))
    $g.FillPath($keyBrush, $kp)
    $keyBrush.Dispose()
    $kp.Dispose()
}

# Row 1
Draw-Keycap $g 52 52 42 42 10
Draw-Keycap $g 107 52 42 42 10
Draw-Keycap $g 162 52 42 42 10

# Row 2
Draw-Keycap $g 52 107 42 42 10
Draw-Keycap $g 107 107 42 42 10
Draw-Keycap $g 162 107 42 42 10

# Row 3 (Spacebar row)
Draw-Keycap $g 52 162 42 42 10
Draw-Keycap $g 107 162 97 42 10

$g.Flush()

# Save PNGs
$publicPng = Join-Path $PSScriptRoot "..\public\typeflow-icon.png"
$bmp.Save($publicPng, [System.Drawing.Imaging.ImageFormat]::Png)

$buildDir = Join-Path $PSScriptRoot "..\build"
if (!(Test-Path $buildDir)) { New-Item -ItemType Directory -Path $buildDir }
$buildPng = Join-Path $buildDir "icon.png"
$bmp.Save($buildPng, [System.Drawing.Imaging.ImageFormat]::Png)

# Save ICO file (using Windows native Icon creation)
$hIcon = $bmp.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($hIcon)
$publicIco = Join-Path $PSScriptRoot "..\public\typeflow-icon.ico"
$buildIco = Join-Path $buildDir "icon.ico"

$fs1 = New-Object System.IO.FileStream($publicIco, [System.IO.FileMode]::Create)
$icon.Save($fs1)
$fs1.Close()

$fs2 = New-Object System.IO.FileStream($buildIco, [System.IO.FileMode]::Create)
$icon.Save($fs2)
$fs2.Close()

$icon.Dispose()
$brush.Dispose()
$path.Dispose()
$borderPen.Dispose()
$g.Dispose()
$bmp.Dispose()

Write-Output "Icons generated successfully in public and build folders!"
