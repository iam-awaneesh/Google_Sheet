let activeCellId = null;
const activeCellElement = document.getElementById("selected-cell");

const form = document.querySelector(".form");

let state = {};

form.addEventListener("change", onChangeFormData);

const defaultStyle = {
    fontFamily : "poppins-regular",
    fontSize : 16,
    isBold : false,
    isItalic : false,
    isUnderline : false,
    align : "left",
    textColor : "black",
    bgColor : "#ffffff",
    text : ""
};

function onChangeFormText(event){
    const changedText = event.target.innerText;

    if(state[activeCellId]){
        state[activeCellId].text = changedText;
    }else{
        //store in map
        state[activeCellId] = { ...defaultStyle, text: event.target.innerText};
    }
}

function onChangeFormData(){
    let option = {
        fontFamily : form["fontFamily"].value,
        fontSize : form["fontSize"].value,
        isBold : form.isBold.checked,
        isItalic : form.isItalic.checked,
        isUnderline : form.isUnderline.checked,
        align : form.align.value,
        textColor : form["textColor"].value,
        bgColor : form["bgColor"].value
    };
    applyStyle(option);
}

function applyStyle(style){
    if(!activeCellId){
        form.reset();
        alert("Please Select a Cell to Apply!");
        return;
    }

    //change the style
    const activeCell = document.getElementById(activeCellId);

    activeCell.style.fontFamily = style.fontFamily;
    activeCell.style.fontSize = style.fontSize + "px";
    activeCell.style.fontWeight = style.isBold ? 600 : 400;
    activeCell.style.fontStyle = style.isItalic ? "italic" : "normal";
    activeCell.style.textDecoration = style.isUnderline ? "underline" : "none";
    activeCell.style.textAlign = style.align;
    activeCell.style.color = style.textColor;
    activeCell.style.backgroundColor = style.bgColor;

    //store the this style of cell in map state
    state[activeCellId] = style;
}

function onFocusCall(event){
    //if i am again focus same cell then do nothing
    if(activeCellId === event.target.id) return;

    activeCellId = event.target.id;
    activeCellElement.innerText = activeCellId;

    //we focus on the cell. Now if cell already visited then gave his style otherwise give default style
    if(state[activeCellId]){
        //if this id present in map means it is visited
        restoreStyle(state[activeCellId]);
    }else{
        restoreStyle(defaultStyle);
    }
}
//restore the form style with current cells style
function restoreStyle(styles){
    form.fontSize.value = styles.fontSize;
    form.fontFamily.value = styles.fontFamily;
    form.isBold.checked = styles.isBold;
    form.isItalic.checked = styles.isItalic;
    form.isUnderline.checked = styles.isUnderline;
    form.align.value = styles.align;
    form.textColor.value = styles.textColor;
    form.bgColor.value = styles.bgColor;
};

function exportData(){
    let json = JSON.stringify(state);

    const blob = new Blob([json], {type:"text/plain"});
    
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "temp.json";
    link.click();
};


//formula bar
const formulaBar = document.getElementById("formula-cell");
formulaBar.addEventListener("change", saveText);

function saveText(event){
    let content = event.target.value;

    if(containsNumber(content)){
        let res = calculate(content).toString();
        document.getElementById(activeCellId).innerHTML += res;
        if(state[activeCellId]){
            state[activeCellId].text.value = state[activeCellId].text.value + content;
        }else{
            state[activeCellId] = { ...defaultStyle, text: content};
        }
    }
    else{
        document.getElementById(activeCellId).innerHTML += content;

        if(state[activeCellId]){
            state[activeCellId].text.value = state[activeCellId].text.value + content;
        }else{
            state[activeCellId] = { ...defaultStyle, text: content};
    }
    }
    
}

function containsNumber(str) {
    // Use a regular expression to check for the presence of a number
    const regex = /\d/;
    return regex.test(str);
}

let calculate = function(s) {
    let stack = [];

    // Default values
    let num = 0;
    let result = 0;
    let sign = 1;

    for (let i = 0; i < s.length; i++) {
        let ch = s.charAt(i);

        if (/\d/.test(ch)) {
            num = num * 10 + parseInt(ch);
        } else if (ch === '+') {
            result += sign * num;
            num = 0;
            sign = 1;
        } else if (ch === '-') {
            result += sign * num;
            num = 0;
            sign = -1;
        } else if (ch === '*') {
            // Handle multiplication
            let nextNum = 0;
            i++; // Move to the next character after '*'
            while (i < s.length && /\d/.test(s.charAt(i))) {
                nextNum = nextNum * 10 + parseInt(s.charAt(i));
                i++;
            }
            i--; // Adjust the index since it will be incremented in the loop

            num *= nextNum;
        } else if (ch === '/') {
            // Handle division
            let nextNum = 0;
            i++; // Move to the next character after '/'
            while (i < s.length && /\d/.test(s.charAt(i))) {
                nextNum = nextNum * 10 + parseInt(s.charAt(i));
                i++;
            }
            i--; // Adjust the index since it will be incremented in the loop

            num = Math.floor(num / nextNum);
        } else if (ch === '(') {
            // Push the result and sign to the stack
            // Reset the values
            stack.push(result);
            stack.push(sign);
            sign = 1;
            result = 0;
        } else if (ch === ')') {
            // Calculate the current parenthesis
            result += sign * num;
            num = 0;

            // Perform operation on the previous calculated parenthesis and the new one
            result *= stack.pop();
            result += stack.pop();
        }
    }

    if (num !== 0) result += sign * num;

    return result;
};



