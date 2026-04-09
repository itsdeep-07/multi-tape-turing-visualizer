import os

def bump_text_sizes(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    replacements = [
        ('text-sm', 'text-base'),
        ('text-xs', 'text-sm'),
        ('text-[11px]', 'text-sm'),
        ('text-[10px]', 'text-sm'),
        ('text-[9px]', 'text-xs'),
        ('text-[8px]', 'text-xs'),
        ('text-[10px]', 'text-sm'),
        ('h-3.5', 'h-4'),
        ('w-3.5', 'w-4')
    ]

    new_content = content
    for old, new in replacements:
        new_content = new_content.replace(old, new)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)

def main():
    root_dir = r"c:\Users\DEEPAK\Downloads\Multi-Tape Turing Machine Visualizer(1)\src\app"
    for subdir, _, files in os.walk(root_dir):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                bump_text_sizes(os.path.join(subdir, file))

if __name__ == '__main__':
    main()
