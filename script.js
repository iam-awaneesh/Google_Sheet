const headerElement = document.getElementById("header");
const snoElement = document.getElementById("srn");
const bodyCellElement = document.getElementById("body-cell");

let columns = 26, rows = 50;

//adding the heading in table
for(let i = 1; i <= 26; i++){
    const element = document.createElement("div");
    element.className = "header-cell";
    element.innerText = String.fromCharCode(64 + i);

    headerElement.appendChild(element);
}

//adding the sr no in table
for(let i = 1; i <= rows; i++){
    const srnCell = document.createElement("div");
    srnCell.className = "srn-cell";
    srnCell.innerText = i;

    snoElement.appendChild(srnCell);
}

//adding cell in the table
for(let i = 1; i <= rows; i++){
    const rowElement = document.createElement("div");
    rowElement.className = "row";

    for(let j = 1; j <= columns; j++){
        const colElement = document.createElement("div");
        colElement.className = "col";
        //give id to this ele like "A1" "A2"
        colElement.id = `${String.fromCharCode(64 + j)}${i}`;
        colElement.contentEditable = true;

        //add eventListener
        colElement.addEventListener("focus", onFocusCall);
        colElement.addEventListener("input", onChangeFormText);
        rowElement.appendChild(colElement);
    }

    bodyCellElement.appendChild(rowElement);
}


