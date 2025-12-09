let srtContent = "";

// Regex: bắt cụm từ viết hoa đầu mỗi từ (tiếng Anh + tiếng Việt có dấu)
const CAPITAL_PHRASE_REGEX = /\b((?:\p{Lu}\p{Ll}+)(?:\s+(?:\p{Lu}\p{Ll}+))+)\b/gu;



// Đoạn tiếng Trung cần chèn
async function loadSub(url) {
    try {
        const response = await fetch(url);
        const data = await response.text();
        let sub = data.split(/\r?\n/); // Chia nội dung của file thành các dòng
        return sub
        // Xử lý subCn tại đây
    } catch (error) {
        console.error('Error loading file:', error);
    }
}

// Đoạn tiếng Trung cần chèn
async function loadText(url) {
    try {
        const response = await fetch(url);
        const data = await response.text();
        return data
        // Xử lý subCn tại đây
    } catch (error) {
        console.error('Error loading file:', error);
    }
}

async function displaySub() {
    // Tách các dòng phụ đề tiếng Việt
    // const subCn = await loadSub('/sub_cn.txt');
    const subVn = await loadSub('/56789.txt');

    const subLines = subVn;

// Tìm các vị trí có chứa nội dung phụ đề (không phải là số thứ tự hoặc thời gian)
let newSub = [];
let j = 0;

for (let i = 0; i < subLines.length; i++) {
    // Nếu là số thứ tự hoặc thời gian thì giữ lại
    if (subLines[i].match(/^\d/) || subLines[i].match(/\d{2}:\d{2}:\d{2},\d{3}/)) {
        newSub.push(subLines[i]); // Đẩy dòng số thứ tự và thời gian vào mảng kết quả
    } else if (subLines[i].trim() !== '') {
        // Nếu là dòng nội dung (không phải số thứ tự hoặc thời gian)
        // Chèn tiếng Trung thay cho tiếng Việt
        // newSub.push(subCn[j]); // Thay dòng tiếng Việt bằng dòng tiếng Trung
        j++; // Tăng chỉ số cho phụ đề tiếng Trung
    } else {
        // Đẩy dòng trống vào mảng kết quả nếu có
        newSub.push('');
    }
}

// Gộp các dòng phụ đề lại thành chuỗi
let result = newSub.join('\n');
console.log(result);
}

async function getText() {
    try {
        // Tải nội dung file (giả sử loadSub() trả về nội dung dưới dạng string)
        const subtitleLines = await loadSub('1234567.txt');
        
        // Chia nội dung thành từng dòng

        let textLines = [];
        let tempText = [];

        for (let i = 0; i < subtitleLines.length; i++) {
            let line = subtitleLines[i].trim();

            if (!line) {
                // Nếu gặp dòng trống, kết thúc một đoạn sub và thêm vào danh sách
                if (tempText.length > 0) {
                    textLines.push(tempText.join(' '));
                    tempText = [];
                }
                continue;
            }

            // Bỏ qua số thứ tự
            if (/^\d+$/.test(line)) continue;

            // Bỏ qua timestamp
            if (/^\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3}$/.test(line)) continue;

            // Nếu là nội dung, thêm vào mảng tạm
            tempText.push(line);
        }

        // Xử lý dòng cuối cùng (nếu còn nội dung)
        if (tempText.length > 0) {
            textLines.push(tempText.join(' '));
        }

        document.querySelector('.js-total-all').innerHTML = textLines.length;

        let finalText = textLines.join('\n\n');

        // console.log(finalText); // Kiểm tra kết quả

        return finalText;
    } catch (error) {
        console.error("Lỗi khi tải file:", error);
    }
}



// displaySub()
// getText()

removeLines()

function uploadFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file) {
        alert("Vui lòng chọn một file trước!");
        return;
    }

    const reader = new FileReader();

    reader.onload = function(e) {
        const content = e.target.result;
        document.getElementById("textBox").value = content;
        removeLines();
    }

    reader.readAsText(file, 'UTF-8');
}

document.querySelector('#textBox').addEventListener('change', () => {
    removeLines();
});

