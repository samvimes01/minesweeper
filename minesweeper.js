'use strict';

class Minesweeper {
  constructor({ elem, size, maxGridSize }) {
    this._elem = elem;
    this._size = size;
    this._maxGridSize = maxGridSize || 25;
    this._cellsAmount = size * size;
    this._parentSelector = 'minesweeper';


    this._revealCell = this._revealCell.bind(this);
    this._markCell = this._markCell.bind(this);
    this._setMines = this._setMines.bind(this);
    this._changeFlags = this._changeFlags.bind(this);
    this._setCellValue = this._setCellValue.bind(this);
    this._openAdjacentCells = this._openAdjacentCells.bind(this);
    this._checkWin = this._checkWin.bind(this);
    this._getCellIndex = this._getCellIndex.bind(this);
    this._getCellValue = this._getCellValue.bind(this);
    this._getAdjacentCells = this._getAdjacentCells.bind(this);
    this._setGridSize = this._setGridSize.bind(this);
    this._setListeners = this._setListeners.bind(this);
  }

  setup() {
    this._flag = '⥜';
    
    this._cellsArray = new Array(this._cellsAmount).fill(0);
    this._minesAmount = 0;
    this._minesPositions = [];
    this._openedCells = new Set();
    this._leftFlagsCounter = 0;
    this._firstClick = true;
    this._checkedForOpenCells = [];

    this._render();

  }



  // on lb click - if first click - setup imes, check for value and win
  _revealCell(event) {
    const cell = event.target.closest(this._cellSelector);
    if (!cell) {
      return;
    }

    if (this._firstClick) {
      this._setMines(cell);
      this._changeFlags(this._minesAmount);
      this._firstClick = false;
    }

    if (cell.textContent === this._flag) {
      return;
    }
    const value = this._getCellValue(cell);

    if (value === '*') {
      for (const cell of this._field.children) {
        cell.textContent = this._getCellValue(cell) === 0 ? '' : this._getCellValue(cell);
        cell.style.color = '#000';
        this._checkWin(false);
      }
      cell.style.color = 'red';
      return;
    }
    if (value > 0) {
      cell.textContent = value;
      cell.style.color = '#000';
      this._openedCells.add(+cell.dataset.index);
    } else {
      this._openAdjacentCells(cell);
    }
    this._checkWin();
  }

  //check for rb click
  _markCell(event) {
    event.preventDefault();
    const cell = event.target.closest(this._cellSelector);
    if ( !cell || this._firstClick || cell.classList.contains('opened') ) return;

    const value = cell.textContent;
    if (value === '') {
      if (this._leftFlagsCounter === 0) return;
      this._changeFlags('-');
      cell.textContent = this._flag;
      cell.style.color = 'red';
    } else if (value === this._flag) {
      this._changeFlags('+');
      cell.textContent = '';
      cell.style.color = this._cellColor;
    }
  }

  // random setup of mines
  _setMines(cell) {
    // minesAmount 10% from cells count
    this._minesAmount = Math.round(this._cellsAmount * 0.1);
    // this._cellsArray = Array(size * size).fill(0);
    let index = cell.dataset.index;

    let i = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (i === this._minesAmount) break;
      const minePosition = Math.trunc(Math.random() * this._cellsAmount);
      if (!this._minesPositions.includes(minePosition) && minePosition !== index) {
        this._minesPositions.push(minePosition);
        i++;
      }
    }

