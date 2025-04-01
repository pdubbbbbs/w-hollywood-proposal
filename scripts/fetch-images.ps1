<#
.SYNOPSIS
    Script to fetch, process, and organize images for W Hollywood property listings.
.DESCRIPTION
    This PowerShell script downloads luxury real estate images from specified sources,
    processes them for web optimization, and organizes them into appropriate unit folders.
    Categories include living rooms, kitchens, bedrooms, and views.
.NOTES
    Author: Real Estate Web Development Team
    Last Updated: 2023-06-15
#>

# Configuration
$LogFile = "image-download-log.txt"
$ImageCategories = @{
    "living" = @{
        Description = "Living Room"
        Keywords = "luxury modern living room", "contemporary apartment living area", "high-end condo living space"
        Count = 5
    }
    "kitchen" = @{
        Description = "Kitchen"
        Keywords = "luxury kitchen", "modern apartment kitchen", "high-end condo kitchen"
        Count = 3
    }
    "bedroom" = @{
        Description = "Bedroom"
        Keywords = "luxury bedroom", "modern condo bedroom", "high-end apartment bedroom"
        Count = 4
    }
    "views" = @{
        Description = "Views"
        Keywords = "los angeles skyline", "hollywood hills view", "sunset strip view night"
        Count = 3
    }
}
$Units = @("8A", "10N", "12B")
$ImageSizes = @{
    "thumbnail" = @{
        Width = 300
        Height = 200
    }
    "gallery" = @{
        Width = 800
        Height = 600
    }
    "fullsize" = @{
        Width = 1920
        Height = 1080
    }
}

# Create directories if they don't exist
function Ensure-DirectoriesExist {
    param (
        [string[]]$Directories
    )
    
    foreach ($dir in $Directories) {
        if (-not (Test-Path -Path $dir)) {
            try {
                New-Item -ItemType Directory -Path $dir -Force | Out-Null
                Write-Log "Created directory: $dir"
            }
            catch {
                Write-Error "Failed to create directory: $dir. Error: $_"
                Write-Log "ERROR: Failed to create directory: $dir. Error: $_"
            }
        }
    }
}

# Logging function
function Write-Log {
    param (
        [string]$Message
    )
    
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogMessage = "[$Timestamp] $Message"
    
    # Output to console and log file
    Write-Host $LogMessage
    Add-Content -Path $LogFile -Value $LogMessage
}

# Download image from URL
function Download-Image {
    param (
        [string]$Url,
        [string]$OutputPath
    )
    
    try {
        $webClient = New-Object System.Net.WebClient
        $webClient.DownloadFile($Url, $OutputPath)
        Write-Log "Downloaded image from $Url to $OutputPath"
        return $true
    }
    catch {
        Write-Log "ERROR: Failed to download image from $Url. Error: $_"
        return $false
    }
}

# Search for images using Unsplash API or similar
# Note: In a real implementation, you would use an actual API with credentials
function Search-Images {
    param (
        [string]$Keyword,
        [int]$Count
    )
    
    # This is a mock function. In a real scenario, you would use an API like Unsplash, Pexels, or similar
    # For demo purposes, we'll return placeholder image URLs
    $mockUrls = @(
        "https://source.unsplash.com/random/1920x1080/?$Keyword",
        "https://picsum.photos/1920/1080?random=$(Get-Random)",
        "https://loremflickr.com/1920/1080/$Keyword",
        "https://source.unsplash.com/featured/1920x1080/?$Keyword"
    )
    
    # Simulate random image URLs
    $results = @()
    for ($i = 0; $i -lt $Count; $i++) {
        $randomIndex = Get-Random -Minimum 0 -Maximum $mockUrls.Count
        $results += $mockUrls[$randomIndex] + "&sig=" + (Get-Random)
    }
    
    return $results
}

