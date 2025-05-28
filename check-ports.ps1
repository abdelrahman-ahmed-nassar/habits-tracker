# Port-checker for Habits Tracker
# This script checks for all port references in the codebase and ensures they're consistent

$targetPort = "5002"  # The target port we want to ensure is used
$filesChecked = 0
$inconsistencies = 0

Write-Host "Checking for port consistency across the codebase..."
Write-Host "Target port: $targetPort`n"

# Check backend files
$backendFiles = Get-ChildItem -Path "backend\src" -Recurse -Include "*.ts"
Write-Host "Checking backend files..."
foreach ($file in $backendFiles) {
    $filesChecked++
    $content = Get-Content $file.FullName
    
    # Look for port definitions
    $portLines = $content | Select-String -Pattern "const PORT.*=.*(\d{4,5})"
    
    foreach ($line in $portLines) {
        $match = $line -match "const PORT.*=.*(\d{4,5})"
        if ($matches[1] -ne $targetPort) {
            $inconsistencies++
            Write-Host "❌ Inconsistent port found in: $($file.FullName)" -ForegroundColor Red
            Write-Host "   $line"
        }
    }
}

# Check frontend API files
$frontendApiFiles = Get-ChildItem -Path "frontend\src\services" -Recurse -Include "*.ts"
Write-Host "`nChecking frontend API services..."
foreach ($file in $frontendApiFiles) {
    $filesChecked++
    $content = Get-Content $file.FullName
    
    # Look for API URL definitions
    $urlLines = $content | Select-String -Pattern "localhost:(\d{4,5})"
    
    foreach ($line in $urlLines) {
        $match = $line -match "localhost:(\d{4,5})"
        if ($matches[1] -ne $targetPort) {
            $inconsistencies++
            Write-Host "❌ Inconsistent port found in: $($file.FullName)" -ForegroundColor Red
            Write-Host "   $line"
        }
    }
}

# Check electron files
$electronFiles = Get-ChildItem -Path "frontend\electron" -Recurse -Include "*.js","*.cjs"
Write-Host "`nChecking Electron files..."
foreach ($file in $electronFiles) {
    $filesChecked++
    $content = Get-Content $file.FullName
      # Look for port references
    $portLines = $content | Select-String -Pattern 'PORT: ["''](\d{4,5})["'']|port (\d{4,5})'
    
    foreach ($line in $portLines) {
        if ($line -match 'PORT: ["''](\d{4,5})["'']') {
            if ($matches[1] -ne $targetPort) {
                $inconsistencies++
                Write-Host "❌ Inconsistent port found in: $($file.FullName)" -ForegroundColor Red
                Write-Host "   $line"
            }
        }
        elseif ($line -match "port (\d{4,5})") {
            if ($matches[1] -ne $targetPort) {
                $inconsistencies++
                Write-Host "❌ Inconsistent port found in: $($file.FullName)" -ForegroundColor Red
                Write-Host "   $line"
            }
        }
    }
}

# Check build scripts
$scriptFiles = Get-ChildItem -Path "." -Include "*.js","*.sh","*.bat" -File
Write-Host "`nChecking script files..."
foreach ($file in $scriptFiles) {
    $filesChecked++
    $content = Get-Content $file.FullName
    
    # Look for port references
    $portLines = $content | Select-String -Pattern "PORT=(\d{4,5})|port (\d{4,5})|waitForPort\((\d{4,5})\)"
    
    foreach ($line in $portLines) {
        if ($line -match "PORT=(\d{4,5})") {
            if ($matches[1] -ne $targetPort) {
                $inconsistencies++
                Write-Host "❌ Inconsistent port found in: $($file.FullName)" -ForegroundColor Red
                Write-Host "   $line"
            }
        }
        elseif ($line -match "port (\d{4,5})") {
            if ($matches[1] -ne $targetPort) {
                $inconsistencies++
                Write-Host "❌ Inconsistent port found in: $($file.FullName)" -ForegroundColor Red
                Write-Host "   $line"
            }
        }
        elseif ($line -match "waitForPort\((\d{4,5})\)") {
            if ($matches[1] -ne $targetPort) {
                $inconsistencies++
                Write-Host "❌ Inconsistent port found in: $($file.FullName)" -ForegroundColor Red
                Write-Host "   $line"
            }
        }
    }
}

# Summary
Write-Host "`n------------------------------"
Write-Host "PORT CONSISTENCY REPORT"
Write-Host "------------------------------"
Write-Host "Files checked: $filesChecked"
Write-Host "Target port: $targetPort"

if ($inconsistencies -eq 0) {
    Write-Host "✅ All port references are consistent!" -ForegroundColor Green
} else {
    Write-Host "❌ Found $inconsistencies inconsistent port reference(s)" -ForegroundColor Red
    Write-Host "Please fix the inconsistencies to ensure the application works correctly."
}
