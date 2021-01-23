'use strict';
console.log('--Util initializing--');

///////////////////////////////////////////////////////////////////////////////////////////////////Matrix rendering

function printMat(mat, selector) {//create InnerHTML at 'selector-'container for given mat
    let selectedDifficultyIdx = getSelectedDifficulty()
    //let hiddenStr = (selectedDifficultyIdx < 0) ? 'hidden' : ''
    var strHTML = `<table class="board" border="0" oncontextmenu="return false"><tbody>`;
    for (var i = 0; i < mat.length; i++) {
        // if (i = 0) {
        //     strHTML += '<th>';
        // } else {
        //     strHTML += '<tr>';
        // }
        strHTML += '<tr>';
        for (var j = 0; j < mat[0].length; j++) {
            var display = EMPTY;
            /////////////////////////////////////////////class properties
            var className = `cell`;
            if (mat[i][j].isMarked) {
                className += ` marked`;
                display = MARKED;
            } if (mat[i][j].isShown) {
                className += ' shown'

            }
            /////////////////////////////////////////////data properties - position
            let dataString = `id="${i}-${j}"`
            /////////////////////////////////////////////

            strHTML += `<td onclick="cellClicked(this,event)" oncontextmenu="cellClicked(this,event)" class="${className}" ${dataString}> <span>${display}</span></td>`

        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>';
    var elContainer = document.querySelector(selector);
    renderLives('.minesweeper-lives')

    elContainer.innerHTML = strHTML;

}

function renderCell(location, value) { //receives ({i:i,j:j}, innerHTML ) and sets the value on the DOM level
    // Select the elCell and set the innerText value
    let elCell = document.getElementById(`${location.i}-${location.j}`)
    elCell.innerHTML = value;
}

function creatLivesHTML() {
    let strHtml = '';
    for (let i = 3; i > 0; i--) {
        if (i <= gGame.lives) {
            strHtml += `<div class="lives life"> ${LIFE} </div>`
        } else strHtml += `<div class="lives nolife"> ${NOLIFE} </div>`
    }
    //strHtml += `</div>`
    return strHtml;
}

function renderLives(selector) {
    let elLives = document.querySelector(`${selector}`);
    elLives.innerHTML = creatLivesHTML();

    if (!gGame.isOn) {
        elLives.classList.remove('shown')
        elLives.classList.add('hidden')
    } else {
        elLives.classList.remove('hidden')
        elLives.classList.add('shown')
    }
}

function getCellLocationById(cellElement) {
    let id = cellElement.getAttribute('id')

    let i = parseInt(id.substring(0, 1))
    let j = parseInt(id.substring(2))
    return { i: i, j: j }
}

///////////////////////////////////////////////////////////////////////////////////////////////////Calculations & Formations
//returns a random position in board based on entered bool, where the bool defines the empty
//if provided with a location, doesn't return that location no matter what
function getRandomEmpty(board, location) {
    let displayPositions = [];
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[0].length; j++) {
            if (!board[i][j].isMine && i !== location.i && j !== location.j) {
                displayPositions.push({ i: i, j: j })
            };
        }
    }

    let rndIdx = getRandomInt(0, displayPositions.length);
    let emptyLocation = displayPositions.splice(rndIdx, 1)[0];
    console.log('Finding random empty position', emptyLocation)
    return emptyLocation;
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