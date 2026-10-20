import os
import zipfile

workspace = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
downloads_dir = os.path.join(workspace, "public", "downloads")
source_php = os.path.join(workspace, "plugins", "wordpress", "sendport-smtp", "sendport-smtp.php")
source_readme = os.path.join(workspace, "plugins", "wordpress", "sendport-smtp", "readme.txt")

os.makedirs(downloads_dir, exist_ok=True)
zip_path = os.path.join(downloads_dir, "sendport-smtp.zip")
zip_alt_path = os.path.join(downloads_dir, "sendport-smtp-email-deliverability.zip")

for target in [zip_path, zip_alt_path]:
    with zipfile.ZipFile(target, "w", compression=zipfile.ZIP_DEFLATED) as z:
        # Explicit POSIX forward slash entry names, leaving out assets/
        z.write(source_readme, arcname="sendport-smtp-email-deliverability/readme.txt")
        z.write(source_php, arcname="sendport-smtp-email-deliverability/sendport-smtp.php")

print("=== VERIFYING ZIP ENTRIES (Forward Slashes Only, No Assets) ===")
with zipfile.ZipFile(zip_path, "r") as z:
    for info in z.infolist():
        has_backslash = "\\" in info.filename
        print(f"Entry: '{info.filename}' (Size: {info.file_size} bytes, Has Backslash: {has_backslash})")
        assert not has_backslash, f"Backslash detected in {info.filename}"

print("All entries verified with pure forward slashes!")
