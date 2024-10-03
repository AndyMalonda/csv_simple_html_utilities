let inputFileName = '';

//#region Event Listeners

document.getElementById('csvForm').addEventListener('submit', handleFormSubmit);
document.getElementById('csvFile').addEventListener('change', handleFileUpload);
document.getElementById('clearButton').addEventListener('click', clearForm);
document.getElementById('copyButton').addEventListener('click', copyContent);
document.getElementById('downloadButton').addEventListener('click', downloadFormattedOutput);

//#endregion

//#region Event Handlers

function handleFormSubmit(e) {
    e.preventDefault();
    const csvText = document.getElementById('csvText').value;
    let separator = document.getElementById('separator').value;
    const customSeparator = document.getElementById('customSeparator').value;
    const headerRow = document.getElementById('headerRow').checked;
    const quoteChar = document.getElementById('quoteChar').value;
    const escapeChar = document.getElementById('escapeChar').value;
    const outputFormat = document.querySelector('input[name="outputFormat"]:checked').value;

    // If a custom separator is provided, use it instead of the preset separator
    if (customSeparator) {
        separator = customSeparator;
    }

    if (csvText.trim() === '') {
        alert('Please provide CSV text or upload a file.');
        return;
    }

    const rows = parseCSV(csvText, separator, quoteChar, escapeChar);

    switch (outputFormat) {
        case 'json':
            const jsonArray = formatCSVToJSON(rows, headerRow);
            displayJSON(jsonArray);
            break;
        case 'xml':
            const xmlString = formatCSVToXML(rows, headerRow);
            displayXML(xmlString);
            break;
        case 'markdown':
            const markdownString = formatCSVToMarkdown(rows, headerRow);
            displayMarkdown(markdownString);
            break;
        default:
            const table = formatCSVToHTMLTable(rows);
            insertHTMLTable(table);
            break;
    }
}

function handleFileUpload(e) {
    const file = e.target.files[0];
    if (file) {
        inputFileName = file.name.split('.').slice(0, -1).join('.');
        const reader = new FileReader();
        reader.onload = (event) => {
            document.getElementById('csvText').value = event.target.result;
        };
        reader.readAsText(file);
    }
}

function clearForm() {
    document.getElementById('csvText').value = '';
    document.getElementById('outputContainer').innerHTML = '';
    inputFileName = '';
}

function copyContent() {
    const outputContainer = document.getElementById('outputContainer');
    const content = outputContainer.textContent;
    if (content) {
        navigator.clipboard.writeText(content).then(() => {
            alert('Content copied to clipboard.');
        }).catch((error) => {
            alert('Failed to copy content to clipboard.');
        });
    }
}

