let squares = new Uint8Array(5000);

const canvas = document.getElementById("gridCanvas");
const interfaceDiv = document.getElementById("interfaceDiv");
const buttonsPanelDiv = document.getElementById("buttonsPanel");
const input = document.getElementById("gridSizeSlider");
const inputText = document.getElementById("inputText");
const playButton = document.getElementById("playButton");
let squareColumns = 31;
input.value = squareColumns;
inputText.innerText = "Columns: "+(squareColumns-2);
let squareRows;
let squareSize;
let horizontalShift;
let verticalShift;

canvas.height = interfaceDiv.clientHeight;
canvas.width = Math.ceil(interfaceDiv.clientWidth - buttonsPanelDiv.clientWidth);
input.style.width = canvas.width;


let ctx = null;

if (canvas.getContext) {
  ctx = canvas.getContext("2d");
}


if (ctx) {

  squareSize = Math.floor(((canvas.clientWidth-50) / squareColumns) - ((squareColumns/180)));
  squareRows = Math.round((canvas.clientHeight-60) / (squareSize + 1) - 1);
  if (!(squareRows%2)){squareRows++}
  horizontalShift = Math.round((canvas.clientWidth - ((squareSize+1) * (squareColumns-2))) / 2);
  verticalShift = Math.round(((canvas.clientHeight - ((squareSize+1) * (squareRows)))-1) / 2);

  function drawGrid(squareColumns, obstacles=false) {

    ctx.fillStyle = "white"
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for (let row = 0; row < squareRows; row++) {
      for (let col = 0; col < squareColumns-2; col++) {
        ctx.fillRect((horizontalShift)+(col * (squareSize+1)), (verticalShift)+(row * (squareSize+1)), squareSize,squareSize)
      }
    }

    console.log(squareSize, squareRows, squareColumns, horizontalShift, verticalShift)
  }
  drawGrid(squareColumns)

  document.getElementById("clearButton").addEventListener("click",()=>{
    playOn = false;
    recreateSquaresStates(squareColumns,squareRows)
    drawGrid(squareColumns)
    startAndEndSet = 0b00;

    let playImage = document.getElementById("playImage");
    playImage.src = "Play Image.png"

  })
  playButton.addEventListener("click", async ()=>{
    let playImage = document.getElementById("playImage");
    if (!playOn) {
      playImage.src = "Stop Image.png"
      playOn = true;
    } else {
      playImage.src = "Play Image.png"
      recreateSquaresStates(squareColumns,squareRows);
      drawGrid(squareColumns);
      startAndEndSet = 0b00;
      playOn = false;
    }

    
    
    if (startAndEndSet === 0b11) {aStarAlgorithm(startIndex, endIndex, squareColumns-2, squareRows)}
  })
  document.getElementById("speedButton").addEventListener("click", async ()=>{
    speed = {1:0.4,0.4:0,0:1}[speed];
    document.getElementById("speedText").innerText = "X"+{1:"2",0.4:"4",0:"8"}[speed]
  })

  input.addEventListener("input", (event) => {
    squareColumns = event.target.value;
    inputText.innerText = "Columns: "+(squareColumns-2);
    squareSize = Math.floor(((canvas.clientWidth-50) / squareColumns) - ((squareColumns/180)));
    squareRows = Math.round((canvas.clientHeight-60) / (squareSize + 1) - 1);
    if (!(squareRows%2)){squareRows++}


    horizontalShift = Math.round((canvas.clientWidth - ((squareSize+1) * (squareColumns-2))) / 2);
    verticalShift = Math.round(((canvas.clientHeight - ((squareSize+1) * (squareRows)))-1) / 2);

    ctx.clearRect(0,0,canvas.width,canvas.height);
    drawGrid(squareColumns);
    recreateSquaresStates(squareColumns,squareRows);
    startAndEndSet = 0b00;
  });

  const canvasCoordinates = canvas.getBoundingClientRect();
  
  let isMouseDown = false;
  let isDrawing = false;
  let previousSquareClicked = null;
  let lastDrawTime = 0;


  function handleCanvasMouseClickedEvent(event) {
    const nowTime = Date.now()
    let x = event.clientX - canvasCoordinates.left;
    let y = event.clientY - canvasCoordinates.top;

    let squareClickedX = Math.floor((x - horizontalShift) / (squareSize+1));
    let squareClickedY = Math.floor((y - verticalShift) / (squareSize+1));

    const squareClicked = (squareClickedX + (squareClickedY*(squareColumns-2)))
    if (((squareClicked !== previousSquareClicked)) || nowTime - lastDrawTime > 600) {
      if ((squareClickedX < 0 || squareClickedY < 0) || (squareClickedX > squareColumns-3 || squareClickedY > squareRows-1)) {return};

      //console.log(squareClickedX, squareClickedY);
      squareStateManager(squareClicked)
      
      ctx.fillStyle = colorToDraw//"rgb(180 220 255)"
      ctx.clearRect(horizontalShift+(squareClickedX*(squareSize+1))-1,verticalShift+(squareClickedY*(squareSize+1))-1,squareSize+2,squareSize+2)
      ctx.fillRect(horizontalShift+(squareClickedX*(squareSize+1)),verticalShift+(squareClickedY*(squareSize+1)),squareSize,squareSize)

      previousSquareClicked = squareClicked;
      lastDrawTime = nowTime;
    }
  }


  canvas.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    isMouseDown = true;
    handleCanvasMouseClickedEvent(e)
  }, { passive: false });
  window.addEventListener("pointerup", (e) => {
    isMouseDown = false;
  });

  canvas.addEventListener("pointermove", (event) => {
    event.preventDefault();
    if (isMouseDown && !isDrawing) {
      isDrawing = true;
      requestAnimationFrame(() => {
        handleCanvasMouseClickedEvent(event)
        isDrawing = false;
      });
    }
  }, { passive: false })
}


