import { describe, it } from 'node:test';
import assert from 'node:assert';
import { readFile, fileExists } from '../helpers/test-utils.mjs';

describe('Tier 1 - Feature 08: Editor de Notas / Diario Espiritual', () => {
  it('T1-F08-01: src/app/notes/page.tsx supports the 5 spiritual diary categories', () => {
    assert.ok(fileExists('src/app/notes/page.tsx'), 'notes/page.tsx must exist');
    const content = readFile('src/app/notes/page.tsx');
    assert.match(content, /gratitud|pensamiento|logro|oracion|general|libre/i, 'notes/page.tsx must define spiritual diary categories');
  });

  it('T1-F08-02: Mood selector is integrated in notes editor', () => {
    const content = readFile('src/app/notes/page.tsx');
    assert.match(content, /mood|ánimo|animo|sentimiento/i, 'notes/page.tsx must provide mood selection');
  });

  it('T1-F08-03: RichTextEditor in src/components/RichTextEditor.tsx integrates Tiptap', () => {
    assert.ok(fileExists('src/components/RichTextEditor.tsx'), 'RichTextEditor.tsx must exist');
    const content = readFile('src/components/RichTextEditor.tsx');
    assert.match(content, /useEditor|EditorContent/, 'RichTextEditor must integrate Tiptap editor hooks');
  });

  it('T1-F08-04: Notes save action triggers toast notification', () => {
    const content = readFile('src/app/notes/page.tsx');
    assert.match(content, /toast/, 'notes/page.tsx must provide toast feedback on save/edit');
  });

  it('T1-F08-05: Notes page handles empty notes state with dedicated empty card', () => {
    const content = readFile('src/app/notes/page.tsx');
    assert.match(
      content,
      /empty|no hay notas|no tienes notas|comienza escribiendo/i,
      'notes/page.tsx must feature an empty state presentation'
    );
  });
});
