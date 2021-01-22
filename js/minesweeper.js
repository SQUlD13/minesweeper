'use strict'


const MINE = `*`
const EMPTY = '-'
const MARKED = `🚩`
const EXPLOSION = 'X'
const LIFE = '❤'



var gLevel = { SIZE: 4, MINES: 2 };
var gBoard;
var gGame = { isOn: false, shownCount: 0, markedCount: 0, secsPassed: 0 };
var gGameIntervalIdx;

function init() {
    renderDifficulties('.minesweeper-difficulty');

    console.log('--Initializing Minesweeper--')
    //gLevel.SIZE = DIFFICULTIES[gSelectedDifficulty].SIZE
    //gLevel.MINES = DIFFICULTIES[gSelectedDifficulty].MINES
    console.log('initial level is', gLevel);

    //gLevel.SIZE = gDifficulties[getSelectedDifficulty(gDifficulties)].SIZE
    //gLevel.MINES = gDifficulties[getSelectedDifficulty(gDifficulties)].MINES


    gBoard = initializeBoard();
    printMat(gBoard, `.minesweeper-board`)
    renderTimer('minesweeper')
    console.log('Initialized game state is', gGame.isOn)
}

function startGame(location) { //starts a game with a non-mine cell in the provided location
    gGame.secsPassed = 1
    gGame.isOn = true;
    placeMines(location);
    renderDifficulties('.minesweeper-difficulty');
    renderTimer('minesweeper')//creates timer innerHTML
    gGameIntervalIdx = setInterval(function () { gGame.secsPassed++; renderTimer('minesweeper') }, 1000)
}

function placeMines(location) {
    for (let i = 0; i < gLevel.MINES; i++) {
        let empty = getRandomEmpty(gBoard, location);
        gBoard[empty.i][empty.j].isMine = true;
        renderCell({ i: empty.i, j: empty.j }, EMPTY);
        setMinesNegsCount(gBoard)
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////The Juicy part

function cellClicked(elCell, clickEvent) {
    let id = elCell.getAttribute('id')

    let i = parseInt(id.substring(0, 1))
    let j = parseInt(id.substring(2))
    let clickLocation = { i: i, j: j }

    let cell = gBoard[i][j];

    //console.log('on click cell is', cell, 'on board', gBoard);

    if (gGame.isOn) {

        if (clickEvent.button === 0) {//if left-clicking
            if (!cell.isMarked) {

                showCell(clickLocation)
                if (cell.minesAroundCount === 0 && !cell.isMine) {

                    let zeroedNeighbours = findZeroedNeighbours(clickLocation)
                    console.log('zeroed neighbours are', zeroedNeighbours, 'for cell', clickLocation)
                    showNeighbourCells({ i: i, j: j })


                }

                //console.log('ON LMB CLICK -- there are ', gGame.shownCount, 'shown cells out of', ((gLevel.SIZE ** 2) - gLevel.MINES),
                //    'cells to mark.\n there are', gLevel.MINES, 'mines on the board,', gGame.markedCount, 'of them are marked');
            }


            if (!cell.isMine) {//////////////////////if clicked cell isn't marked, and is not a bomb, render a colorful number inside of it, add a shown class
            } else {///GAME LOST -- left clicked a bomb
                gGame.isOn = false;
                clearInterval(gGameIntervalIdx);
                gGameIntervalIdx = null;
                console.log('--GAME LOST--\n--CLICKED ON BOMB--')
                //gGame.shownCount = 0;//MODEL
                gBoard[i][j].isShown = true;
                revealMines(i, j);
                renderCell(clickLocation, EXPLOSION)
                renderDifficulties('.minesweeper-difficulty');
            }
            //elCell.classList.add('shown')
            //cell.isShown = true;
            //elCll.classList.add(`marked`);//DOM
        }


        ///////////////////////////////////////////////////////////////////////////////////////////////////

        else if (clickEvent.button === 2) {//if right-clicking
            console.log('right mouse button clicked on element', elCell, '\n amont of marked cell', gGame.markedCount)
            if (!cell.isMarked && !cell.isShown) {
                gGame.markedCount++;
                cell.isMarked = true;//toggle cell marking
                elCell.classList.add(`marked`);
                renderCell(clickLocation, MARKED);
                //renderModal('minesweeper', i, j);
                console.log('--display cell information--')
                checkGameOver();
            } else if (!cell.isShown) {
                gGame.markedCount--;
                cell.isMarked = false;//toggle cell marking
                elCell.classList.remove(`marked`);
                elCell.classList.remove('shown')
                renderCell(clickLocation, EMPTY);
                console.log('--unkmark cell information--')
            }
        }
    } else if (gGame.markedCount === 0 && gGame.shownCount === 0) {//if first click
        startGame(clickLocation)
        if (clickEvent.button === 0) {

            if (cell.minesAroundCount === 0 && !cell.isMine) {
                showNeighbourCells({ i: i, j: j })
                showCell({ i: i, j: j })

            } else if (!cell.isMine) {
                //renderCell({ i: i, j: j }, `<span style="color:${getRandomRGB()}; margin:auto; "> ${cell.minesAroundCount}</span>`)//rendering a colorful number
                showCell({ i: i, j: j })

            }

        } else if (clickEvent.button === 2) {
            cell.isMarked = true
            gGame.markedCount++;
            elCell.classList.add('marked')
            renderCell({ i: i, j: j }, MARKED);
        }

    }

}



function findZeroedNeighbours(location) {// a neighbour loop to find empty locations near the provided cell location
    let neighboursWhoAreZero = []
    //debugger
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            let nextCellLocation = { i: location.i + i, j: location.j + j }

            if (nextCellLocation.i >= 0 && nextCellLocation.i <= gLevel.SIZE - 1 && nextCellLocation.j >= 0 && nextCellLocation.j <= gLevel.SIZE - 1) {

                let nextCell = gBoard[nextCellLocation.i][nextCellLocation.j]
                if (nextCell.minesAroundCount === 0) {
                    console.log('returning cell', nextCellLocation)
                    return neighboursWhoAreZero.push(nextCellLocation);
                } else return findZeroedNeighbours(nextCellLocation)
            }
        }
    }
    return neighboursWhoAreZero;
}