    this._minesPositions.forEach(mine => this._setCellValue(mine));
  }

  // setup and change flags on mines
  _changeFlags(up) {
    if (up === '+') {
      this._leftFlagsCounter++;
    } else if (up === '-') {
      this._leftFlagsCounter--;
    } else {
      this._leftFlagsCounter = up;
    }
    this._fieldInfo.textContent = `${this._flag}: ${this._leftFlagsCounter}`;
  }

  // for each mine add 1 to adjacent cells
  _setCellValue(minePosition) {
    this._cellsArray[minePosition] = '*';

    const adjCellsInd = this._getAdjacentCells(minePosition);
    for (const i of adjCellsInd) {
      if (this._cellsArray[i] !== '*') {
        this._cellsArray[i] += 1;
      }
    }
  }

  _openAdjacentCells(cell) {
    let value = this._getCellValue(cell);
    if (value !== 0 || cell.classList.contains('opened')) return;
    const index = this._getCellIndex(cell);
    if ( index < 0 || index > this._cellsAmount - 1 || this._checkedForOpenCells.includes(index) ) return;
    cell.classList.add('opened');
    this._openedCells.add(index);
    this._checkedForOpenCells.push(index);

    const adjCellsInd = this._getAdjacentCells(index);
    for (const i of adjCellsInd) {
      const cell = this._field.children[i];
      let adjValue = this._getCellValue(cell);
      if ( adjValue > 0) {
        cell.classList.add('opened');
        this._openedCells.add(this._getCellIndex(cell));
        cell.textContent = adjValue;
        cell.style.color = '#000';
      }
      if (adjValue === 0) {
        this._openAdjacentCells(cell);
      }
    }
  }

  _checkWin(win = true) {
    if (win && this._cellsAmount - this._openedCells.size !== this._minesAmount) {
      return;
    }

    this._field.removeEventListener('click', this._revealCell);
    this._field.removeEventListener('contextmenu', this._markCell);

    if (!win) {
      this._fieldInfo.textContent = 'Booom!!! :-(';
      return;
    }

    this._fieldInfo.textContent = 'You win!!!';
  }

  _getCellIndex(cell) {
    return +cell.dataset.index;
  }

  _getCellValue(cell) {
    return this._cellsArray[this._getCellIndex(cell)];
  }

  _getAdjacentCells(index) {
    let fields = this._cellsAmount;
    const positions = [];

    const hasRight = (index + 1) % this._size !== 0;
    const hasLeft = index % this._size !== 0;
    const hasTop = index - this._size >=0;
    const hasBottom = index + this._size < fields;

    //top cell
    if (hasTop) {
      positions.push(index - this._size);
    }

    //bottom cell
    if (hasBottom) {
      positions.push(index + this._size);
    }

    //right cells
    if (hasRight) {
      positions.push(index + 1);

      if (hasTop) {
        positions.push(index - this._size + 1);
      }

      if (hasBottom) {
        positions.push(index + this._size + 1);
      }
    }

    //left cells
    if (hasLeft) {
      positions.push(index - 1);
      
      if (hasTop) {
        positions.push(index - this._size - 1);
      }

      if (hasBottom) {
        positions.push(index + this._size - 1);
      }
    }
    return positions;
  }

  _render() {
    this._setGridSize(this._size);

    this._elem.innerHTML = `
      <div class="${this._parentSelector}">
        <div class="${this._parentSelector}__field">
        ${this._cellsArray
    .map(
      (item, index) => `
              <span data-index = "${index}" class = "${this._parentSelector}__field-cell"></span>
          `
    )
    .join('')}
        </div>
        <div class="${this._parentSelector}__info">
  
        </div>
      </div>
      `;

    this._setListeners();
  }

  _setGridSize(rows = this._size, cols = this._size) {
    document.documentElement.style.setProperty('--rowNum', rows);
    document.documentElement.style.setProperty('--colNum', cols);
  }

  _setListeners() {
    this._parent = document.querySelector(`.${this._parentSelector}`);
    this._field = document.querySelector(`.${this._parentSelector}__field`);
    this._fieldInfo = document.querySelector(`.${this._parentSelector}__info`);
    this._cellSelector = `.${this._parentSelector}__field-cell`;

    this._htmlStyles = window.getComputedStyle(document.querySelector('html'));
    this._cellColor = this._htmlStyles.getPropertyValue('--cellColor');

    this._field.addEventListener('click', this._revealCell);
    this._field.addEventListener('contextmenu', this._markCell);
  }
}
