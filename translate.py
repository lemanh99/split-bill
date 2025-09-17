import os

import polib
from deep_translator import GoogleTranslator
from deep_translator.constants import GOOGLE_LANGUAGES_TO_CODES

languages = {value for key, value in GOOGLE_LANGUAGES_TO_CODES.items()}
translations_dir = "i18n"
messages_pot = os.path.join(translations_dir, "messages.pot")

if not os.path.exists(messages_pot):
    os.system(f"pybabel extract -F babel.cfg -o {translations_dir}/messages.pot .")


def create_po_files():
    for lang in languages:
        po_file = os.path.join(translations_dir, lang, "LC_MESSAGES", "messages.po")
        if not os.path.exists(po_file):
            os.makedirs(os.path.dirname(po_file), exist_ok=True)
            os.system(f"pybabel init -l {lang} -d {translations_dir} -i {messages_pot}")
            print(f"Created file: {po_file}")


def auto_translate():
    os.system(f"pybabel extract -F babel.cfg -o i18n/messages.pot .")
    for lang in languages:
        po_file = os.path.join(translations_dir, lang, "LC_MESSAGES", "messages.po")

        if not os.path.exists(po_file):
            print(f"Bỏ qua {lang} vì không tìm thấy {po_file}")
            continue

        os.system(f"pybabel update -i i18n/messages.pot -d i18n -l {lang}")
        po = polib.pofile(po_file)
        translator = GoogleTranslator(source="en", target=lang)

        translated = False
        for entry in po:
            if entry.msgid and not entry.msgstr:  # Chỉ dịch nếu chưa có bản dịch
                try:
                    entry.msgstr = translator.translate(entry.msgid)
                    print(f"[{lang}] {entry.msgid} -> {entry.msgstr}")
                    translated = True
                except Exception as e:
                    print(f"Error translate '{entry.msgid}': {e}")

        if translated:
            po.save(po_file)
            print(f"✅ Completed translate for {lang}")


if __name__ == "__main__":
    create_po_files()
    auto_translate()

    # Compile file .mo
    os.system(f"pybabel compile -d {translations_dir}")
    print("🎉 Compile  file .mo successfully!")
