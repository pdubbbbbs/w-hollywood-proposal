[CmdletBinding()]
param(
    [Parameter()]
    [string]$AccessKey = $env:UNSPLASH_ACCESS_KEY,
    
    [Parameter()]
    [string]$ImagesDirectory = ".\images",
    
    [Parameter()]
    [int]$MaxRetries = 3
)

# Function to download an image with retry logic
function Download-ImageWithRetry {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$ImageId,
        
        [Parameter(Mandatory=$true)]
        [string]$DestinationPath,
        
        [Parameter()]
        [int]$MaxRetries = 3,
        
        [Parameter()]
        [string]$AccessKey
    )
    
    $retryCount = 0
    $success = $false
    $webClient = New-Object System.Net.WebClient
    
    do {
        try {
            $retryCount++
            Write-Host "Downloading image $ImageId (Attempt $retryCount of $MaxRetries)..."
            
            $url = "https://api.unsplash.com/photos/$ImageId/download?client_id=$AccessKey"
            $response = Invoke-RestMethod -Uri $url -Method Get
            
            # Use the download URL from the API response
            $webClient.DownloadFile($response.url, $DestinationPath)
            
            Write-Host "Successfully downloaded image to $DestinationPath" -ForegroundColor Green
            $success = $true
            break
        }
        catch {
            Write-Warning "Failed to download image $ImageId (Attempt $retryCount of $MaxRetries): $($_.Exception.Message)"
            Start-Sleep -Seconds 2
        }
    } while ($retryCount -lt $MaxRetries -and -not $success)
    
    return $success
}

# Function to download images for a specific unit
function Download-UnitImages {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$UnitName,
        
        [Parameter(Mandatory=$true)]
        [array]$ImageIds,
        
        [Parameter()]
        [string]$ImagesDirectory = ".\images",
        
        [Parameter()]
        [int]$MaxRetries = 3,
        
        [Parameter()]
        [string]$AccessKey
    )
    
    $unitDirectory = Join-Path -Path $ImagesDirectory -ChildPath $UnitName
    
    if (-not (Test-Path $unitDirectory)) {
        New-Item -ItemType Directory -Path $unitDirectory -Force | Out-Null
        Write-Host "Created directory: $unitDirectory" -ForegroundColor Cyan
    }
    
    $successCount = 0
    $totalImages = $ImageIds.Count
    
    Write-Host "Downloading $totalImages images for unit $UnitName..." -ForegroundColor Cyan
    
    for ($i = 0; $i -lt $totalImages; $i++) {
        $imageId = $ImageIds[$i]
        $imageName = "unit_${UnitName}_image_$($i+1).jpg"
        $imagePath = Join-Path -Path $unitDirectory -ChildPath $imageName
        
        $result = Download-ImageWithRetry -ImageId $imageId -DestinationPath $imagePath -MaxRetries $MaxRetries -AccessKey $AccessKey
        
        if ($result) {
            $successCount++
        }
    }
    
    Write-Host "Successfully downloaded $successCount of $totalImages images for unit $UnitName" -ForegroundColor Green
    
    return $successCount
}

# Function to start the image download process for all units
function Start-ImageDownload {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$ImageIds,
        
        [Parameter()]
        [string]$ImagesDirectory = ".\images",
        
        [Parameter()]
        [int]$MaxRetries = 3,
        
        [Parameter()]
        [string]$AccessKey
    )
    
    $totalDownloaded = 0
    $totalExpected = 0
    
    foreach ($unit in $ImageIds.Keys) {
        $unitImageIds = $ImageIds[$unit]
        $totalExpected += $unitImageIds.Count
        
        Write-Host "Processing unit: $unit" -ForegroundColor Yellow
        $downloaded = Download-UnitImages -UnitName $unit -ImageIds $unitImageIds -ImagesDirectory $ImagesDirectory -MaxRetries $MaxRetries -AccessKey $AccessKey
        $totalDownloaded += $downloaded
    }
    
    Write-Host "Download process completed: $totalDownloaded of $totalExpected images successfully downloaded" -ForegroundColor Green
    
    return $totalDownloaded
}

# Define luxury image IDs from Unsplash
$luxuryImageIds = @{
    "8A" = @(
        "eWqOgJ-lfiI", "zoCDWPuiRuA", 
        "L0BaowhFe4c", "PhYq704ffdA"
    );
    "10N" = @(
        "AQl-J19ocWE", "MP0bgaS_d1c", 
        "hCU4fimRW-c"
    );
    "12B" = @(
        "7lvzopTxjOU", "hCU4fimRW-c", 
        "L7EwHkq1B2s", "lrk0l9w8rI0"
    );
    "common" = @(
        "PhYq704ffdA", "3wylDrjxH-E", 
        "eWqOgJ-lfiI"
    )
}