async function removeLines() {
    const texts = document.getElementById("textBox").value;
    
    // Loại bỏ dòng trống và các ký tự không mong muốn
    let cleanedText = texts.replace(/(\n\s*\n)+/g, '\n')
        .replace(/[【】"“”‘’[\]\\]/g, "'")
        .replace(/["「」]+/g, "'")
        .replace(/,+$/gm, "")
        .replace(/~/g, '!')
        .replace(/～/g, '!')
        .replace(/(^|[^.])\.(?!\.)$/gm, (match, p1) => p1)
        .replaceAll('v.v', 'vân vân')

    const newTextArray = cleanedText.split('\n').map(line => line.trim());

    const capitalizedWords = capitalizeFirstLetter(newTextArray)
    
    document.getElementById("textBox").value = capitalizedWords.join('\n\n')


    document.querySelector('.js-total-all').innerHTML = capitalizedWords.length;

    // checkLengthText(capitalizedWords)
    checkSynstaxText(capitalizedWords)
    // renderHighlightedList(capitalizedWords)
    // const results = checkNamesByLine(capitalizedWords);
    // renderLineCheckResult(results)

    srtContent = toSRT(capitalizedWords)
    
    // Định dạng lại mảng thành chuỗi JSON
    // const formattedArray = JSON.stringify(newTextArray, null, 2);
    const formattedArray = JSON.stringify(capitalizedWords, null, 2);


    // console.log(typeof newTextArray)
    // console.log(newTextArray.join('\n\n'))
    // Gán giá trị đã định dạng vào textarea
    document.getElementById("userWord").value = formattedArray;
}

function capitalizeFirstLetter(arr) {
    return arr.map(item => {
        let updated = item.replace(/^(['"]?)(\p{L})/u, (_, quote, firstLetter) => {
            return quote + firstLetter.toUpperCase();
        });

        updated = updated.replace(/(\.)(['"])$/, '$2');

        return updated;
    });
}



function splitTextByDot(arr) {
  const result = [];

  arr.forEach(text => {
    // Tìm vị trí dấu chấm thỏa điều kiện
    const match = text.match(/(?<=.{10})\.(?=.{10})/);
    const hasQuote = text.includes("'");
    
    if (match && !hasQuote) {
      const index = match.index;

      // Cắt đoạn trước và sau dấu chấm
      const firstPart = text.slice(0, index).trim(); // không lấy dấu chấm
      const secondPart = text.slice(index + 1).trim(); // sau dấu chấm

      result.push(firstPart);
      result.push(secondPart);
    } else {
      result.push(text.trim()); // nếu không có dấu chấm phù hợp thì giữ nguyên
    }
  });

  return result;
}


function checkLengthText(arr) {
    const filtered = arr.filter(item => {
        const length = item.length;
        const punctuationCount = (item.match(/[,.;!]/g) || []).length;

        return length > 200 || (length > 140 && punctuationCount > 4);
    });
    const result = document.querySelector('.check-text-length');
    const highlighted = filtered.map(item => `<b>${item}</b>`).join('<br><br>');
    const totalEl = document.querySelector('.js-total');
    totalEl.innerHTML = filtered.length
    result.innerHTML = highlighted;
}

function checkSynstaxText(arr) {
    const textError = arr.filter(item => {
        const newItem = item.toLowerCase();
        const regex = /\w+1$/;
        return regex.test(newItem) || newItem.includes('#')
    });
    const result = document.querySelector('.check-syntax-error');
    if (result) {
        const highlighted = textError.map(item => `<b style="font-style: italic; text-decoration: underline;">${item}</b>`).join('<br><br>');
        result.innerHTML = highlighted;
    }
}


function getUserInput() {

    // Assign user input to variable
    var userInput = document.getElementById("userWord").value;
    return userInput;
}

// Copy text in textarea with button click
function copy() {

    if (getUserInput().length > 0) {

        var copyText = document.getElementById("userWord");
        copyText.select();
        copyText.setSelectionRange(0, 99999)
        document.execCommand("copy");

        var x = document.getElementById("snackbar");
        x.className = "show";
        setTimeout(function () { x.className = x.className.replace("show", ""); }, 3000);
    }
    else {
        var x = document.getElementById("snackbarFail");
        x.className = "show";
        setTimeout(function () { x.className = x.className.replace("show", ""); }, 3000);
    }
}

function toSRT(arr) {
    let srt = "";
    let currentTime = 0;

    arr.forEach((item, index) => {
    const length = item.length;
    const punctuationCount = (item.match(/[,.;!]/g) || []).length;

    // xác định duration (giây)
    const duration = length > 500 ? 5 : (length > 200 || (length > 140 && punctuationCount > 4)) ? 3 : 1;

    // thời gian bắt đầu / kết thúc
    const start = currentTime;
    const end = currentTime + duration;
    currentTime = end;

    // format sang kiểu SRT
    srt += `${index + 1}\n`;
    srt += `${formatTime(start)} --> ${formatTime(end)}\n`;
    srt += `${item}\n\n`;
    });

    return srt;
}

function formatTime(seconds) {
    const hrs = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const secs = String(Math.floor(seconds % 60)).padStart(2, "0");
    const ms = "000";
    return `${hrs}:${mins}:${secs},${ms}`;
}

// Tải file .srt
document.getElementById("download").addEventListener("click", () => {
    const blob = new Blob([srtContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "subtitles.srt"; // tên file
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
});


// Lấy danh sách cụm Capitalized Case hợp lệ
function extractCapitalizedPhrases(sentence) {
  const matches = [...sentence.matchAll(CAPITAL_PHRASE_REGEX)];
  const set = new Set(matches.map(m => m[1].trim()));

  // Thêm xử lý từ đơn: chỉ giữ nếu là từ đơn tiếng Anh (ASCII) Capitalized
  const SINGLE_ENGLISH_WORD = /\b[A-Z][a-z]+\b/;

  // Bắt thêm từ đơn tiếng Anh đúng Capitalized (không dấu)
  const singleWordMatches = sentence.match(/\b[A-Z][a-z]+\b/g) || [];
  singleWordMatches.forEach(w => {
    // Loại các từ nằm bên trong cụm lớn đã bắt (tránh trùng lặp)
    const insideMulti = [...set].some(phrase => phrase.includes(w));
    if (!insideMulti && SINGLE_ENGLISH_WORD.test(w)) {
      set.add(w);
    }
  });

  return [...set];
}


// Hiển thị danh sách cụm highlight
function renderHighlightedList(text) {
    const box = document.getElementById("highlightResult");
    if (!box) return;

    const lines = text;
    let phrases = new Set();

    lines.forEach(line => {
        extractCapitalizedPhrases(line).forEach(phrase => {
            phrases.add(phrase);
        });
    });

    if (phrases.size > 0) {
        box.innerHTML = '<ul style="padding: 0;">' + Array.from(phrases).map(p => `<li style="margin: 6px 0;
                padding: 6px;
                background: #f8f9ff;
                border-left: 3px solid #4c6ef5; list-style:none;">${p}</li>`).join("") + "</ul>";
    } else {
        box.innerHTML = "<i>Không có cụm từ Hoa đầu cần highlight.</i>";
    }
}
