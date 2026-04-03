'use client';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { createClientFeature } from '@payloadcms/richtext-lexical/client';
import { $getSelection, $isRangeSelection, COMMAND_PRIORITY_HIGH, PASTE_COMMAND } from 'lexical';
import { useEffect } from 'react';

const CleanPastePlugin = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      PASTE_COMMAND,
      (event: ClipboardEvent | InputEvent | KeyboardEvent) => {
        if (!(event instanceof ClipboardEvent) || !event.clipboardData) return false;

        const plainText = event.clipboardData.getData('text/plain');
        if (!plainText) return false;

        editor.update(() => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) return;
          selection.insertText(plainText.replace(/\r\n/g, '\n'));
        });

        event.preventDefault();
        return true;
      },
      COMMAND_PRIORITY_HIGH,
    );
  }, [editor]);

  return null;
};

export const CleanPasteFeatureClient = createClientFeature({
  plugins: [
    {
      Component: CleanPastePlugin,
      position: 'normal',
    },
  ],
});
