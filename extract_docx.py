import zipfile
import xml.etree.ElementTree as ET
import sys
import os

def extract_text_from_docx(docx_path):
    try:
        document = zipfile.ZipFile(docx_path)
        xml_content = document.read('word/document.xml')
        document.close()
        tree = ET.XML(xml_content)
        
        paragraphs = []
        for paragraph in tree.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p'):
            texts = [node.text for node in paragraph.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t') if node.text]
            if texts:
                paragraphs.append(''.join(texts))
            else:
                paragraphs.append('') # keep empty lines
        return '\n'.join(paragraphs)
    except Exception as e:
        return str(e)

files = [
    r"e:\Desktop\Aim_Nature_Cure_Management_System\AIM_Nature_Cure_ERP_PRD_v1.0.docx",
    r"e:\Desktop\Aim_Nature_Cure_Management_System\AIM_Nature_Cure_Implementation_Roadmap.docx",
    r"e:\Desktop\Aim_Nature_Cure_Management_System\AIM_Nature_Cure_Prescripto_Gap_Analysis.docx"
]

for f in files:
    out_file = f + ".txt"
    with open(out_file, 'w', encoding='utf-8') as out:
        out.write(extract_text_from_docx(f))
    print(f"Extracted {f} to {out_file}")
