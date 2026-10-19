import os
import zipfile
import shutil

base_dir = r"c:\Users\officialum1 llc\Desktop\sendport\plugins\wordpress"
src_dir = os.path.join(base_dir, "sendport-smtp")
slug = "sendport-smtp-email-deliverability"
target_dir = os.path.join(base_dir, slug)
zip_path = os.path.join(base_dir, f"{slug}.zip")

# 1. Prepare target directory
if os.path.exists(target_dir):
    shutil.rmtree(target_dir)

os.makedirs(os.path.join(target_dir, "assets"), exist_ok=True)

# Copy readme.txt
shutil.copy2(os.path.join(src_dir, "readme.txt"), os.path.join(target_dir, "readme.txt"))

# Copy main plugin file renamed to match slug
shutil.copy2(os.path.join(src_dir, "sendport-smtp.php"), os.path.join(target_dir, f"{slug}.php"))

# Copy icon
shutil.copy2(os.path.join(src_dir, "assets", "icon-128x128.png"), os.path.join(target_dir, "assets", "icon-128x128.png"))

# 2. Create ZIP with forward-slash paths
if os.path.exists(zip_path):
    os.remove(zip_path)

with zipfile.ZipFile(zip_path, 'w', compression=zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(target_dir):
        for file in files:
            full_path = os.path.join(root, file)
            # Relative path from base_dir with forward slashes
            rel_path = os.path.relpath(full_path, base_dir).replace("\\", "/")
            zipf.write(full_path, arcname=rel_path)

print(f"Successfully created: {zip_path}")
print(f"Archive Size: {os.path.getsize(zip_path)} bytes")

# Verify entries
with zipfile.ZipFile(zip_path, 'r') as zipf:
    print("\nVerified Archive Entries (Forward Slashes):")
    for info in zipf.infolist():
        print(f" - {info.filename} ({info.file_size} bytes)")
