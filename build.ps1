# =============================================================================
# CHROME & FIREFOX EXTENSION BUILD SCRIPT
# =============================================================================
#
# Project: Restore YouTube Fullscreen Scroll
# Purpose: Automates the creation of browser extension packages for distribution
# Author:  cyberofficial
# GitHub:  https://github.com/cyberofficial/restore-youtube-scroll
#
# WHAT THIS SCRIPT DOES:
# 1. Creates separate build packages for Chrome and Firefox browsers
# 2. Reads version numbers from each browser's manifest file
# 3. Packages extension files into ZIP archives for distribution
# 4. Organizes builds into separate folders for each browser
#
# INPUT FILES REQUIRED:
# - manifest.chrome.json  (Chrome extension manifest)
# - manifest.firefox.json (Firefox extension manifest) 
# - background.js       (Background service worker)
# - content.js          (Extension content script)
# - scroll-bar.png      (Extension icon)
#
# OUTPUT STRUCTURE:
# builds/
# ├── chrome/
# │   └── [version].zip   (e.g., 1.0.1.zip)
# └── firefox/
#     └── [version].zip   (e.g., 1.0.2.zip)
#
# SECURITY & TRANSPARENCY:
# - This script only reads local files and creates ZIP archives
# - No network connections are made
# - No external executables are downloaded or run
# - All operations are standard PowerShell file operations
# - Source code is fully visible and documented
#
# USAGE:
# .\build.ps1           # Normal build
# .\build.ps1 -Clean    # Clean existing builds first
#
# =============================================================================

# Build script for Chrome and Firefox extensions
# This script creates distribution packages for both browsers

param(
    [switch]$Clean = $false  # Optional parameter to clean existing builds
)

# =============================================================================
# SCRIPT INITIALIZATION
# =============================================================================

# Get the script directory (where this PowerShell script is located)
# This ensures the script works regardless of where it's executed from
$scriptDir = $PSScriptRoot
if (-not $scriptDir) {
    # Fallback for older PowerShell versions
    $scriptDir = Get-Location
}

Write-Host "Building extensions from: $scriptDir" -ForegroundColor Green
Write-Host "Script started at: $(Get-Date)" -ForegroundColor Gray

# =============================================================================
# DIRECTORY STRUCTURE SETUP
# =============================================================================

# Define the build output directories
# builds/chrome/  - For Chrome Web Store packages
# builds/firefox/ - For Firefox Add-ons packages
$buildsDir = Join-Path $scriptDir "builds"
$chromeDir = Join-Path $buildsDir "chrome"
$firefoxDir = Join-Path $buildsDir "firefox"

# Clean existing builds if the -Clean parameter is specified
# This removes old build artifacts to ensure a fresh build
if ($Clean) {
    Write-Host "Cleaning existing builds..." -ForegroundColor Yellow
    if (Test-Path $buildsDir) {
        Remove-Item $buildsDir -Recurse -Force
        Write-Host "  ✓ Removed existing builds directory" -ForegroundColor Gray
    }
}

# Create the directory structure for builds
# -Force ensures directories are created even if they already exist
New-Item -ItemType Directory -Path $chromeDir -Force | Out-Null
New-Item -ItemType Directory -Path $firefoxDir -Force | Out-Null
Write-Host "✓ Created build directories" -ForegroundColor Gray

# =============================================================================
# FILE VALIDATION
# =============================================================================

# Define the files that must be included in every extension package
# These are the core files needed for the extension to function
$requiredFiles = @(
    "background.js",  # Background service worker controlling browser fullscreen
    "content.js",      # Main extension script that runs on YouTube pages
    "scroll-bar.png"   # Extension icon displayed in browser
)

Write-Host "Validating required files..." -ForegroundColor Yellow

# Check if all required files exist in the script directory
# Exit with error if any required file is missing
foreach ($file in $requiredFiles) {
    $filePath = Join-Path $scriptDir $file
    if (-not (Test-Path $filePath)) {
        Write-Error "MISSING REQUIRED FILE: $file"
        Write-Error "The extension cannot be built without this file."
        exit 1
    }
    Write-Host "  ✓ Found: $file" -ForegroundColor Gray
}

$chromeManifestPath = Join-Path $scriptDir "manifest.chrome.json"
$firefoxManifestPath = Join-Path $scriptDir "manifest.firefox.json"

if (-not (Test-Path $chromeManifestPath)) {
    Write-Error "ERROR: Chrome manifest not found at: $chromeManifestPath"
    exit 1
}

function Get-NextPatchVersion {
    param(
        [Parameter(Mandatory = $true)]
        [string]$CurrentVersion
    )

    $parts = $CurrentVersion -split '\.'
    if ($parts.Length -lt 1) {
        throw "Version '$CurrentVersion' is not in a valid dotted format."
    }

    $numericParts = @()
    foreach ($part in $parts) {
        try {
            $numericParts += [int]$part
        } catch {
            throw "Version segment '$part' in '$CurrentVersion' is not numeric."
        }
    }

    $lastIndex = $numericParts.Length - 1
    $numericParts[$lastIndex]++

    $newParts = $numericParts | ForEach-Object { $_.ToString() }
    return ($newParts -join '.')
}

