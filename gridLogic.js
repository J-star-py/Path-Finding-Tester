let startAndEndSet = 0b00;
let colorStateMap = {0b00:"rgb(90 240 180)",0b01:"rgb(250 80 150)",0b10:"rgb(90 240 180)",0b11:"rgb(70 70 85)"}
let colorToDraw = "white";
let stateSettingMap = {0b00:0b01,0b01:0b10,0b10:0b01,0b11:0b11}
let endIndex;
let startIndex;

let squaresStatesArray = new Uint8Array(Math.ceil(((squareColumns-2)*squareRows)/4))

function recreateSquaresStates(columns,rows) {
  squaresStatesArray = new Uint8Array(Math.ceil(((columns-2)*rows)/4));
  //console.log(columns, rows, (columns*rows)/2, squaresStatesArray);
};

function squareStateManager(squareClicked) {
  const index = Math.floor(squareClicked/4);
  const stateQuad = squaresStatesArray[index];
  const squareState = (stateQuad & (0b11 << (2*(squareClicked%4)))) >> (2*(squareClicked%4));

  //console.log(index, stateQuad.toString(2), squareState.toString(2))

  let newState = 0b00;
  if (squareState===0b00){
    if (startAndEndSet === 0b00 || startAndEndSet === 0b10) {startIndex = squareClicked}
    if (startAndEndSet === 0b01) {endIndex = squareClicked}
    newState = stateSettingMap[startAndEndSet];
    colorToDraw = colorStateMap[startAndEndSet];
    startAndEndSet |= stateSettingMap[startAndEndSet];
  } else {
    if (squareState !== 0b11){
      startAndEndSet &= stateSettingMap[squareState]
    }
    colorToDraw = "white";
  }
  newState = newState << (2*(squareClicked%4));
  otherState = stateQuad & ~(0b11 << (2*(squareClicked%4)))

  squaresStatesArray[index] = newState | otherState;

  //console.log(startAndEndSet.toString(2));
}
