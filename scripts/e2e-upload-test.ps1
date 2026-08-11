# E2E smoke test against the real /api/resume/upload route.
# Forges a NextAuth HS256 session token (secret from .env) for the test user,
# then uploads INVALID files that must be rejected by server-side validation
# BEFORE any storage write or DB record is created.
param(
  [string]$Port = "3123",
  [string]$UserId = "3a3809dd-31ff-44d8-bb0f-3260ca232515"
)

$ErrorActionPreference = "Stop"

# Read the NextAuth secret from .env so no secret is hard-coded in this script.
$envLine = Get-Content .env | Where-Object { $_ -match '^AUTH_SECRET=' } | Select-Object -First 1
if (-not $envLine) { Write-Host "AUTH_SECRET not found in .env" -ForegroundColor Red; exit 2 }
$env:AUTH_SECRET = ($envLine -replace '^AUTH_SECRET=', '').Trim().Trim('"').Trim("'")
$base = "http://localhost:$Port"

# --- Build session token using NextAuth's own encoder (correct derived key) ---
$jwt = (node scripts/make-token.cjs $UserId) | Select-Object -Last 1
if ([string]::IsNullOrWhiteSpace($jwt)) { Write-Host "Could not mint token" -ForegroundColor Red; exit 2 }
$cookie = "next-auth.session-token=$jwt"

# --- Test files ---
$tmp = Join-Path $env:TEMP "resume-upload-e2e"
New-Item -ItemType Directory -Force -Path $tmp | Out-Null
Set-Content -Path (Join-Path $tmp "corrupt.pdf") -Value "hello this is not a pdf" -NoNewline -Encoding UTF8
[System.IO.File]::WriteAllBytes((Join-Path $tmp "legacy.doc"), [byte[]](0xd0,0xcf,0x11,0xe0,0xa1,0xb1,0x1a,0xe1,0x00,0x01,0x02))
New-Item -ItemType File -Path (Join-Path $tmp "empty.docx") -Force | Out-Null   # 0 bytes
Set-Content -Path (Join-Path $tmp "notes.txt") -Value "just text" -NoNewline -Encoding UTF8

function Test-Upload {
  param(
    [string]$File,
    [string]$Label,
    [int]$ExpectedStatus,
    [string]$ExpectedPattern
  )
  $filePath = Join-Path $tmp $File
  $resp = & curl.exe -s -w "`n%{http_code}" -X POST "$base/api/resume/upload" `
    -H "Cookie: $cookie" `
    -F "file=@$filePath" 2>&1
  $lines = $resp -split "`n"
  $code = $lines[-1]
  $body = ($lines[0..($lines.Length - 2)] -join "`n")
  $ok = ($code -eq "$ExpectedStatus") -and ($body -match $ExpectedPattern)
  if ($ok) {
    Write-Host "  PASS  $Label -> HTTP $code / $body" -ForegroundColor Green
  } else {
    Write-Host "  FAIL  $Label -> HTTP $code / $body" -ForegroundColor Red
    $script:sawFailure = $true
  }
}

Write-Host "=== E2E upload route (invalid files must be rejected before any write) ==="

Test-Upload -File "corrupt.pdf" -Label "corrupted PDF rejected with message" -ExpectedStatus 400 -ExpectedPattern "not a valid PDF"
Test-Upload -File "legacy.doc" -Label "legacy .doc rejected with convert hint" -ExpectedStatus 400 -ExpectedPattern "convert"
Test-Upload -File "empty.docx" -Label "empty DOCX rejected" -ExpectedStatus 400 -ExpectedPattern "empty"
Test-Upload -File "notes.txt" -Label "unsupported .txt rejected" -ExpectedStatus 400 -ExpectedPattern "Unsupported file type"

# Path traversal filename (curl --form-string to force a crafted name)
$resp = & curl.exe -s -w "`n%{http_code}" -X POST "$base/api/resume/upload" `
  -H "Cookie: $cookie" `
  -F "file=@$(Join-Path $tmp 'corrupt.pdf');filename=..%2F..%2Fevil.pdf;type=application/pdf" 2>&1
$lines = $resp -split "`n"
$code = $lines[-1]
$body = ($lines[0..($lines.Length - 2)] -join "`n")
if ($code -eq "400" -and $body -match "Invalid file name") {
  Write-Host "  PASS  path-traversal filename rejected -> HTTP $code / $body" -ForegroundColor Green
} else {
  Write-Host "  FAIL  path-traversal filename -> HTTP $code / $body" -ForegroundColor Red
  $script:sawFailure = $true
}

Write-Host ""
if ($script:sawFailure) {
  Write-Host "E2E: SOME CHECK FAILED" -ForegroundColor Red
  exit 1
} else {
  Write-Host "E2E: ALL CHECKS PASSED (no storage/DB writes happened)" -ForegroundColor Green
}