function Update-ManifestVersions {
    param(
        [Parameter(Mandatory = $true)]
        [string]$ChromeManifestPath,
        [Parameter(Mandatory = $true)]
        [string]$FirefoxManifestPath
    )

    $chromeManifestJson = Get-Content $ChromeManifestPath -Raw
    $chromeManifest = $chromeManifestJson | ConvertFrom-Json
    $currentVersion = $chromeManifest.version
    $newVersion = Get-NextPatchVersion -CurrentVersion $currentVersion
    $chromeManifest.version = $newVersion
    $chromeManifest | ConvertTo-Json -Depth 10 | Set-Content -Path $ChromeManifestPath -Encoding UTF8

    if (Test-Path $FirefoxManifestPath) {
        $firefoxManifestJson = Get-Content $FirefoxManifestPath -Raw
        $firefoxManifest = $firefoxManifestJson | ConvertFrom-Json
        $firefoxManifest.version = $newVersion
        $firefoxManifest | ConvertTo-Json -Depth 10 | Set-Content -Path $FirefoxManifestPath -Encoding UTF8
    }

    Write-Host "Version bumped: $currentVersion -> $newVersion" -ForegroundColor Yellow
    return $newVersion
}

$updatedVersion = Update-ManifestVersions -ChromeManifestPath $chromeManifestPath -FirefoxManifestPath $firefoxManifestPath

# =============================================================================
# EXTENSION PACKAGE CREATION FUNCTION
# =============================================================================

# This function creates a complete extension package for a specific browser
# It handles manifest processing, file copying, and ZIP creation
function New-ExtensionPackage {
    param(
        [string]$BrowserName,    # Human-readable browser name (e.g., "Chrome", "Firefox")
        [string]$ManifestSource, # Source manifest file (e.g., "manifest.chrome.json")
        [string]$OutputDir       # Directory where the ZIP file will be created
    )
    
    Write-Host "`nBuilding $BrowserName extension..." -ForegroundColor Cyan
    
    # =============================================================================
    # MANIFEST PROCESSING
    # =============================================================================
    
    # Read the browser-specific manifest file to get version and metadata
    $manifestPath = Join-Path $scriptDir $ManifestSource
    if (-not (Test-Path $manifestPath)) {
        Write-Error "ERROR: $BrowserName manifest not found at: $manifestPath"
        Write-Error "Make sure the manifest file exists before running the build."
        return
    }
    
    # Parse the JSON manifest to extract version information
    # This is safe as we're only reading local files we control
    try {
        $manifest = Get-Content $manifestPath | ConvertFrom-Json
        $version = $manifest.version
        Write-Host "  📋 $BrowserName version: $version" -ForegroundColor Yellow
        Write-Host "  📄 Using manifest: $ManifestSource" -ForegroundColor Gray
    }
    catch {
        Write-Error "ERROR: Failed to parse $ManifestSource - Invalid JSON format"
        return
    }
    
    # =============================================================================
    # TEMPORARY DIRECTORY SETUP
    # =============================================================================
    
    # Create a temporary directory to stage files before ZIP creation
    # This ensures clean packaging without affecting source files
    $tempDir = Join-Path $OutputDir "temp"
    New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
    Write-Host "  📁 Created temporary staging directory" -ForegroundColor Gray
    
    try {
        # =============================================================================
        # FILE COPYING AND MANIFEST RENAME
        # =============================================================================
        
        # Copy the browser-specific manifest and rename it to the standard "manifest.json"
        # This is required because both Chrome and Firefox expect "manifest.json"
        $manifestDest = Join-Path $tempDir "manifest.json"
        Copy-Item $manifestPath $manifestDest
        Write-Host "  ✓ Copied $ManifestSource -> manifest.json" -ForegroundColor Green
        
        # Copy all required extension files to the temporary directory
        foreach ($file in $requiredFiles) {
            $source = Join-Path $scriptDir $file
            $dest = Join-Path $tempDir $file
            Copy-Item $source $dest
            Write-Host "  ✓ Copied $file" -ForegroundColor Green
        }
        
        # =============================================================================
        # ZIP ARCHIVE CREATION
        # =============================================================================
        
        # Create ZIP file named with the version from the manifest
        # This allows multiple versions to coexist in the builds directory
        $zipName = "$version.zip"
        $zipPath = Join-Path $OutputDir $zipName
        
        # Remove any existing ZIP file with the same version
        # This prevents conflicts and ensures fresh packaging
        if (Test-Path $zipPath) {
            Remove-Item $zipPath -Force
            Write-Host "  ⚠️  Removed existing $zipName" -ForegroundColor Yellow
        }
        
        # Create ZIP using PowerShell's built-in compression
        # This is a standard Windows feature, no external tools required
        if ($PSVersionTable.PSVersion.Major -ge 5) {
            # Use modern PowerShell compression (Windows 10+)
            Compress-Archive -Path "$tempDir\*" -DestinationPath $zipPath -CompressionLevel Optimal
        } else {
            # Fallback for older PowerShell versions (Windows 7/8)
            Add-Type -AssemblyName System.IO.Compression.FileSystem
            [System.IO.Compression.ZipFile]::CreateFromDirectory($tempDir, $zipPath)
        }
        
        Write-Host "  ✓ Created $zipName" -ForegroundColor Green
        
        # =============================================================================
        # PACKAGE VERIFICATION
        # =============================================================================
        
        # Display the contents of the created ZIP for verification
        # This helps ensure all required files are included
        $zipContents = Get-ChildItem $tempDir | Select-Object -ExpandProperty Name
        Write-Host "  📦 ZIP contains: $($zipContents -join ', ')" -ForegroundColor Gray
        
        # Show the file size of the created package
        $zipSize = Get-Item $zipPath | Select-Object -ExpandProperty Length
        $zipSizeKB = [Math]::Round($zipSize / 1024, 2)
        Write-Host "  📊 Package size: $zipSizeKB KB" -ForegroundColor Gray
        
        # Verify ZIP integrity by attempting to read it
        try {
            Add-Type -AssemblyName System.IO.Compression.FileSystem
            $zip = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
            $fileCount = $zip.Entries.Count
            $zip.Dispose()
            Write-Host "  ✅ ZIP verification: $fileCount files packaged successfully" -ForegroundColor Green
        }
        catch {
            Write-Warning "  ⚠️  Could not verify ZIP integrity, but file was created"
        }
        
    } finally {
        # =============================================================================
        # CLEANUP
        # =============================================================================
        
        # Always clean up the temporary directory, even if an error occurred
        # This prevents build artifacts from accumulating
        if (Test-Path $tempDir) {
            Remove-Item $tempDir -Recurse -Force
            Write-Host "  🧹 Cleaned up temporary files" -ForegroundColor Gray
        }
    }
}