# Main execution block
try {
    Write-Host "Starting luxury unit image download process..." -ForegroundColor Cyan
    
    if (-not $AccessKey) {
        throw "Unsplash API access key not found. Please set the UNSPLASH_ACCESS_KEY environment variable."
    }
    
    # Create the main images directory if it doesn't exist
    if (-not (Test-Path $ImagesDirectory)) {
        New-Item -ItemType Directory -Path $ImagesDirectory -Force | Out-Null
        Write-Host "Created directory: $ImagesDirectory" -ForegroundColor Cyan
    }
    
    # Start the download process
    $result = Start-ImageDownload -ImageIds $luxuryImageIds -ImagesDirectory $ImagesDirectory -MaxRetries $MaxRetries -AccessKey $AccessKey
    
    if ($result -gt 0) {
        Write-Host "Image download completed successfully: $result images downloaded" -ForegroundColor Green
    }
    else {
        Write-Warning "No images were downloaded. Please check the logs for errors."
    }
}
catch {
    Write-Error "An error occurred during the image download process: $($_.Exception.Message)"
}
finally {
    Write-Host "Image download process finished. Check the images directory for downloaded files." -ForegroundColor Cyan
}

<#
.SYNOPSIS
    Downloads luxury real estate images from Unsplash API for W Hollywood proposal website.

.DESCRIPTION
    This script downloads high-quality real estate images from Unsplash using their API
    and organizes them into directories for each unit in the W Hollywood property.
    
.NOTES
    File Name  : get-images.ps1
    Author     : W Hollywood Proposal Team
    Requires   : PowerShell 5.1 or higher
    Version    : 1.1

.EXAMPLE
    .\get-images.ps1
    Runs the script using the UNSPLASH_ACCESS_KEY environment variable.

.EXAMPLE
    $env:UNSPLASH_ACCESS_KEY = "your_key_here"; .\get-images.ps1
    Sets the API key and runs the script in a single line.
#>

# Script parameters
param(
    [string]$AccessKey = $env:UNSPLASH_ACCESS_KEY,
    [int]$ImagesPerUnit = 5,
    [switch]$Force
)

# Function Definitions
<#
.SYNOPSIS
    Downloads an image from Unsplash with retry logic

.DESCRIPTION
    Function to download a single image from Unsplash API with retry capabilities
    to handle transient errors and rate limiting.

.PARAMETER imageId
    The Unsplash image ID to download

.PARAMETER outputPath
    The full path where the image should be saved

.PARAMETER maxRetries
    Maximum number of retry attempts (default: 3)

.PARAMETER retryDelaySeconds
    Initial delay between retries in seconds (default: 5, doubles after each retry)

.OUTPUTS
    [bool] True if download was successful, False otherwise
#>
function Download-ImageWithRetry {
    param (
        [Parameter(Mandatory = $true)]
        [string]$imageId,
        
        [Parameter(Mandatory = $true)]
        [string]$outputPath,
        
        [Parameter(Mandatory = $false)]
        [int]$maxRetries = 3,
        
        [Parameter(Mandatory = $false)]
        [int]$retryDelaySeconds = 5
    )
    
    $retryCount = 0
    $success = $false
    
    while (-not $success -and $retryCount -lt $maxRetries) {
        try {
            $apiUrl = "https://api.unsplash.com/photos/$imageId/download?client_id=$AccessKey"
            
            # Get the direct download URL from the API
            $response = Invoke-RestMethod -Uri $apiUrl -Method Get -Headers @{
                "Accept-Version" = "v1"
            }
            
            # The API returns a download_location URL which we need to follow to get the actual image
            $downloadUrl = $response.url
            
            # Download the image using WebClient for better performance
            $webClient = New-Object System.Net.WebClient
            $webClient.Headers.Add("Accept-Version", "v1")
            $webClient.DownloadFile($downloadUrl, $outputPath)
            $webClient.Dispose()
            
            $success = $true
            return $true
        }
        catch {
            $retryCount++
            $errorMessage = $_.Exception.Message
            
            if ($retryCount -lt $maxRetries) {
                Write-Host "Error downloading image $($imageId), attempt $($retryCount) of $($maxRetries). Retrying in $($retryDelaySeconds) seconds..." -ForegroundColor Yellow
                Write-Host "Error details: $($errorMessage)" -ForegroundColor DarkYellow
                Start-Sleep -Seconds $retryDelaySeconds
                
                # Increase delay for potential rate limiting
                $retryDelaySeconds *= 2
            }
            else {
                Write-Host "Failed to download image $($imageId) after $($maxRetries) attempts." -ForegroundColor Red
                Write-Host "Error details: $($errorMessage)" -ForegroundColor DarkRed
                return $false
            }
        }
    }
}

