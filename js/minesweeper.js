'use strict'


const MINE = `💣`
const EMPTY = ' '
const MARKED = `🚩`
const EXPLOSION = '💥'

const LIFE = '❤'
const NOLIFE = '♥'
const LIVES = 3;


const SHOWaud = new Audio("audio/pop.flac")
const MARKaud = new Audio("audio/boop.wav")
const DIFFICULTYaud = new Audio("audio/difficulty.wav")


var gLevel = { SIZE: 4, MINES: 2 };
var gGame = { isOn: false, shownCount: 0, markedCount: 0, secsPassed: 0, lives: 3, clickedMines: 0 };
var gBoard;

var gGameIntervalIdx;

function init() {
    console.log('>>--Initializing Minesweeper--<<')
    //console.log('initial level is', gLevel);
    //console.log('Initialized game state is', gGame.isOn)
    gBoard = initializeBoard();
    renderDifficulties('.minesweeper-difficulty');
    printMat(gBoard, `.minesweeper-board`)
    renderTimer('.minesweeper-timer')
}

function initializeBoard() {//Initial Model Generation -- based upon gLevel
    let board = [];
    let selectedDiffIdx = getSelectedDifficulty()
    let diffIdx = (selectedDiffIdx >= 0) ? selectedDiffIdx : 0

    for (let i = 0; i < gDifficulties[diffIdx].SIZE; i++) {
        board.push([])
        for (let j = 0; j < gLevel.SIZE; j++) {
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

function initializeGame() {
    clearInterval(gGameIntervalIdx)
    gGameIntervalIdx = null;
    gGame.isOn = false;
    gGame.markedCount = 0
    gGame.shownCount = 0
    gGame.secsPassed = 0
    gGame.lives = 3
}

///////////////////////////////////////////////////////////////////////////////////////////////////The Juicy part

function cellClicked(elCell, clickEvent) {
    let clickLocation = getCellLocationById(elCell)

    let cell = gBoard[clickLocation.i][clickLocation.j];

    //console.log('ON LMB CLICK -- there are ', gGame.shownCount, 'shown cells out of', ((gLevel.SIZE ** 2) - gLevel.MINES),
    //'cells to mark.\n there are', gLevel.MINES, 'mines on the board,', gGame.markedCount, 'of them are marked');

    if (gGame.isOn) {

        if (clickEvent.button === 0) {//if left-clicking
            if (!cell.isMarked) {
                if (cell.isMine) {///GAME LOST STATE -- left clicked a bomb
                    checkGameLose(clickLocation)
                } else if (cell.minesAroundCount === 0) {
                    showNeighbourCells(clickLocation)
                }
                showCell(clickLocation)
            }
            SHOWaud.cloneNode(true).play()
        }

        else if (clickEvent.button === 2) {//if right-clicking
            markCell(clickLocation)
        }
    } else if (gGame.markedCount === 0 && gGame.shownCount === 0) {//if first click
        startGame(clickLocation)
        if (clickEvent.button === 0) {

            if (cell.minesAroundCount === 0 && !cell.isMine) {
                showNeighbourCells(clickLocation)
                showCell(clickLocation)
                SHOWaud.play()

            } else if (!cell.isMine) {
                //renderCell({ i: i, j: j }, `<span style="color:${getRandomRGB()}; margin:auto; "> ${cell.minesAroundCount}</span>`)//rendering a colorful number
                showCell(clickLocation)
                SHOWaud.play()
            }

        } else if (clickEvent.button === 2) {
            cell.isMarked = true
            gGame.markedCount++;
            elCell.classList.add('marked')
            renderCell(clickLocation, MARKED);
            MARKaud.play()

        }

    }

}

function showNeighbourCells(location) {
    //let cell = gBoard[location.i][location.j]

    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;

            let nextCellI = location.i + i
            let nextCellJ = location.j + j

            //console.log('testing cell i', nextCellI, 'j', nextCellJ, '\nglobal marked count is', gGame.markedCount)

            if (nextCellJ >= 0 && nextCellJ <= gLevel.SIZE - 1 && nextCellI >= 0 && nextCellI <= gLevel.SIZE - 1) {//if next cell is on board
                let nextCell = gBoard[nextCellI][nextCellJ]

                if (!nextCell.isMine && nextCell.minesAroundCount === 0 && !nextCell.isShown && !nextCell.isMarked) {
                    showCell({ i: nextCellI, j: nextCellJ })
                    showNeighbourCells({ i: nextCellI, j: nextCellJ })
                } else {
                    showCell({ i: nextCellI, j: nextCellJ })
                }

            }
        }
    }
}

function showCell(location) {


    let cell = gBoard[location.i][location.j]
    if (!cell.isShown) {
        if (!cell.isMine) {
            gGame.shownCount++;//MODEL
            gBoard[location.i][location.j].isShown = true;
        }
        let elCell = document.getElementById(`${location.i}-${location.j}`)//DOM
        elCell.classList.add('shown')
        renderShownCell(location)

        checkGameWin()
    }


    //console.log('there are', gGame.shownCount, 'cells when showing a cell\n', cell)
}

function renderShownCell(location) {
    let cell = gBoard[location.i][location.j]
    let strHtml = ''
    if (cell.minesAroundCount >= 0 && !cell.isMine) {
        strHtml = `<span style="color:${getRandomRGB()}; margin:auto; "> ${cell.minesAroundCount}</span>`//rendering a colorful number
        //strHtml = `${cell.minesAroundCount}`
    } else if (!cell.isMine) {
        strHtml = 0
    }
    else if (cell.isMine) {
        strHtml = MINE
    } else { strHtml = EXPLOSION }
    //else if (!cell.isMine) {
    //     strHtml = EMPTY
    // } 

    renderCell(location, strHtml)
}

function markCell(location) {
    //console.log('right mouse button clicked on element', elCell, '\n amont of marked cell', gGame.markedCount)
    let elCell = document.getElementById(`${location.i}-${location.j}`)
    let cell = gBoard[location.i][location.j]
    if (!cell.isMarked && !cell.isShown) {
        gGame.markedCount++;
        cell.isMarked = true;
        elCell.classList.add(`marked`);
        renderCell(location, MARKED);
        checkGameWin()
    } else if (!cell.isShown) {
        gGame.markedCount--;
        cell.isMarked = false;
        elCell.classList.remove(`marked`);
        elCell.classList.remove('shown')
        renderCell(location, EMPTY);
    }
    MARKaud.cloneNode(true).play()
}


///////////////////////////////////////////////////////////////////////////////////////////////////

function setMinesNegsCount() {//Neighbor loop
    for (let i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard.length; j++) {
            gBoard[i][j].minesAroundCount = countMinesAround({ i: i, j: j })
        }
    }
}

