import CodeMirror from "codemirror";
import Clipboard from "clipboard/dist/clipboard.min";

// Modes
import 'codemirror/mode/css/css';
import 'codemirror/mode/clike/clike';
import 'codemirror/mode/diff/diff';
import 'codemirror/mode/go/go';
import 'codemirror/mode/htmlmixed/htmlmixed';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/markdown/markdown';
import 'codemirror/mode/nginx/nginx';
import 'codemirror/mode/php/php';
import 'codemirror/mode/powershell/powershell';
import 'codemirror/mode/python/python';
import 'codemirror/mode/ruby/ruby';
import 'codemirror/mode/shell/shell';
import 'codemirror/mode/sql/sql';
import 'codemirror/mode/toml/toml';
import 'codemirror/mode/xml/xml';
import 'codemirror/mode/yaml/yaml';

// Addons
import 'codemirror/addon/scroll/scrollpastend';

const modeMap = {
    css: 'css',
    c: 'text/x-csrc',
    java: 'text/x-java',
    scala: 'text/x-scala',
    kotlin: 'text/x-kotlin',
    'c++': 'text/x-c++src',
    'c#': 'text/x-csharp',
    csharp: 'text/x-csharp',
    diff: 'diff',
    go: 'go',
    html: 'htmlmixed',
    javascript: 'javascript',
    json: {name: 'javascript', json: true},
    js: 'javascript',
    php: 'php',
    md: 'markdown',
    mdown: 'markdown',
    markdown: 'markdown',
    nginx: 'nginx',
    powershell: 'powershell',
    py: 'python',
    python: 'python',
    ruby: 'ruby',
    rb: 'ruby',
    shell: 'shell',
    sh: 'shell',
    bash: 'shell',
    toml: 'toml',
    sql: 'text/x-sql',
    xml: 'xml',
    yaml: 'yaml',
    yml: 'yaml',
};

/**
 * Highlight pre elements on a page
 */
function highlight() {
    let codeBlocks = document.querySelectorAll('.page-content pre, .comment-box .content pre');
    for (let i = 0; i < codeBlocks.length; i++) {
        highlightElem(codeBlocks[i]);
    }
}

/**
 * Add code highlighting to a single element.
 * @param {HTMLElement} elem
 */
function highlightElem(elem) {
    let innerCodeElem = elem.querySelector('code[class^=language-]');
    let mode = '';
    if (innerCodeElem !== null) {
        let langName = innerCodeElem.className.replace('language-', '');
        mode = getMode(langName);
    }
    elem.innerHTML = elem.innerHTML.replace(/<br\s*[\/]?>/gi ,'\n');
    let content = elem.textContent.trim();

    let cm = CodeMirror(function(elt) {
        elem.parentNode.replaceChild(elt, elem);
    }, {
        value: content,
        mode:  mode,
        lineNumbers: true,
        theme: getTheme(),
        readOnly: true
    });

    addCopyIcon(cm);
}

/**
 * Add a button to a CodeMirror instance which copies the contents to the clipboard upon click.
 * @param cmInstance
 */
function addCopyIcon(cmInstance) {
    const copyIcon = `<svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h24v24H0z" fill="none"/><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>`;
    const copyButton = document.createElement('div');
    copyButton.classList.add('CodeMirror-copy');
    copyButton.innerHTML = copyIcon;
    cmInstance.display.wrapper.appendChild(copyButton);

    const clipboard = new Clipboard(copyButton, {
        text: function(trigger) {
            return cmInstance.getValue()
        }
    });

    clipboard.on('success', event => {
        copyButton.classList.add('success');
        setTimeout(() => {
            copyButton.classList.remove('success');
        }, 240);
    });
}

/**
 * Search for a codemirror code based off a user suggestion
 * @param suggestion
 * @returns {string}
 */
