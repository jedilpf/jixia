import os
import docx
import fitz

doc1 = r"c:\Users\21389\Documents\trae_projects\jixia2.0【完整链路版本】\docs\稷下策划案.pdf"
doc2 = r"c:\Users\21389\Documents\trae_projects\jixia2.0【完整链路版本】\docs\卡牌    设计假设与统一视觉规范.docx"

def read_docx(path):
    doc = docx.Document(path)
    return "\n".join([para.text for para in doc.paragraphs])

def read_pdf(path):
    doc = fitz.open(path)
    return "\n".join([page.get_text() for page in doc])

try:
    text2 = read_docx(doc2)
    with open("docx_content.txt", "w", encoding="utf-8") as f:
        f.write(text2)
    print("DOCX read successfully, length:", len(text2))
except Exception as e:
    print("Error reading DOCX:", e)

try:
    text1 = read_pdf(doc1)
    with open("pdf_content.txt", "w", encoding="utf-8") as f:
        f.write(text1)
    print("PDF read successfully, length:", len(text1))
except Exception as e:
    print("Error reading PDF:", e)
