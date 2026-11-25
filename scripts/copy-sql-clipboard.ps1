Add-Type -AssemblyName System.Windows.Forms
$path = Join-Path $PSScriptRoot "..\supabase\APPLY_NEW_PROJECT.sql"
$text = [System.IO.File]::ReadAllText((Resolve-Path $path))
[System.Windows.Forms.Clipboard]::SetText($text)
Write-Output ("clipped " + $text.Length)
