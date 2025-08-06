# Test script for bulk template upload using PowerShell
param(
    [string]$ServerUrl = "http://localhost:7070",
    [string]$Overwrite = "true"
)

function Test-BulkUpload {
    param(
        [string[]]$FilePaths,
        [string]$Url,
        [string]$OverwriteFlag = "true"
    )
    
    $boundary = [System.Guid]::NewGuid().ToString()
    $LF = "`r`n"
    $bodyLines = @()
    
    # Add each file
    foreach ($filePath in $FilePaths) {
        if (Test-Path $filePath) {
            $fileName = Split-Path $filePath -Leaf
            $content = Get-Content $filePath -Raw
            
            $bodyLines += "--$boundary"
            $bodyLines += "Content-Disposition: form-data; name=`"templateFiles`"; filename=`"$fileName`""
            $bodyLines += "Content-Type: text/plain"
            $bodyLines += ""
            $bodyLines += $content
        } else {
            Write-Warning "File not found: $filePath"
        }
    }
    
    # Add overwrite parameter
    $bodyLines += "--$boundary"
    $bodyLines += "Content-Disposition: form-data; name=`"overwrite`""
    $bodyLines += ""
    $bodyLines += $OverwriteFlag
    
    # Add page token
    $bodyLines += "--$boundary"
    $bodyLines += "Content-Disposition: form-data; name=`"pageToken`""
    $bodyLines += ""
    $bodyLines += "test-token"
    
    # Close boundary
    $bodyLines += "--$boundary--"
    
    $body = $bodyLines -join $LF
    $contentType = "multipart/form-data; boundary=$boundary"
    
    try {
        Write-Host "🚀 Testing bulk upload to $Url..." -ForegroundColor Green
        Write-Host "📁 Files to upload: $($FilePaths.Count)" -ForegroundColor Cyan
        
        $response = Invoke-RestMethod -Uri "$Url/api/templates/upload/bulk" -Method Post -Body $body -ContentType $contentType
        
        Write-Host "✅ Success!" -ForegroundColor Green
        Write-Host "📊 Results:" -ForegroundColor Yellow
        $response | ConvertTo-Json -Depth 3 | Write-Host
        
        return $response
    } catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "Response: $responseBody" -ForegroundColor Red
        }
        return $null
    }
}

# Test files
$testFiles = @(
    "temp-templates\test-invoice.hbs",
    "temp-templates\test-receipt.hbs", 
    "temp-templates\test-simple.hbs"
)

Write-Host "🧪 Testing Bulk Template Upload API" -ForegroundColor Magenta
Write-Host "====================================" -ForegroundColor Magenta

# Test 1: Upload all three files
Write-Host "`n🔹 Test 1: Upload 3 templates with overwrite=true" -ForegroundColor Blue
$result1 = Test-BulkUpload -FilePaths $testFiles -Url $ServerUrl -OverwriteFlag $Overwrite

# Test 2: Try to upload again without overwrite (should skip)
if ($result1) {
    Write-Host "`n🔹 Test 2: Upload same templates with overwrite=false (should skip)" -ForegroundColor Blue
    $result2 = Test-BulkUpload -FilePaths $testFiles -Url $ServerUrl -OverwriteFlag "false"
}

# Test 3: Verify templates are listed
Write-Host "`n🔹 Test 3: Verify templates are listed in API" -ForegroundColor Blue
try {
    $templates = Invoke-RestMethod -Uri "$ServerUrl/api/templates/list" -Method Get
    Write-Host "📋 Available templates:" -ForegroundColor Cyan
    $templates | ForEach-Object { Write-Host "  - $_" -ForegroundColor White }
} catch {
    Write-Host "❌ Failed to list templates: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n✨ Bulk upload testing completed!" -ForegroundColor Green
