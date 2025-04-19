import os

def force_remove(path):
    """Recursively changes permissions and removes files and directories."""
    if not os.path.exists(path):
        return True
    if os.path.isfile(path) or os.path.islink(path):
        try:
            os.chmod(path, 0o777)
            os.unlink(path)
            return True
        except OSError as e:
            print(f"Error removing file/link {path}: {e}")
            return False
    elif os.path.isdir(path):
        success = True
        for item in os.listdir(path):
            item_path = os.path.join(path, item)
            if not force_remove(item_path):
                success = False
        if success:
            try:
                os.rmdir(path)
                return True
            except OSError as e:
                print(f"Error removing directory {path}: {e}")
                return False
        else:
            print(f"Failed to remove contents of directory: {path}")
            return False
    return False
