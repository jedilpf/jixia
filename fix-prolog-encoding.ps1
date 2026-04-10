$filePath = 'F:\zz\jixia2.0【完整链路版本】\src\game\story\data\prolog.ts'
$content = Get-Content $filePath -Raw -Encoding UTF8

# The corrupted character is U+FFFD followed by ?, replace with appropriate Chinese punctuation
# Based on context, these are sentence endings - try 。 or leave as ?
$content = $content -replace '�\?', '?'
# Also handle standalone replacement character
$content = $content -replace '�', ''

[System.IO.File]::WriteAllText($filePath, $content, [System.Text.Encoding]::UTF8)
Write-Host "Fixed encoding in $filePath"