# Process and resize image for web optimization
function Process-Image {
    param (
        [string]$InputPath,
        [string]$OutputDirectory,
        [string]$BaseName
    )
    
    try {
        # Load necessary assembly for image processing
        Add-Type -AssemblyName System.Drawing
        
        # Load the original image
        $image = [System.Drawing.Image]::FromFile($InputPath)
        
        # Create different sizes for different purposes
        foreach ($size in $ImageSizes.Keys) {
            $targetWidth = $ImageSizes[$size].Width
            $targetHeight = $ImageSizes[$size].Height
            $outputPath = Join-Path -Path $OutputDirectory -ChildPath "$BaseName-$size.jpg"
            
            # Create a bitmap with the target size
            $bitmap = New-Object System.Drawing.Bitmap($targetWidth, $targetHeight)
            $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
            
            # Set the resolution and quality
            $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
            $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
            $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
            
            # Draw the original image on the new bitmap
            $graphics.DrawImage($image, (New-Object System.Drawing.Rectangle(0, 0, $targetWidth, $targetHeight)))
            
            # Set JPEG quality and save
            $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
            $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, 85)
            $jpegCodecInfo = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
            
            # Save the processed image
            $bitmap.Save($outputPath, $jpegCodecInfo, $encoderParams)
            
            # Dispose graphics and bitmap
            $graphics.Dispose()
            $bitmap.Dispose()
            
            Write-Log "Processed image: $outputPath"
        }
        
        # Dispose the original image
        $image.Dispose()
        
        return $true
    }
    catch {
        Write-Log "ERROR: Failed to process image $InputPath. Error: $_"
        return $false
    }
}

# Main function to fetch images for a specific unit
function Fetch-UnitImages {
    param (
        [string]$UnitName
    )
    
    $unitDirectory = Join-Path -Path "images" -ChildPath $UnitName
    Ensure-DirectoriesExist -Directories $unitDirectory
    
    Write-Log "=== Starting image fetch for Unit $UnitName ==="
    
    foreach ($category in $ImageCategories.Keys) {
        $categoryInfo = $ImageCategories[$category]
        Write-Log "Fetching $($categoryInfo.Count) $($categoryInfo.Description) images for Unit $UnitName..."
        
        # Get random keyword from the category
        $randomKeywordIndex = Get-Random -Minimum 0 -Maximum $categoryInfo.Keywords.Count
        $keyword = $categoryInfo.Keywords[$randomKeywordIndex]
        
        # Search for images
        $imageUrls = Search-Images -Keyword $keyword -Count $categoryInfo.Count
        
        $counter = 1
        foreach ($url in $imageUrls) {
            $tempFile = Join-Path -Path $env:TEMP -ChildPath "temp_image_$(Get-Random).jpg"
            
            # Download the image
            if (Download-Image -Url $url -OutputPath $tempFile) {
                # Process and resize the image
                $baseName = "$UnitName-$category-$counter"
                $success = Process-Image -InputPath $tempFile -OutputDirectory $unitDirectory -BaseName $baseName
                
                if ($success) {
                    Write-Log "Successfully processed $baseName"
                }
                else {
                    Write-Log "Failed to process $baseName"
                }
                
                # Clean up temp file
                Remove-Item -Path $tempFile -Force
            }
            
            $counter++
        }
    }
    
    Write-Log "=== Completed image fetch for Unit $UnitName ==="
}

# Main execution block
try {
    # Initialize log file
    $timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
    $LogFile = "image-download-log_$timestamp.txt"
    "[$timestamp] === W Hollywood Property Image Download Script Started ===" | Out-File -FilePath $LogFile
    
    # Ensure all unit directories exist
    $unitDirectories = $Units | ForEach-Object { Join-Path -Path "images" -ChildPath $_ }
    Ensure-DirectoriesExist -Directories $unitDirectories
    
    # Process each unit
    foreach ($unit in $Units) {
        Fetch-UnitImages -UnitName $unit
    }
    
    Write-Log "=== Script completed successfully ==="
}
catch {
    Write-Log "CRITICAL ERROR: Script execution failed. Error: $_"
    exit 1
}

Write-Host -ForegroundColor Green "Image download and processing completed. Check $LogFile for details."

