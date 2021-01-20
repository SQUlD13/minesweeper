'use strict';
console.log('--Util initializing--');

///////////////////////////////////////////////////////////////////////////////////////////////////Matrix rendering

function printMatrix(mat, selector) {//create InnerHTML at 'selector-'container for given mat
    var strHTML = `<table border="0" oncontextmenu="return false"><tbody>`;
    for (var i = 0; i < mat.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < mat[0].length; j++) {
            var display = EMPTY;
            /////////////////////////////////////////////class properties
            var className = `cell`;
            if (mat[i][j].isMarked) {
                className += ` marked`;
                display = MARKED;
            }
            /////////////////////////////////////////////data properties - position
            let dataString = `id="${i}-${j}"`
            /////////////////////////////////////////////
            strHTML += `<td><button onclick="cellClicked(this,event)" oncontextmenu="cellClicked(this,event)" class="${className}" ${dataString}> <span>${display}</span> </button></td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>';
    var elContainer = document.querySelector(selector);
    elContainer.innerHTML = strHTML;
}

function renderCell(location, value) { //receives ({i:i,j:j}, innerHTML ) and sets the value on the DOM level
    // Select the elCell and set the innerText value
    let elCell = document.getElementById(`${location.i}-${location.j}`)
    elCell.innerHTML = value;
}

///////////////////////////////////////////////////////////////////////////////////////////////////Calculations & Formations

function getRandomEmpty(board) {//returns a random position in board based on entered bool, where the bool defines the empty
    let displayPositions = [];
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[0].length; j++) {
            if (!board[i][j].isMine) {
                displayPositions.push({ i: i, j: j })
            };
        }
    }

    let rndIdx = getRandomInt(0, displayPositions.length);
    let location = displayPositions.splice(rndIdx, 1)[0];
    console.log('Finding random empty position', location)
    return location;
}

function getRandomRGB() {
    let r = getRandomInt(0, 255);
    let g = getRandomInt(0, 255);
    let b = getRandomInt(0, 255);
    return `rgb(${r},${g},${b})`;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}
function formatTime(time) {
    if (time > 0 && time < Infinity) {
        let minute = time.getMinutes();
        let second = time.getSeconds();
        if (second < 10) second = '0' + second;
        let mlSecond = time.getMilliseconds();
        if (mlSecond < 100) mlSecond = '0' + mlSecond;
        if (mlSecond < 10) mlSecond = '0' + mlSecond;
        let str = minute + ':' + second + ':' + mlSecond;
        return str;
    } return '0:00:000';
}