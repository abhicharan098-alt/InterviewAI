import os
import re

def remove_chaos():
    count = 0
    for root, dirs, files in os.walk(r'c:\AI Interview Preparation Platform\src'):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    if 'data-chaos-item' in content:
                        # Strip exact match and any leading whitespace
                        new_content = re.sub(r'\s*data-chaos-item="true"', '', content)
                        
                        if new_content != content:
                            with open(path, 'w', encoding='utf-8') as f:
                                f.write(new_content)
                            count += 1
                            print(f"Updated {path}")
                except Exception as e:
                    print(f"Failed {path}: {e}")
    print(f"Updated {count} files.")

if __name__ == '__main__':
    remove_chaos()
