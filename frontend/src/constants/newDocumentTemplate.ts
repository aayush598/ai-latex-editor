// src/constants/newDocumentTemplate.ts

export const NEW_DOCUMENT_TEMPLATE = `\\documentclass{article}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath}

\\title{New Document}
\\author{Your Name}
\\date{\\today}

\\begin{document}
\\maketitle

\\section{Introduction}
Start writing your document here...

\\end{document}`;


export const DEFAULT_APP_TEMPLATE = `\\documentclass{article}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath}
\\usepackage{amsfonts}
\\usepackage{amssymb}

\\title{Your Document Title}
\\author{Your Name}
\\date{\\today}

\\begin{document}

\\maketitle

\\section{Introduction}

Write your introduction here.

\\section{Main Content}

Your main content goes here. You can use mathematical formulas like $E = mc^2$ inline, or display equations:

\\begin{equation}
    \\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
\\end{equation}

\\section{Conclusion}

Conclude your document here.

\\end{document}`;