function countMinesAround(location) { //Neighbor loop
    let count = 0;
    for (let iIter = -1; iIter <= 1; iIter++) {
        for (let jIter = -1; jIter <= 1; jIter++) {
            if (iIter == 0 && jIter == 0) continue;

            let i = iIter + location.i//nextCell location
            let j = jIter + location.j


            if (i >= 0 && i <= gBoard.length - 1 && j >= 0 && j <= gBoard[0].length - 1) {
                if (gBoard[i][j].isMine) count++
            }
        }
    }
    gBoard[location.i][location.j].minesAroundCount = count;
    return count;
}

///////////////////////////////////////////////////////////////////////////////////////////////////

function checkGameWin() {
    let amountToShow = (gLevel.SIZE ** 2) - (gLevel.MINES)
    let amountToMark = (gLevel.MINES - (gGame.clickedMines))
    let allAreShown = (gGame.shownCount === (gLevel.SIZE ** 2))
    //console.log('--ON GAME OVER CHECK--')
    //console.log('There are', gLevel.MINES, 'mines on the board,', gGame.shownCount, 'cell are shown')
    if (allAreShown || (gGame.markedCount === amountToMark && gGame.shownCount === amountToShow)) {//WIN CONDITION CHECK
        gGame.isOn = false
        clearInterval(gGameIntervalIdx);
        gGameIntervalIdx = null;
        renderDifficulties('.minesweeper-difficulty')
        gBoard = initializeBoard()
        return true;
    }
}

function checkGameLose(location) {
    let cell = gBoard[location.i][location.j]
    if (!cell.isShown) { gGame.clickedMines++ }


    if (gGame.lives === 1) {
        gGame.lives = 0
        gGame.isOn = false;
        clearInterval(gGameIntervalIdx);
        gGameIntervalIdx = null;
        revealMines();
        renderCell(location, EXPLOSION)
        renderDifficulties('.minesweeper-difficulty');
        renderTimer('.minesweeper-timer')
        renderLives('.minesweeper-lives')
    } else {
        gGame.lives--
        renderLives('.minesweeper-lives');
    }
}

function startGame(location) { //starts a game with a non-mine cell in the provided location
    gGame.secsPassed = 1
    gGame.lives = 3
    gGame.clickedMines = 0
    gGame.isOn = true;
    placeMines(location);
    //printMat(gBoard,'minesweeper')
    renderDifficulties('.minesweeper-difficulty');
    renderTimer('.minesweeper-timer')//creates timer innerHTML
    renderLives(`.minesweeper-lives`)

    gGameIntervalIdx = setInterval(function () { gGame.secsPassed++; renderTimer('.minesweeper-timer') }, 1000)
}

///////////////////////////////////////////////////////////////////////////////////////////////////

function placeMines(location) {
    for (let i = 0; i < gLevel.MINES; i++) {
        let empty = getRandomEmpty(gBoard, location);
        gBoard[empty.i][empty.j].isMine = true;
        renderCell({ i: empty.i, j: empty.j }, EMPTY);
        setMinesNegsCount(gBoard)
    }
}

function revealMines() {//DOM render on mines
    for (let iIter = 0; iIter < gBoard.length; iIter++) {
        for (let jIter = 0; jIter < gBoard.length; jIter++) {
            if (gBoard[iIter][jIter].isMine === true) {
                gBoard[iIter][jIter].isShown = true
                renderCell({ i: iIter, j: jIter }, MINE)
            }
        }
    }
}

function renderTimer(selector) {
    let hiddenStr = (gGame.isOn) ? 'shown' : 'hidden'
    let elTimer = document.querySelector(`${selector}`)
    let innerHtml = `<div  class="timer ${hiddenStr}">\n <h1><span>${gGame.secsPassed}</span>\n<br> Seconds Passed </h1>`;
    // innerHtml += `<h2> Cells shown <br><span>${gGame.shownCount}<br></span></h2>`
    // innerHtml += `<h3>there are ${gLevel.MINES} mines on the board </h3></div>`

    if (!gGame.isOn) {
        elTimer.classList.remove('shown')
        elTimer.classList.add('hidden')
    } else {
        elTimer.classList.remove('hidden')
        elTimer.classList.add('shown')
    }
    elTimer.innerHTML = innerHtml;
}

///////////////////////////////////////////////////////////////////////////////////////////////////





