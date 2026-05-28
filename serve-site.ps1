param(
  [int]$Port = 4173
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$listener = [System.Net.HttpListener]::new()
$prefix = "http://127.0.0.1:$Port/"
$listener.Prefixes.Add($prefix)

$mime = @{
  ".html" = "text/html; charset=utf-8"
  ".css" = "text/css; charset=utf-8"
  ".js" = "text/javascript; charset=utf-8"
  ".jpg" = "image/jpeg"
  ".jpeg" = "image/jpeg"
  ".png" = "image/png"
  ".svg" = "image/svg+xml"
  ".docx" = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
}

function Send-Text($response, [int]$status, [string]$text) {
  $bytes = [System.Text.Encoding]::UTF8.GetBytes($text)
  $response.StatusCode = $status
  $response.ContentType = "text/plain; charset=utf-8"
  $response.OutputStream.Write($bytes, 0, $bytes.Length)
  $response.Close()
}

$listener.Start()
Write-Host "Serving $root at $prefix"

while ($listener.IsListening) {
  $context = $listener.GetContext()
  $requestPath = [Uri]::UnescapeDataString($context.Request.Url.AbsolutePath.TrimStart("/"))
  if ([string]::IsNullOrWhiteSpace($requestPath)) {
    $requestPath = "index.html"
  }

  $target = [System.IO.Path]::GetFullPath((Join-Path $root $requestPath))
  if (-not $target.StartsWith($root, [System.StringComparison]::OrdinalIgnoreCase)) {
    Send-Text $context.Response 403 "Forbidden"
    continue
  }

  if (-not [System.IO.File]::Exists($target)) {
    Send-Text $context.Response 404 "Not found"
    continue
  }

  $bytes = [System.IO.File]::ReadAllBytes($target)
  $ext = [System.IO.Path]::GetExtension($target).ToLowerInvariant()
  $context.Response.StatusCode = 200
  $context.Response.ContentType = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { "application/octet-stream" }
  $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
  $context.Response.Close()
}
