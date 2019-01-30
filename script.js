'use strict';
const start = document.querySelector('#start');
const input = document.querySelector('#grid-size');
const maxGridSize = 25;

start.addEventListener('click', buildField);

//set grid html and setup fields to empty values, and add Listeners
function buildField() {
  const size = +(input.value <= maxGridSize && input.value > 5
    ? input.value
    : input.value > maxGridSize
      ? maxGridSize
      : input.value);

  let mineSw = new Minesweeper({
    elem: document.querySelector('#solution'),
    size: size,
    maxGridSize: 25,
  });

  mineSw.setup();
}
