Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead('c:\Users\officialum1 llc\Desktop\sendport\plugins\wordpress\sendport-smtp.zip')
$entry = $zip.GetEntry('sendport-smtp-email-deliverability/sendport-smtp.php')
$reader = New-Object System.IO.StreamReader($entry.Open())
$lineCount = 0
while (!$reader.EndOfStream -and $lineCount -lt 30) {
    $line = $reader.ReadLine()
    Write-Host "$lineCount : $line"
    $lineCount++
}
$reader.Close()
$zip.Dispose()
