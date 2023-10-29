import zipfile
import os

def create_lambda_package(source_directory, output_filename):
    with zipfile.ZipFile(output_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(source_directory):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, source_directory)
                zipf.write(file_path, arcname)

# デプロイパッケージを作成
create_lambda_package('modules', 'modules.zip')