<#
.SYNOPSIS
    Downloads a set of images for a specific unit

.DESCRIPTION
    Downloads a random selection of images from the provided collection
    and organizes them for a specific unit in the property.

.PARAMETER unitName
    The name of the unit (e.g., "8A", "10N", "12B")

.PARAMETER imageIds
    Array of Unsplash image IDs to select from

.PARAMETER count
    Number of images to download for this unit

.OUTPUTS
    [int] Number of successfully downloaded images
#>
function Download-UnitImages {
    param (
        [Parameter(Mandatory = $true)]
        [string]$unitName,
        
        [Parameter(Mandatory = $true)]
        [array]$imageIds,
        
        [Parameter(Mandatory = $false)]
        [int]$count = 5
    )
    
    $unitFolder = "images\$unitName"
    $successCount = 0
    
    Write-Host "`nDownloading images for Unit $($unitName)" -ForegroundColor Cyan
    
    # Take a random selection of images for variety
    $selectedIds = $imageIds | Get-Random -Count ([Math]::Min($count, $imageIds.Count))
    
    for ($i = 0; $i -lt $selectedIds.Count; $i++) {
        $imageId = $selectedIds[$i]
        $outputPath = Join-Path $unitFolder "$unitName-$($i+1).jpg"
        
        Write-Progress -Activity "Downloading images for Unit $($unitName)" -Status "Image $($i+1) of $($count)" -PercentComplete (($i / $count) * 100)
        
        Write-Host "  Downloading image $($i+1)/$($count) ($($imageId)) to $($outputPath)" -ForegroundColor DarkCyan
        
        $success = Download-ImageWithRetry -imageId $imageId -outputPath $outputPath
        if ($success) {
            $successCount++
            Write-Host "  ✓ Downloaded successfully" -ForegroundColor Green
        }
        
        # Respect rate limits (1 request per second is safe for free tier)
        Start-Sleep -Seconds 1
    }
    
    Write-Progress -Activity "Downloading images for Unit $unitName" -Completed
    Write-Host "Completed Unit $($unitName): $($successCount) of $($count) images downloaded successfully." -ForegroundColor Green
    
    return $successCount
}
# Main function to orchestrate the image download process
<#
.SYNOPSIS
    Main function to orchestrate the image download process

.DESCRIPTION
    Controls the main execution of the script, creating directories,
    downloading images for each unit, and providing summary information.

.PARAMETER accessKey
    Unsplash API access key

.PARAMETER imagesPerUnit
    Number of images to download per unit
    
.PARAMETER imageIds
    Array of Unsplash image IDs to download