function downloadFormattedOutput() {
    const csvText = document.getElementById('csvText').value;
    let separator = document.getElementById('separator').value;
    const customSeparator = document.getElementById('customSeparator').value;
    const headerRow = document.getElementById('headerRow').checked;
    const quoteChar = document.getElementById('quoteChar').value;
    const escapeChar = document.getElementById('escapeChar').value;
    const outputFormat = document.querySelector('input[name="outputFormat"]:checked').value;

    if (csvText.trim() === '') {
        alert('Please provide CSV text to download.');
        return;
    }

    if (customSeparator) {
        separator = customSeparator;
    }

    const rows = parseCSV(csvText, separator, quoteChar, escapeChar);

    let fileName = inputFileName ? `${inputFileName}_formatted` : 'formatted';
    function downloadFile(content, fileName, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    switch (outputFormat) {
        case 'json':
            const jsonArray = formatCSVToJSON(rows, headerRow);
            const jsonString = JSON.stringify(jsonArray, null, 2);
            downloadFile(jsonString, `${fileName}.json`, 'application/json');
            break;
        case 'xml':
            const xmlString = formatCSVToXML(rows, headerRow);
            downloadFile(xmlString, `${fileName}.xml`, 'application/xml');
            break;
        case 'markdown':
            const markdownString = formatCSVToMarkdown(rows, headerRow);
            downloadFile(markdownString, `${fileName}.md`, 'text/markdown');
            break;
        default:
            downloadFile(csvText, `${fileName}.csv`, 'text/csv');
            break;
    }
}

//#endregion

//#region Format Output

function formatCSVToHTMLTable(rows) {
    let table = '<table class="table table-bordered">';
    rows.forEach(row => {
        table += '<tr>';
        row.forEach(cell => {
            table += `<td>${cell}</td>`;
        });
        table += '</tr>';
    });
    table += '</table>';
    return table;
}

function insertHTMLTable(table) {
    const outputContainer = document.getElementById('outputContainer');
    outputContainer.innerHTML = table;
}

function formatCSVToJSON(rows, headerRow) {
    const jsonArray = [];
    let headers = [];

    if (headerRow) {
        headers = rows[0];
        rows.shift();
    } else {
        headers = rows[0].map((_, index) => `column${index + 1}`);
    }

    rows.forEach(row => {
        const rowObject = {};
        row.forEach((cell, index) => {
            rowObject[headers[index]] = cell;
        });
        jsonArray.push(rowObject);
    });

    return jsonArray;
}

function displayJSON(jsonArray) {
    const jsonString = JSON.stringify(jsonArray, null, 2);
    const pre = document.createElement('pre');
    pre.textContent = jsonString;
    const outputContainer = document.getElementById('outputContainer');
    outputContainer.innerHTML = '';
    outputContainer.appendChild(pre);
}

function formatCSVToXML(rows, headerRow) {
    let xmlString = '<?xml version="1.0" encoding="UTF-8"?>\n<rows>\n';
    let headers = [];

    if (headerRow) {
        headers = rows[0];
        rows.shift();
    } else {
        headers = rows[0].map((_, index) => `column${index + 1}`);
    }

    rows.forEach(row => {
        xmlString += '  <row>\n';
        row.forEach((cell, index) => {
            xmlString += `    <${headers[index]}>${cell}</${headers[index]}>\n`;
        });
        xmlString += '  </row>\n';
    });

    xmlString += '</rows>';
    return xmlString;
}

function displayXML(xmlString) {
    const pre = document.createElement('pre');
    pre.textContent = xmlString;
    const outputContainer = document.getElementById('outputContainer');
    outputContainer.innerHTML = '';
    outputContainer.appendChild(pre);
}

function formatCSVToMarkdown(rows, headerRow) {
    let markdownString = '';
    let headers = [];

    if (headerRow) {
        headers = rows[0];
        rows.shift();
        markdownString += `| ${headers.join(' | ')} |\n`;
        markdownString += `| ${headers.map(() => '---').join(' | ')} |\n`;
    }

    rows.forEach(row => {
        markdownString += `| ${row.join(' | ')} |\n`;
    });

    return markdownString;
}

function displayMarkdown(markdownString) {
    const pre = document.createElement('pre');
    pre.textContent = markdownString;
    const outputContainer = document.getElementById('outputContainer');
    outputContainer.innerHTML = '';
    outputContainer.appendChild(pre);
}

//#endregion

//#region Parse CSV

function parseCSV(csvText, separator, quoteChar, escapeChar) {
    const rows = [];
    let row = [];
    let cell = '';
    let inQuotes = false;

    for (let i = 0; i < csvText.length; i++) {
        const char = csvText[i];
        const nextChar = csvText[i + 1];

        if (char === quoteChar) {
            if (inQuotes && nextChar === quoteChar) {
                cell += quoteChar;
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === separator && !inQuotes) {
            row.push(cell);
            cell = '';
        } else if ((char === '\n' || char === '\r') && !inQuotes) {
            if (cell || row.length > 0) {
                row.push(cell);
                rows.push(row);
                row = [];
                cell = '';
            }
            if (char === '\r' && nextChar === '\n') {
                i++;
            }
        } else {
            cell += char;
        }
    }

    if (cell || row.length > 0) {
        row.push(cell);
        rows.push(row);
    }

    return rows;
}

//#endregion