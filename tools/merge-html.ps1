$ErrorActionPreference = "Stop"

$root = (Get-Location).Path
$includeDirs = @("", "client", "expert", "learner")

$files = @()
foreach ($dir in $includeDirs) {
    if ($dir -eq "") {
        $files += Get-ChildItem -Path $root -Filter *.html -File
    } else {
        $target = Join-Path $root $dir
        if (Test-Path $target) {
            $files += Get-ChildItem -Path $target -Filter *.html -File -Recurse
        }
    }
}

$files = $files | Sort-Object FullName

$styles = New-Object System.Collections.Generic.List[string]
$externalScripts = New-Object System.Collections.Generic.HashSet[string] ([StringComparer]::OrdinalIgnoreCase)
$sections = New-Object System.Collections.Generic.List[string]
$toc = New-Object System.Collections.Generic.List[string]

$scriptSrcPattern = @'
<script[^>]*\ssrc=["']([^"']+)["'][^>]*>\s*</script>
'@

foreach ($file in $files) {
    $path = $file.FullName
    $rel = $path.Substring($root.Length).TrimStart('\', '/')
    $raw = [System.IO.File]::ReadAllText($path)

    $headMatch = [regex]::Match($raw, '<head[^>]*>([\s\S]*?)</head>', 'IgnoreCase')
    $head = $headMatch.Groups[1].Value
    if ($head) {
        foreach ($m in [regex]::Matches($head, '<style[^>]*>[\s\S]*?</style>', 'IgnoreCase')) {
            $styles.Add($m.Value)
        }
    }

    $titleMatch = [regex]::Match($head, '<title[^>]*>([\s\S]*?)</title>', 'IgnoreCase')
    $title = if ($titleMatch.Success) { $titleMatch.Groups[1].Value.Trim() } else { $rel }

    $bodyMatch = [regex]::Match($raw, '<body[^>]*>([\s\S]*?)</body>', 'IgnoreCase')
    $body = $bodyMatch.Groups[1].Value

    if ($body) {
        $body = [regex]::Replace(
            $body,
            $scriptSrcPattern,
            {
                param($m)
                $src = $m.Groups[1].Value
                if ($src) {
                    $normalized = $src -replace "^\\.\\./", ""
                    $null = $externalScripts.Add($normalized)
                }
                return ""
            },
            "IgnoreCase"
        )
    }

    $safeId = "page-" + (($rel -replace "[^a-zA-Z0-9]+", "-").Trim("-").ToLower())
    $toc.Add("<a href=""#$safeId"">$title</a>")

    $section = @"
<section id="$safeId" class="merged-section" data-source="$rel">
  <div class="merged-header">
    <h2>$title</h2>
    <p class="merged-meta">$rel</p>
  </div>
  <div class="merged-body">
$body
  </div>
</section>
"@

    $sections.Add($section)
}

$baseStyles = @"
<style>
.merge-toc {
  position: sticky;
  top: 0;
  background: #0b1d2a;
  padding: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  z-index: 999;
}
.merge-toc a {
  color: #fff;
  text-decoration: none;
  padding: 6px 10px;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 999px;
  font-size: 12px;
}
.merged-section {
  padding: 28px 20px;
  border-top: 1px solid rgba(0,0,0,0.08);
}
.merged-header h2 {
  margin: 0 0 4px;
  font-size: 20px;
}
.merged-meta {
  margin: 0 0 16px;
  color: #6c757d;
  font-size: 12px;
}
</style>
"@

$allStyles = $baseStyles + ($styles -join "`n")
$scriptTags = ($externalScripts | Sort-Object | ForEach-Object { "<script src=""$_""></script>" }) -join "`n"

$html = @"
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Merged Pages</title>
  <link rel="stylesheet" href="assets/css/site.css">
$allStyles
</head>
<body>
  <nav class="merge-toc">
$($toc -join "`n")
  </nav>

$($sections -join "`n")

$scriptTags
</body>
</html>
"@

$target = Join-Path $root "merged.html"
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($target, $html, $utf8NoBom)
