# Script to download luxury interior images from Unsplash for unit pages
# This script will download luxury images for units 8A, 10N, and 12B

# Define image categories and their search terms
$imageCategories = @{
    "living"    = "luxury living room interior"
    "kitchen"   = "luxury kitchen interior"
    "bedroom"   = "luxury bedroom interior" 
    "bathroom"  = "luxury bathroom interior"
    "view"      = "luxury penthouse view"
}

# Define unit folders
$unitFolders = @("8A", "10N", "12B")

# Simple URL encoding function to replace System.Web.HttpUtility
function Encode-Url {
    param(
        [string]$Text
    )
    # Replace spaces with %20 and handle other common special characters
    $Text = $Text -replace ' ', '%20'
    $Text = $Text -replace '\+', '%2B'
    $Text = $Text -replace '&', '%26'
    $Text = $Text -replace '#', '%23'
    $Text = $Text -replace '@', '%40'
    
    return $Text
}

# Function to download an image and save it to the specified path
function Download-Image {
    param(
        [string]$SearchTerm,
        [string]$OutputPath,
        [string]$FileName,
        [int]$MaxRetries = 3
    )
    
    # Create a safe search term for the URL using our simple encoding function
    $encodedSearchTerm = Encode-Url -Text $SearchTerm
    
    # Use Unsplash Source API to get a random image matching the search term
    $imageUrl = "https://source.unsplash.com/1200x800/?$encodedSearchTerm"
    
    Write-Host "Downloading $SearchTerm image to $OutputPath\$FileName..." -ForegroundColor Cyan
    
    $retryCount = 0
    $success = $false
    
    while (-not $success -and $retryCount -lt $MaxRetries) {
        try {
            # Download the image with timeout
            $progressPreference = 'SilentlyContinue'  # Suppress progress bar for cleaner output
            Invoke-WebRequest -Uri $imageUrl -OutFile "$OutputPath\$FileName" -UseBasicParsing -TimeoutSec 30
            $progressPreference = 'Continue'  # Restore progress preference
            
            # Verify the download was successful and has content
            if ((Test-Path -Path "$OutputPath\$FileName") -and (Get-Item -Path "$OutputPath\$FileName").length -gt 0) {
                Write-Host "  [SUCCESS] Successfully downloaded: $FileName" -ForegroundColor Green
                $success = $true
            } else {
                $retryCount++
                Write-Host "  [ERROR] Downloaded file is empty, retrying ($retryCount of $MaxRetries)..." -ForegroundColor Yellow
                Start-Sleep -Seconds 2
            }
        }
        catch {
            $retryCount++
            Write-Host "  [ERROR] Error downloading image: $_" -ForegroundColor Red
            Write-Host "  Retrying ($retryCount of $MaxRetries)..." -ForegroundColor Yellow
            Start-Sleep -Seconds 2
        }
    }
    
    if (-not $success) {
        Write-Host "  [FAILED] Failed to download $FileName after $MaxRetries attempts" -ForegroundColor Red
    }
    
    return $success
}

# Track overall progress
$totalImages = $unitFolders.Count * $imageCategories.Count
$currentImage = 0
$successCount = 0
$failureCount = 0

Write-Host "`n===== Starting download of $totalImages images =====" -ForegroundColor Magenta

# Ensure the image directories exist
foreach ($unit in $unitFolders) {
    $folderPath = ".\images\$unit"
    
    # Check if folder exists, create if it doesn't
    if (-not (Test-Path -Path $folderPath)) {
        Write-Host "Creating folder: $folderPath"
        New-Item -ItemType Directory -Path $folderPath -Force | Out-Null
    }
    
    Write-Host "`nProcessing unit $unit..." -ForegroundColor Yellow
    
    # Download images for each category for this unit
    foreach ($category in $imageCategories.Keys) {
        $currentImage++
        $searchTerm = $imageCategories[$category]
        $fileName = "$category.jpg"
        
        $progressPercentage = [math]::Round(($currentImage / $totalImages) * 100)
        Write-Host "`nProgress: [$progressPercentage%] ($currentImage of $totalImages)" -ForegroundColor Magenta
        
        $result = Download-Image -SearchTerm $searchTerm -OutputPath $folderPath -FileName $fileName
        
        if ($result) {
            $successCount++
        } else {
            $failureCount++
        }
        
        # Add a small delay to avoid hitting rate limits
        Start-Sleep -Milliseconds 800
    }
}

Write-Host "`n===== Download process completed =====" -ForegroundColor Cyan
Write-Host "Results: $successCount successful, $failureCount failed out of $totalImages total images" -ForegroundColor Cyan
Write-Host "The images are saved in the following locations:"
foreach ($unit in $unitFolders) {
    Write-Host "  - .\images\$unit\" -ForegroundColor Yellow
}