#>
function Start-ImageDownload {
    param (
        [Parameter(Mandatory = $true)]
        [hashtable]$ImageIds,
        
        [Parameter()]
        [string]$ImagesDirectory = ".\images",
        
        [Parameter()]
        [int]$MaxRetries = 3,
        
        [Parameter()]
        [string]$AccessKey
    )
    
    $startTime = Get-Date
    Write-Host "=== Luxury Real Estate Image Downloader ===" -ForegroundColor Magenta
    Write-Host "Starting download of luxury property images from Unsplash..." -ForegroundColor White
    
    # Create output directories if they don't exist
    $unitFolders = @("images\8A", "images\10N", "images\12B", "images\common")
    foreach ($folder in $unitFolders) {
        if (-not (Test-Path $folder)) {
            New-Item -ItemType Directory -Path $folder -Force | Out-Null
            Write-Host "Created directory: $($folder)" -ForegroundColor Cyan
        }
    }
    
    $totalSuccess = 0
    $totalNeeded = $imagesPerUnit * 3 # 3 units plus common images
    
    # Download images for each unit
    $totalSuccess += Download-UnitImages -unitName "8A" -imageIds $imageIds -count $imagesPerUnit
    $totalSuccess += Download-UnitImages -unitName "10N" -imageIds $imageIds -count $imagesPerUnit
    $totalSuccess += Download-UnitImages -unitName "12B" -imageIds $imageIds -count $imagesPerUnit
    
    # Download some common images
    $unitFolder = "images\common"
    Write-Host "`nDownloading common area images" -ForegroundColor Cyan
    
    $commonIds = $imageIds | Get-Random -Count $imagesPerUnit
    for ($i = 0; $i -lt $commonIds.Count; $i++) {
        $imageId = $commonIds[$i]
        $outputPath = Join-Path $unitFolder "common-$($i+1).jpg"
        
        Write-Progress -Activity "Downloading common area images" -Status "Image $($i+1) of $imagesPerUnit" -PercentComplete (($i / $imagesPerUnit) * 100)
        
        Write-Host "  Downloading image $($i+1)/$imagesPerUnit ($($imageId)) to $($outputPath)" -ForegroundColor DarkCyan
        
        $success = Download-ImageWithRetry -imageId $imageId -outputPath $outputPath
        if ($success) {
            $totalSuccess++
            Write-Host "  ✓ Downloaded successfully" -ForegroundColor Green
        }
        
        # Respect rate limits
        Start-Sleep -Seconds 1
    }
    
    Write-Progress -Activity "Downloading common area images" -Completed
    
    # Calculate elapsed time
    $endTime = Get-Date
    $duration = $endTime - $startTime
    
    # Summary
    Write-Host "`n=== Download Summary ===" -ForegroundColor Magenta
    Write-Host "Total images downloaded: $($totalSuccess) of $($totalNeeded)" -ForegroundColor White
    Write-Host "Time elapsed: $($duration.Minutes) minutes and $($duration.Seconds) seconds" -ForegroundColor White
    
    if ($totalSuccess -eq 0) {
        Write-Host "`nERROR: No images were downloaded. Please check your API key and internet connection." -ForegroundColor Red
        exit 1
    }
    elseif ($totalSuccess -lt $totalNeeded) {
        Write-Host "`nWARNING: Only $($totalSuccess) of $($totalNeeded) images were downloaded successfully." -ForegroundColor Yellow
        Write-Host "Some units may have incomplete image galleries."
    }
    else {
        Write-Host "`nSUCCESS: All $($totalNeeded) images were downloaded successfully." -ForegroundColor Green
    }
    
    return $totalSuccess
}

# The luxury image IDs are now defined in a single hashtable above ($luxuryImageIds)

# Main script execution

# Verify access key before proceeding
if (-not $AccessKey) {
    Write-Host "ERROR: Unsplash API access key not found. Please set the UNSPLASH_ACCESS_KEY environment variable." -ForegroundColor Red
    Write-Host "Example: `$env:UNSPLASH_ACCESS_KEY = 'your_access_key_here'" -ForegroundColor Yellow
    exit 1
}

try {
    # Start the download process
    Start-ImageDownload -ImageIds $luxuryImageIds -ImagesDirectory $ImagesDirectory -MaxRetries $MaxRetries -AccessKey $AccessKey
    
    # Exit with success code
    exit 0
}
catch [System.Net.WebException] {
    Write-Host "`nNETWORK ERROR: Unable to connect to Unsplash API." -ForegroundColor Red
    Write-Host "Error details: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please check your internet connection and try again." -ForegroundColor Yellow
    exit 1
}
catch [System.IO.IOException] {
    Write-Host "`nFILE SYSTEM ERROR: Unable to write image files." -ForegroundColor Red
    Write-Host "Error details: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please check folder permissions and available disk space." -ForegroundColor Yellow
    exit 1
}
catch {
    Write-Host "`nAn unexpected error occurred:" -ForegroundColor Red
    Write-Host "Error details: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Error type: $($_.Exception.GetType().FullName)" -ForegroundColor Red
    Write-Host "Stack trace: $($_.ScriptStackTrace)" -ForegroundColor DarkRed
    exit 1
}
finally {
    # Clean up resources and perform final actions
    Write-Host "`nScript execution completed at $(Get-Date)" -ForegroundColor Cyan
    
    # Remove any temporary files if they exist
    $tempFiles = Get-ChildItem -Path ".\*.tmp" -ErrorAction SilentlyContinue
    if ($tempFiles) {
        Write-Host "Cleaning up temporary files..." -ForegroundColor DarkCyan
        Remove-Item -Path $tempFiles -Force
    }
    
    # Report on remaining API rate limit if possible
    if (Test-Path variable:global:remainingApiCalls) {
        Write-Host "Remaining API rate limit: $global:remainingApiCalls" -ForegroundColor Cyan
    }
}