function getMode(suggestion) {
    suggestion = suggestion.trim().replace(/^\./g, '').toLowerCase();
    return (typeof modeMap[suggestion] !== 'undefined') ? modeMap[suggestion] : '';
}

/**
 * Ge the theme to use for CodeMirror instances.
 * @returns {*|string}
 */
function getTheme() {
    return window.codeTheme || 'base16-light';
}

/**
 * Create a CodeMirror instance for showing inside the WYSIWYG editor.
 *  Manages a textarea element to hold code content.
 * @param {HTMLElement} elem
 * @returns {{wrap: Element, editor: *}}
 */
function wysiwygView(elem) {
    let doc = elem.ownerDocument;
    let codeElem = elem.querySelector('code');

    let lang = (elem.className || '').replace('language-', '');
    if (lang === '' && codeElem) {
        lang = (codeElem.className || '').replace('language-', '')
    }

    elem.innerHTML = elem.innerHTML.replace(/<br\s*[\/]?>/gi ,'\n');
    let content = elem.textContent;
    let newWrap = doc.createElement('div');
    let newTextArea = doc.createElement('textarea');

    newWrap.className = 'CodeMirrorContainer';
    newWrap.setAttribute('data-lang', lang);
    newWrap.setAttribute('dir', 'ltr');
    newTextArea.style.display = 'none';
    elem.parentNode.replaceChild(newWrap, elem);

    newWrap.appendChild(newTextArea);
    newWrap.contentEditable = false;
    newTextArea.textContent = content;

    let cm = CodeMirror(function(elt) {
        newWrap.appendChild(elt);
    }, {
        value: content,
        mode:  getMode(lang),
        lineNumbers: true,
        theme: getTheme(),
        readOnly: true
    });
    setTimeout(() => {
        cm.refresh();
    }, 300);
    return {wrap: newWrap, editor: cm};
}

/**
 * Create a CodeMirror instance to show in the WYSIWYG pop-up editor
 * @param {HTMLElement} elem
 * @param {String} modeSuggestion
 * @returns {*}
 */
function popupEditor(elem, modeSuggestion) {
    let content = elem.textContent;

    return CodeMirror(function(elt) {
        elem.parentNode.insertBefore(elt, elem);
        elem.style.display = 'none';
    }, {
        value: content,
        mode:  getMode(modeSuggestion),
        lineNumbers: true,
        theme: getTheme(),
        lineWrapping: true
    });
}

/**
 * Set the mode of a codemirror instance.
 * @param cmInstance
 * @param modeSuggestion
 */
function setMode(cmInstance, modeSuggestion) {
      cmInstance.setOption('mode', getMode(modeSuggestion));
}

/**
 * Set the content of a cm instance.
 * @param cmInstance
 * @param codeContent
 */
function setContent(cmInstance, codeContent) {
    cmInstance.setValue(codeContent);
    setTimeout(() => {
        cmInstance.refresh();
    }, 10);
}

/**
 * Get a CodeMirror instace to use for the markdown editor.
 * @param {HTMLElement} elem
 * @returns {*}
 */
function markdownEditor(elem) {
    let content = elem.textContent;

    return CodeMirror(function (elt) {
        elem.parentNode.insertBefore(elt, elem);
        elem.style.display = 'none';
    }, {
        value: content,
        mode: "markdown",
        lineNumbers: true,
        theme: getTheme(),
        lineWrapping: true,
        scrollPastEnd: true,
    });
}

/**
 * Get the 'meta' key dependant on the user's system.
 * @returns {string}
 */
function getMetaKey() {
    let mac = CodeMirror.keyMap["default"] == CodeMirror.keyMap.macDefault;
    return mac ? "Cmd" : "Ctrl";
}

export default {
    highlight: highlight,
    wysiwygView: wysiwygView,
    popupEditor: popupEditor,
    setMode: setMode,
    setContent: setContent,
    markdownEditor: markdownEditor,
    getMetaKey: getMetaKey,
};