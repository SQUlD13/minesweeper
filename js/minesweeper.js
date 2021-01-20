'use strict'


const MINE = '💣'
const EMPTY = ' '
const MARKED = '🚩'
const EXPLOSION = '💥'
//const levels = [{name:'Easy',size:4,mines:2,selected:true}, {name:'Medium',size:8,mines:12,selected:false},{name:'Expert',size:12,mines:30,selected:false}];


var gLevel = { SIZE: 4, MINES: 3 }; //X Is mine, 0 is not mine.
var gBoard;
var gGame = { isOn: false, shownCount: 0, markedCount: 0, secsPassed: 0 };
var gGameIntervalIdx;



function init() {
    console.log('--Initializing Minesweeper--')
    gBoard = initializeBoard(gLevel.SIZE);
    console.table(gBoard);
    printMatrix(gBoard, `.minesweeper-board`)
    placeMines(gBoard, gLevel.MINES);
    renderTimer('minesweeper')//creates timer innerHTML
    console.log(gGame.isOn)
}


function placeMines(board, amount) {
    for (let i = 0; i < amount; i++) {
        let location = getRandomEmpty(board);
        board[location.i][location.j].isMine = true;
        renderCell({ i: location.i, j: location.j }, EMPTY);
        //locations.push(location);
        setMinesNegsCount(board)
    }
}


function countMinesAround(board, location) { //Neighbor loop
    let count = 0;
    for (let iIter = -1; iIter <= 1; iIter++) {
        for (let jIter = -1; jIter <= 1; jIter++) {
            if (iIter == 0 && jIter == 0) continue;

            let i = iIter + location.i//nextCell location
            let j = jIter + location.j
            //console.log('on interation i:', i + ' j :' + j);

            if (i >= 0 && i <= board.length - 1 && j >= 0 && j <= board[0].length - 1) {
                if (board[i][j].isMine) count++
                //console.log(i + ' ' + j, 'cell , count is', count);
            }
        }
    }
    //console.log('Counting empty seats around ', location.i, ' ', location.j, ' returning ', count)
    board[location.i][location.j].minesAroundCount = count;
    return count;
}

///////////////////////////////////////////////////////////////////////////////////////////////////

function cellClicked(elCell, clickEvent) {
    let id = elCell.getAttribute('id');
    let i = id.substring(0, 1);
    let j = id.substring(2)
    //let location = {i:i,j:j}

    console.log('i is', i, 'j is', j)
    let cell = gBoard[i][j];
    //console.log('on click cell is', cell, 'on board', gBoard);
    if (!gGame.isOn) {
        startGame();
    }
    if (clickEvent.button === 0) {
        if (!cell.isMarked) {
            if (!cell.isMine) {//////////////////////if clicked cell isn't marked, and is not a bomb, renderr a colorful number inside of it
                console.log('Left mouse button clicked on element', elCell, 'at location', i + ' ' + j)
                renderCell({ i: i, j: j }, `<span style="color:${getRandomRGB()}; margin:auto; "> ${cell.minesAroundCount}</span>`)
                gGame.shownCount++;//MODEL
                console.log('there are ', gGame.shownCount, 'marked cells out of', ((gLevel.SIZE ** 2) - gLevel.MINES), 'cells to mark.\n there are', gLevel.MINES, 'mines on the board');
                elCell.classList.add(`marked`);//DOM
                elCell.classList.add('shown')
                //console.table(gBoard)
                checkGameOver();
            } else {///////////////////////////////////////////////////////////////////////////////////////////////////GAME LOST
                gGame.isOn = false;
                clearInterval(gGameIntervalIdx);
                gGameIntervalIdx = null;
                //TO DO : ADD WIN OR LOSS SCREEN
                renderCell({ i: i, j: j }, EXPLOSION)
                console.log('--GAME LOST--\m--CLICKED ON BOMB--')
                revealMines(i, j);
            }
        }
    }
    if (clickEvent.button === 2) {
        console.log('right mouse button clicked on element', elCell, 'at location', i + ' ' + j)
        if (!cell.isMarked) {
            gGame.markedCount++;
            cell.isMarked = true;//toggle cell marking
            elCell.classList.add(`marked`);
            renderCell({ i: i, j: j }, MARKED);
            //renderModal('minesweeper', i, j);
            console.log('--display cell information--')
            checkGameOver();
        } else {
            gGame.markedCount--;
            cell.isMarked = false;//toggle cell marking
            elCell.classList.remove(`marked`);
            renderCell({ i: i, j: j }, EMPTY);
            //renderModal('minesweeper', i, j);
            console.log('--unkmark cell information--')
        }
    }

}

function startGame() {
    gGame.isOn = true;
    gGameIntervalIdx = setInterval(function () { gGame.secsPassed++; renderTimer('minesweeper') }, 1000)
    renderTimer('minesweeper');
}

function checkGameOver() {
    if (gGame.markedCount === gLevel.MINES && (gGame.shownCount === ((gLevel.SIZE ** 2) - gLevel.MINES))) {//WIN CONDITION CHECK
        console.log('--GAME WON--');
        gGame.isOn = false;
        clearInterval(gGameIntervalIdx);
        gGameIntervalIdx = null;
        //TO DO : ADD WIN OR LOSS SCREEN
    }
}

function revealMines(i, j) {
    for (let iIter = 0; iIter < gBoard.length; iIter++) {
        for (let jIter = 0; jIter < gBoard.length; jIter++) {
            if (gBoard[iIter][jIter].isMine === true && i !== iIter && j !== jIter) {
                renderCell({ i: iIter, j: jIter }, MINE)
            }
        }
    }
}

function initializeBoard(Length) {//Initial Model Generation
    let board = [];
    for (let i = 0; i < Length; i++) {
        board.push([])
        for (let j = 0; j < Length; j++) {
            board[i][j] = {
                isShown: false,
                isMine: false,
                isMarked: false,
                minesAroundCount: 0
            }
        }
    }
    return board;

}

function setMinesNegsCount(board) {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board.length; j++) {
            board[i][j].minesAroundCount = countMinesAround(board, { i: i, j: j })
        }
    }
}

function renderTimer(selector) {
    let elTimer = document.querySelector(`.${selector}-timer`)
    let innerHtml = `<div class="timer">\n <span>${gGame.secsPassed}</span>\n<br> Seconds Passed \n</div>`;
    elTimer.innerHTML = innerHtml;
}


function renderDifficulty(selector) {
    //elCell == document.getElementById(`${i}-${j}`)
    if (selector === 'minesweeper') {
        let strHtml = `<div class=".${selector}-difficulty" >  </div>`;
        let elModal = document.querySelector(`.${selector}-difficulty`)
        elModal.innerHTML = strHtml;
    }

}






















