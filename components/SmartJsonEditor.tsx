import React, { useCallback, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { CheckCircle2, AlertTriangle, XCircle, Wand2 } from 'lucide-react';

interface SmartJsonEditorProps {
    value: string;
    onChange: (value: string) => void;
    onValidChange?: (isValid: boolean) => void;
}

export const SmartJsonEditor: React.FC<SmartJsonEditorProps> = ({ value, onChange, onValidChange }) => {
    const [status, setStatus] = useState<'valid' | 'invalid' | 'fixed' | 'empty'>('empty');
    const [message, setMessage] = useState<string>('');

    // --- SELF-HEALING LOGIC ---
    const smartFixJSON = useCallback((input: string): { fixed: string; wasFixed: boolean; error?: string } => {
        if (!input.trim()) return { fixed: input, wasFixed: false };

        let fixed = input;
        let wasFixed = false;

        // 1. Replace Smart Quotes (Common from Notes/Web)
        if (/[\u201C\u201D\u2018\u2019]/.test(fixed)) {
            fixed = fixed.replace(/[\u201C\u201D]/g, '"').replace(/[\u2018\u2019]/g, "'");
            wasFixed = true;
        }

        // 2. Remove Trailing Commas (Common manual edit error)
        // Regex looks for comma followed by closing brace/bracket, ignoring whitespace
        if (/,\s*([\]}])/.test(fixed)) {
            fixed = fixed.replace(/,\s*([\]}])/g, '$1');
            wasFixed = true;
        }

        // 3. Remove Invisible Characters (Zero-width space, etc.)
        // \u200B is zero-width space
        if (/[\u200B-\u200D\uFEFF]/.test(fixed)) {
            fixed = fixed.replace(/[\u200B-\u200D\uFEFF]/g, '');
            wasFixed = true;
        }

        // 4. Strip Markdown Code Blocks (```json ... ```)
        if (fixed.includes('```')) {
            fixed = fixed
                .replace(/^```json\s*/g, '')
                .replace(/^```\s*/g, '')
                .replace(/\s*```$/g, '')
                .replace(/\s*```\s*$/g, ''); // Robust trailing check
            wasFixed = true;
        }

        // 5. Fix Unquoted Keys (e.g. { key: "value" } -> { "key": "value" })
        // Use a simple regex that targets standard identifiers at the start of object props
        if (/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g.test(fixed)) {
            fixed = fixed.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
            wasFixed = true;
        }

        // 6. Fix Missing Commas between items (e.g. "A" "B" -> "A", "B")
        // Target: ending quote/number/bool/null, newline/space, starting quote/brace/bracket
        // This is aggressive but solves the user's specific copy-paste issue
        const missingCommaRegex = /(")\s*(\n\s*)(")/g;
        if (missingCommaRegex.test(fixed)) {
            fixed = fixed.replace(missingCommaRegex, '$1,$2$3');
            wasFixed = true;
        }

        // 4. Try to Parse and format
        try {
            // Attempt parse
            const data = JSON.parse(fixed);
            // If parse success, re-stringify to format cleanly (Prettify)
            fixed = JSON.stringify(data, null, 2);
            return { fixed, wasFixed: wasFixed || (fixed !== input) }; // If formatted changed string, count as fixed
        } catch (e: any) {
            return { fixed, wasFixed, error: e.message };
        }
    }, []);

    const handleChange = useCallback((val: string) => {
        onChange(val);

        if (!val.trim()) {
            setStatus('empty');
            setMessage('');
            onValidChange?.(false);
            return;
        }

        try {
            JSON.parse(val);
            setStatus('valid');
            setMessage('JSON ถูกต้อง (Valid)');
            onValidChange?.(true);
        } catch (e) {
            setStatus('invalid');
            setMessage('รูปแบบยังไม่ถูกต้อง'); // We don't fix on every keystroke, too intrusive
            onValidChange?.(false);
        }
    }, [onChange, onValidChange]);

    const handlePaste = useCallback((event: React.ClipboardEvent) => {
        // We let the paste happen, but then we intercept the NEW value via OnChange wrapper or
        // actually better to intercept content here if possible. 
        // CodeMirror handlePaste is different. 
        // For simplicity in this wrapper, let's just use a button or effect?
        // Actually, easiest is to detect "big changes" or just run fix on the incoming string if it fails parse.
        // Let's rely on the user pasting -> onChange triggers -> we check if invalid.
        // BUT user asked for "Auto-Correction" on paste.

        // We can manually get text, fix it, and call onChange.
        event.preventDefault();
        const text = event.clipboardData.getData('text/plain');
        const { fixed, wasFixed, error } = smartFixJSON(text);

        onChange(fixed);

        if (!error) {
            if (wasFixed) {
                setStatus('fixed');
                setMessage('ระบบซ่อมแซมและจัดระเบียบ Code ให้แล้วอัตโนมัติ ✨');
            } else {
                setStatus('valid');
                setMessage('JSON ถูกต้อง (Valid)');
            }
            onValidChange?.(true);
        } else {
            setStatus('invalid');
            setMessage(`ซ่อมแซมไม่ได้: ${error}`);
            onValidChange?.(false);
        }

    }, [onChange, smartFixJSON, onValidChange]);

    // Theme Config (Minimalist Light) is handled by the component prop


    return (
        <div className="flex flex-col h-full border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900 shadow-sm transition-all focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500/50">
            {/* Toolbar / Status Bar */}
            <div className={`px-4 py-2 text-xs font-medium flex justify-between items-center border-b border-gray-100 dark:border-zinc-800
                ${status === 'valid' ? 'bg-green-50 text-green-700' :
                    status === 'fixed' ? 'bg-blue-50 text-blue-700' :
                        status === 'invalid' ? 'bg-red-50 text-red-700' :
                            'bg-gray-50 text-gray-500'
                } transition-colors duration-300`}>
                <div className="flex items-center gap-2">
                    {status === 'valid' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {status === 'fixed' && <Wand2 className="w-3.5 h-3.5" />}
                    {status === 'invalid' && <XCircle className="w-3.5 h-3.5" />}
                    {status === 'empty' && <AlertTriangle className="w-3.5 h-3.5 opacity-50" />}
                    <span>{message || 'รอรับ JSON...'}</span>
                </div>
                {/* Manual Format Button (if needed) */}
                <div className="opacity-50">Smart Editor</div>
            </div>

            <div className="flex-1 overflow-auto text-sm font-mono custom-scrollbar" onPaste={handlePaste}>
                <CodeMirror
                    value={value}
                    height="100%"
                    extensions={[json()]}
                    onChange={(val) => handleChange(val)}
                    basicSetup={{
                        lineNumbers: true,
                        foldGutter: true,
                        highlightActiveLine: false,
                        autocompletion: true,
                    }}
                    className="h-full"
                    theme="light" // Explicitly light for Notion vibe
                />
            </div>
        </div>
    );
};