# =============================================================================
# BUILD EXECUTION
# =============================================================================

Write-Host "`n🚀 Starting extension builds..." -ForegroundColor Cyan

# Build Chrome extension package
# Uses manifest.chrome.json for Chrome Web Store distribution
Write-Host "`n--- CHROME BUILD ---" -ForegroundColor Blue
New-ExtensionPackage -BrowserName "Chrome" -ManifestSource "manifest.chrome.json" -OutputDir $chromeDir

# Build Firefox extension package  
# Uses manifest.firefox.json for Firefox Add-ons distribution
Write-Host "`n--- FIREFOX BUILD ---" -ForegroundColor Blue
New-ExtensionPackage -BrowserName "Firefox" -ManifestSource "manifest.firefox.json" -OutputDir $firefoxDir

# =============================================================================
# BUILD COMPLETION SUMMARY
# =============================================================================

Write-Host "`n🎉 Build completed successfully!" -ForegroundColor Green
Write-Host "Build finished at: $(Get-Date)" -ForegroundColor Gray

# Display the created packages with their full paths
Write-Host "`n📦 Created packages:" -ForegroundColor Yellow
if (Test-Path $chromeDir) {
    $chromePackages = Get-ChildItem $chromeDir -Filter "*.zip"
    foreach ($package in $chromePackages) {
        Write-Host "  Chrome:  builds\chrome\$($package.Name)" -ForegroundColor White
    }
}
if (Test-Path $firefoxDir) {
    $firefoxPackages = Get-ChildItem $firefoxDir -Filter "*.zip" 
    foreach ($package in $firefoxPackages) {
        Write-Host "  Firefox: builds\firefox\$($package.Name)" -ForegroundColor White
    }
}

# =============================================================================
# FILE LISTING FOR VERIFICATION
# =============================================================================

# List all created files for transparency and verification
Write-Host "`n📁 Complete build output:" -ForegroundColor Yellow
if (Test-Path $buildsDir) {
    Get-ChildItem $buildsDir -Recurse -File | ForEach-Object {
        $relativePath = $_.FullName.Replace($scriptDir, "").TrimStart('\')
        $fileSizeKB = [Math]::Round($_.Length / 1024, 2)
        Write-Host "  $relativePath ($fileSizeKB KB)" -ForegroundColor Gray
    }
} else {
    Write-Host "  No build files created" -ForegroundColor Red
}

# =============================================================================
# USAGE INSTRUCTIONS
# =============================================================================

Write-Host "`n📋 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Test the extensions by loading them in developer mode" -ForegroundColor White
Write-Host "  2. Upload Chrome package to Chrome Web Store Developer Dashboard" -ForegroundColor White  
Write-Host "  3. Upload Firefox package to Firefox Add-ons Developer Hub" -ForegroundColor White
Write-Host "  4. Both packages can also be distributed as sideloadable extensions" -ForegroundColor White

Write-Host "`n✨ Build script completed without errors!" -ForegroundColor Green