function showNeighbourCells(location) {

    let cell = gBoard[location.i][location.j]
    //let elCell = document.getElementById(`${location.i}-${location.j}`)
    //console.log('on cell', cell, 'location is', location);
    //debugger
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;

            let nextCellI = location.i + i
            let nextCellJ = location.j + j

            //console.log('testing cell i', nextCellI, 'j', nextCellJ, '\nglobal marked count is', gGame.markedCount)

            if (nextCellJ >= 0 && nextCellJ <= gLevel.SIZE - 1 && nextCellI >= 0 && nextCellI <= gLevel.SIZE - 1) {//if next cell is on board
                let nextCell = gBoard[nextCellI][nextCellJ]

                showCell({ i: nextCellI, j: nextCellJ })
            }
        }
    }
}

function showCell(location) {
    //debugger
    let cell = gBoard[location.i][location.j]
    if (!cell.isShown) {

        gGame.shownCount++;//MODEL
        gBoard[location.i][location.j].isShown = true;

        let elCell = document.getElementById(`${location.i}-${location.j}`)//DOM
        elCell.classList.add('shown')
        renderShownCell(location)

        checkGameOver()

    }
    //console.log('there are', gGame.shownCount, 'cells when showing a cell\n', cell)
}

function renderShownCell(location) {
    //debugger
    let cell = gBoard[location.i][location.j]
    let strHtml = ''
    if (cell.minesAroundCount >= 0 && !cell.isMine) {
        //strHtml = `<span style="color:${getRandomRGB()}; margin:auto; "> ${cell.minesAroundCount}</span>`//rendering a colorful number
        strHtml = `${cell.minesAroundCount}`
    } else { strHtml = EXPLOSION }
    //else if (!cell.isMine) {
    //     strHtml = EMPTY
    // } 

    renderCell(location, strHtml)
}

///////////////////////////////////////////////////////////////////////////////////////////////////

function setMinesNegsCount(board) {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board.length; j++) {
            board[i][j].minesAroundCount = countMinesAround(board, { i: i, j: j })
        }
    }
}

function countMinesAround(board, location) { //Neighbor loop
    let count = 0;
    for (let iIter = -1; iIter <= 1; iIter++) {
        for (let jIter = -1; jIter <= 1; jIter++) {
            if (iIter == 0 && jIter == 0) continue;

            let i = iIter + location.i//nextCell location
            let j = jIter + location.j


            if (i >= 0 && i <= board.length - 1 && j >= 0 && j <= board[0].length - 1) {
                if (board[i][j].isMine) count++
            }
        }
    }
    board[location.i][location.j].minesAroundCount = count;
    return count;
}

///////////////////////////////////////////////////////////////////////////////////////////////////

function checkGameOver() {
    let amountToMark = ((gLevel.SIZE ** 2) - gLevel.MINES)
    console.log('--ON GAME OVER CHECK--')
    console.log('There are', gLevel.MINES, 'mines on the board,', gGame.markedCount, 'cell are marked')
    if ((gGame.markedCount === gLevel.MINES && (gGame.shownCount === amountToMark))) {//WIN CONDITION CHECK
        console.log('Win condition met!')
        gGame.isOn = false
        renderDifficulties('.minesweeper-difficulty')
        gGame.won = true;
        clearInterval(gGameIntervalIdx);
        gGameIntervalIdx = null;
        gBoard = initializeBoard()
        return true;
    }
}

function initializeBoard() {//Initial Model Generation -- based upon gLevel
    let board = [];
    let selectedDiffIdx = getSelectedDifficulty()
    let diffIdx = (selectedDiffIdx >= 0) ? selectedDiffIdx : 0

    //debugger
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

///////////////////////////////////////////////////////////////////////////////////////////////////rendering dom functions

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
    let hiddenStr = (gGame.isOn) ? '' : 'hidden'
    let elTimer = document.querySelector(`.${selector}-timer`)
    let innerHtml = `<div ${hiddenStr} class="timer">\n <h1><span>${gGame.secsPassed}</span>\n<br> Seconds Passed \n</h1>\n<h2> Cells shown <br><span>${gGame.shownCount}<br></span></h2> <h3>there are ${gLevel.MINES} mines on the board </div>`;
    elTimer.innerHTML = innerHtml;
}

///////////////////////////////////////////////////////////////////////////////////////////////////





