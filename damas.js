var Damas = function(){

	var c = document.getElementById("canvasDamas");
	var debugField = document.getElementById("checkDebug");
	var ctx=c.getContext("2d");

	//Settings
	this.size = [400,400];
	this.divisions = 8;
	
	var boardSize;
	var boardDivisions;
	var boardOffset;

	var colorCheckerDark = "#655f5d";
	var colorCheckerLight = "#fbf7eb";

	var pieces = [];
	var grid = [];

	var selectedPiece;
	var selectedPieceTargets = [];
	var pieceEatingTargets = [];

	var debug = false;

	var currentPlayer = 1; //1-branco 2-preto
	var currentPlayerPieces = [];
	var lastInterval = 0;

	var gameFinished = false;
	var gameWinner = -1; //1 para player1 e 2 para player2

	this.Init = function(){
		boardSize = this.size;
		boardDivisions = this.divisions;
		boardOffset = new Array((c.width - boardSize[0])/2,(c.height - boardSize[1])/2);
		//Armazena no grid as celulas pretas / livres para movimentação
		var x,y = -1;
		for (var counter = 0; counter < boardDivisions*boardDivisions; counter++ ){
			y = counter%boardDivisions==0? y + 1 : y;
			x = counter%boardDivisions;

			//seta valido para células pretas
			var valid = y%2==0? (counter%2==0? false : true) : (counter%2==0? true : false);
			grid.push(new cell(x,y,boardSize[0]/boardDivisions,boardSize[1]/boardDivisions,valid));

			if (y < 3 && valid){
				//adiciona as peças brancas nas 3 primeiras linhas
				pieces.push(new Piece(x,y,1))
			} else if (y >= boardDivisions - 3 && valid ){
				//adiciona as peças pretas nas 3 últimas linhas
				pieces.push(new Piece(x,y,2))
			}
		}

		Draw();
	}

	var Piece = function(x,y,player){
		this.x = x;
		this.y = y;
		this.left = x * boardSize[0]/boardDivisions + boardOffset[0];
		this.top = y * boardSize[1]/boardDivisions + boardOffset[1];
		this.player = player;
		this.isSelected = false;
		this.isDama = false;
		var color1 = player == 1 ? "gray" : "black";
		var color2 = player == 1 ? "white" : "333333";

		this.Drag = function(mouseX,mouseY){
			//this.left = mouseX * boardSize[0]/boardDivisions + boardSize[0]/boardDivisions/2;
			//this.top = mouseY * boardSize[1]/boardDivisions + boardSize[1]/boardDivisions/2;
			this.left = mouseX - boardSize[0]/boardDivisions/2 ;
			this.top = mouseY - boardSize[1]/boardDivisions/2 ;

		}

		this.Set = function(x,y){
			this.x = x;
			this.y = y;
			this.left = x * boardSize[0]/boardDivisions + boardOffset[0];
			this.top = y * boardSize[1]/boardDivisions + boardOffset[1];
			if (!this.isDama) this.isDama = player == 1 && y == boardDivisions - 1 || player == 2 && y == 0;
		}

		this.Draw = function(){
			ctx.beginPath();

		    if (this.isSelected){ //sombra distante se tiver selecionado
				ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
		      	ctx.shadowBlur = 6;
				ctx.shadowOffsetX = 8;
				ctx.shadowOffsetY = 10;
			} else {
				ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
		      	ctx.shadowBlur = 2;
				ctx.shadowOffsetX = 3;
				ctx.shadowOffsetY = 3;
			}
			
			var left = this.left + boardSize[0]/boardDivisions/2;
			var top = this.top+ boardSize[1]/boardDivisions/2;
			var grd = ctx.createLinearGradient(left,top,left+30,top+20);
			if (player == 1 ){
				grd.addColorStop(1,"dadad3");
				grd.addColorStop(0,"84685c");
			} else {
				grd.addColorStop(1,"dadad3");
				grd.addColorStop(0,"100c09");
			}
			ctx.fillStyle = grd;

			var damaSize = this.isDama ? 3 : 0;
			ctx.arc(this.left + boardSize[0]/boardDivisions/2,this.top+ boardSize[1]/boardDivisions/2,19+damaSize,0,2*Math.PI,false);
			ctx.fill();

			//remover sombra
	      	ctx.shadowBlur = 0;
			ctx.shadowOffsetX = 0;
			ctx.shadowOffsetY = 0;

			ctx.beginPath();
			ctx.arc(this.left + boardSize[0]/boardDivisions/2,this.top+ boardSize[1]/boardDivisions/2,16+damaSize,0,2*Math.PI,false);
		    //ctx.fillStyle = color2;
			var left = this.left + boardSize[0]/boardDivisions/2;
			var top = this.top+ boardSize[1]/boardDivisions/2;
			var grd = ctx.createLinearGradient(left,top,left+20,top+20);
			if (player ==1){
				grd.addColorStop(0,"dadad3");
				grd.addColorStop(1,"84685c");
			} else {
				grd.addColorStop(0,"40403e");
				grd.addColorStop(1,"100c09");

			} ctx.fillStyle = grd;

			ctx.fill();	

			if (this.isSelected == true){
				ctx.beginPath();
				ctx.arc(this.left + boardSize[0]/boardDivisions/2,this.top+ boardSize[1]/boardDivisions/2,16,0,2*Math.PI,false);
			    ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
				ctx.fill();	
			}

			if (this.player == currentPlayer){
				ctx.beginPath();
				ctx.arc(this.left + boardSize[0]/boardDivisions/2,this.top+ boardSize[1]/boardDivisions/2,12,0,2*Math.PI,false);
				if (this.isDama) ctx.arc(this.left + boardSize[0]/boardDivisions/2,this.top+ boardSize[1]/boardDivisions/2,16,0,2*Math.PI,false);
			    ctx.strokeStyle = 'rgba(140, 140, 140, 0.3)';
			    ctx.lineWidth = 2;
				ctx.stroke();	
			}

		}
	}
	
	var cell = function(x,y,width,height,valid){
		this.x = x;
		this.y = y;
		this.left = x * width + boardOffset[0];
		this.top = y * height  + boardOffset[1];
		this.width = width;
		this.height = height;
		this.valid = valid;
		var color = valid ? colorCheckerDark : colorCheckerLight;
		this.Draw = function(){
			ctx.fillStyle = color;
			ctx.fillRect(x*(boardSize[0]/boardDivisions) + boardOffset[0],y*(boardSize[1]/boardDivisions)  + boardOffset[1],boardSize[0]/boardDivisions,boardSize[1]/boardDivisions);
			ctx.fillStyle = "gray"
			if (this.canEat) ctx.fillStyle = 'yellow';
			if (debug){
				ctx.font="9px Arial";	
				ctx.textAlign = "left";
				ctx.fillText(x+"|"+y+" "+this.valid,x*(boardSize[0]/boardDivisions)+4 + boardOffset[0],y*(boardSize[1]/boardDivisions)+14 +boardOffset[1]);
			} 
		} 		
	}

	var GetGridCellFromMouse = function(mouseX,mouseY){
		var ret;
		//console.log("____Inicio");
		for (var i = 0; i < grid.length; i++) {
		//console.log(checker[i]);
		  if (grid[i].valid
		  	& mouseX > grid[i].x*grid[i].width + boardOffset[0]
		  	& mouseX < grid[i].x*grid[i].width + grid[i].width + boardOffset[0]
		  	& mouseY > grid[i].y*grid[i].height + boardOffset[1]
		  	& mouseY < grid[i].y*grid[i].height + grid[i].height + boardOffset[1])
		  {
		  	ret = grid[i];
		  	break;
		  };
		}
		return ret;
	}

	var GetGridCell = function(x,y){
		var ret;
		//console.log("____Inicio");
		for (var i = 0; i < grid.length; i++) {
		//console.log(checker[i]);
		  if (grid[i].valid
		  	& grid[i].x == x 
		  	& grid[i].y == y)
		  {
		  	ret = grid[i];
		  	break;
		  }
		}
		return ret;
	}

	var GetPiece = function(x,y){
		var ret;
		for (var i = 0; i < pieces.length; i++) {
		  if (pieces[i].x == x && pieces[i].y == y)
		  {
		  	ret = pieces[i];
		  	break;
		  }
		}
		return ret;
	}

	var GetPieceFromMouse = function(mouseX,mouseY){
		var cell = GetGridCellFromMouse(mouseX,mouseY);
		var piece;
		if (cell) piece = GetPiece(cell.x,cell.y);
		return piece;
	}

	var ValidateMove = function(mouseX,mouseY){
		var ret;
		//console.log("____Inicio");
		for (var i = 0; i < grid.length; i++) {
		//console.log(checker[i]);
		  if (mouseX > grid[i].x*grid[i].width
		  	& mouseX < grid[i].x*grid[i].width + grid[i].width
		  	& mouseY > grid[i].y*grid[i].height
		  	& mouseY < grid[i].y*grid[i].height + grid[i].height)
		  {
		  	ret = grid[i];
		  	break;
		  };
		}
		return ret;
	}

	var DrawBoard = function(){
		var y = -1;

		//BG
		ctx.beginPath();

		//bg degradê
		var grd = ctx.createLinearGradient(0,0,0,c.width);
		grd.addColorStop(0,"978f8a");
		grd.addColorStop(1,"d1cec6");
		ctx.fillStyle = grd;

		//ctx.fillStyle = '61564c';
		ctx.fillRect(0,0,c.width,c.height);
		ctx.fill();

		//Monta o tabuleiro
		for (var i = 0; i < grid.length; i++){
			grid[i].Draw();
		}

		//Borda Externa
		ctx.beginPath();
		ctx.strokeStyle = colorCheckerDark;
		ctx.rect(boardOffset[0],boardOffset[1],boardSize[0],boardSize[1]);
		ctx.stroke();

		ctx.font="18px Verdana";
		ctx.textAlign="center";
		if (currentPlayer == 1){
			ctx.fillStyle=colorCheckerLight;
			ctx.fillText("Turno: Player Branco",c.width/2,18);
		} else {
			ctx.fillStyle=colorCheckerDark;
			ctx.fillText("Turno: Player Preto",c.width/2,c.height-7);			
		}

	}

	var DrawPieces = function(){
		for (var i = 0; i < pieces.length; i++){
			pieces[i].Draw();
		}
	}

	var DrawPoints = function(){

		if (currentPlayerPieces.length > 0){
			var p1count = 0;
			var p2count = 0;
			for (var i = 0; i < currentPlayerPieces.length; i++){

				if (currentPlayerPieces[i] == 1) {
					p1count++;	
				} else {
					p2count++;
				}

				ctx.beginPath();
				var left, top;
				if (currentPlayerPieces[i] == 1){
				  	left = boardSize[0] + boardOffset[0] + 25;
				  	top = boardOffset[1] + (25 * p1count);
				} else {
					left = boardOffset[0] - 25;
				  	top = boardSize[1] + boardOffset[1] - 25 * p2count;
				}
				ctx.arc(left,top,16,0,2*Math.PI,false);
				ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
		      	ctx.shadowBlur = 5;
				ctx.shadowOffsetX = 3;
				ctx.shadowOffsetY = 3;

				var grd = ctx.createLinearGradient(left,top,left+20,top+20);
				if (currentPlayerPieces[i] == 1){
					grd.addColorStop(1,"1c1715");
					grd.addColorStop(0,"676763");

				} else {
					grd.addColorStop(1,"100c09");
					grd.addColorStop(0,"dadad3");
				}
				ctx.fillStyle = grd;
				ctx.strokeStyle = 'rgba(10, 10, 0, 0.1)';
				ctx.fill();	
				ctx.stroke();

			} 

			ctx.shadowBlur = 0;
			ctx.shadowOffsetX = 0;
			ctx.shadowOffsetY = 0;
		}


		if (gameFinished){ //desenha um layer com com degradê
			ctx.beginPath();
			ctx.fillStyle = 'rgba(40,40,40,0.8)';
			//ctx.fillStyle = '61564c';
			ctx.fillRect(0,0,c.width,c.height);
			ctx.fill();

			ctx.font="22px Verdana";
			ctx.textAlign="center";
			if (gameWinner == 1){
				ctx.fillStyle=colorCheckerLight;
				ctx.fillText("Player Branco venceu!!!",c.width/2,c.height/2);
			} else if (gameWinner == 2){
				ctx.fillStyle=colorCheckerLight;
				ctx.fillText("Player Preto venceu!!!",c.width/2,c.height/2);			
			}
		}

	}

    var DrawSelection = function(cell,color){ //desenha um quadrado de seleção
    	if (cell){
			ctx.beginPath();
			ctx.strokeStyle = color;
			ctx.rect(cell.left,cell.top,boardSize[0]/boardDivisions,boardSize[1]/boardDivisions);
			ctx.lineWidth = 2;
			ctx.stroke();
		}
    }

	var CalculateMovements = function(piece){
		if (piece != undefined){
			selectedPieceTargets = [];
			pieceEatingTargets = [];
			CalculateDirection(1,1,piece,null); //direita-baixo
			CalculateDirection(1,-1,piece,null); //direita-cima
			CalculateDirection(-1,1,piece,null); //esquerda-baixo
			CalculateDirection(-1,-1,piece,null); //esquerda-cima
		}
	}

	var CalculateDirection = function(directionX,directionY,piece,isEating){

		var checkCell = GetGridCell(piece.x+directionX,piece.y+directionY);
		if (checkCell && checkCell.valid){ //se existir uma célula preta
			enemyPiece = GetPiece(checkCell.x,checkCell.y);
			if (!enemyPiece || enemyPiece && enemyPiece.player != currentPlayer && !isEating){ 
				if (!enemyPiece) selectedPieceTargets.push(checkCell); //adiciona uma celula para a lista de movimentações disponíveis
				directionX += directionX > 0 ? 1 : -1; //incrementa +1 na mesma direção para a busca recursiva
				directionY += directionY > 0 ? 1 : -1;
				if (enemyPiece) isEating = enemyPiece; //enviará para a busca recursiva
				if (isEating && !enemyPiece) pieceEatingTargets.push(new Array(checkCell,isEating)); //se recebeu da busca recursiva mas não tem enemy próximo, então adiciona a célula como eatingTarget
				if (piece.isDama || enemyPiece) CalculateDirection(directionX, directionY,piece,isEating); //busca recursivamente se for dama ou então apenas 1 casa adiante, para verificar se pode comer a peça inimiga
			}
		}

	}

	var CheckVictory = function(){
		var countPlayer1 = 0;
		var countPlayer2 = 0;
		for (var i = 0; i < pieces.length; i++){
			if (pieces[i].player == 1) countPlayer1++;
			if (pieces[i].player == 2) countPlayer2++;
		}
		if (countPlayer1 == 0) {
			gameFinished = true;
			gameWinner = 2;
		} else if (countPlayer2 == 0){
			gameFinished = true;
			gameWinner = 1;
		}

	}

	var onMouseDown = function(e) {
		if (gameFinished) return;

   		var mouseX = e.pageX-c.offsetLeft;
   		var mouseY = e.pageY-c.offsetTop;
   		var pieceHover = GetPieceFromMouse(mouseX,mouseY);

   		if (pieceHover != undefined && !selectedPiece && pieceHover.player == currentPlayer){
   			selectedPiece = pieceHover;
   			selectedPiece.isSelected = true;
   			
   			//manda pro topo do array, para renderizar por cima
			var index = pieces.indexOf(pieceHover);
			if (index > -1) {
			    pieces.splice(index, 1);
			    pieces.push(pieceHover);
			}

   			CalculateMovements(selectedPiece);
   		}
		
    }

	var onMouseUp = function(e) {

		if (gameFinished) return;

   		var mouseX = e.pageX-c.offsetLeft;
   		var mouseY = e.pageY-c.offsetTop;

   		if (selectedPiece != undefined){
	   		var didPoint = false;
	   		var hoverCell = GetGridCellFromMouse(mouseX,mouseY);
			for (var i = 0; i < pieceEatingTargets.length; i++){ //verifica se está comendo uma peça
				if (pieceEatingTargets[i][0] == hoverCell) {
	   				selectedPiece.Set(hoverCell.x,hoverCell.y);
	   				if (debug) console.log(pieceEatingTargets[i][1]);
					var index = pieces.indexOf(pieceEatingTargets[i][1]);
					if (index > -1) {
						currentPlayerPieces.push(currentPlayer);
					    pieces.splice(index, 1);
					    didPoint = true;
					    CheckVictory();
					    break;
					}

	   			}
			}
	   		for (var i = 0; i < selectedPieceTargets.length; i++){
	   			if (selectedPieceTargets[i] == hoverCell) {
	   				selectedPiece.Set(hoverCell.x,hoverCell.y); //move a peça para esta célula
		   			if (!didPoint) currentPlayer = currentPlayer == 1 ? 2 : 1;
	   				break;
	   			}
	   		}

   			selectedPiece.Set(selectedPiece.x,selectedPiece.y);
   			selectedPiece.isSelected = false;
	   		selectedPiece.Draw();
   		}
   		selectedPiece = undefined;
   		selectedPieceOption = [];
   		Draw();
    }

   	var onMouseMove = function(e) {
   		if (gameFinished) return;

   		Draw();

   		var mouseX = e.pageX-c.offsetLeft;
   		var mouseY = e.pageY-c.offsetTop;

		if (debug){
			var pieceHover = GetPieceFromMouse(mouseX,mouseY);
			if (pieceHover != selectedPiece){
				//selectedPiece = pieceHover;

				if (pieceHover && pieceHover.player != currentPlayer) return;
				if (pieceHover) CalculateMovements(pieceHover);

				if (selectedPieceTargets && pieceEatingTargets){
					for (var i = 0; i < selectedPieceTargets.length; i++){
						DrawSelection(selectedPieceTargets[i],'blue');
					}
					for (var i = 0; i < pieceEatingTargets.length; i++){
						DrawSelection(pieceEatingTargets[i][0],'yellow');
					}
				}

			}
			
		}
		
		if (selectedPiece){
			selectedPiece.Drag(mouseX,mouseY);
			document.body.style.cursor = 'pointer';
		} else {
			document.body.style.cursor = 'default';
		}

    }


    var onCheckDebug = function(e){
    	debug = debugField.checked;
    	Draw();
    }

	c.addEventListener("mousedown", onMouseDown, false);
	c.addEventListener("mouseup",   onMouseUp,   false);
	c.addEventListener("mousemove", onMouseMove, false);
	debugField.addEventListener("click", onCheckDebug, false);

	var Draw = function(){

		var timer = new Date();
		timer = timer.getTime();
		if (timer - lastInterval > 20){ //update em 20milisecs,chamado no onMouseMove
			lastInterval = timer;
			DrawBoard();
			DrawPieces();
			DrawPoints();
		}

	}

	//var renderLoop = setInterval(Draw,20);
};

var game = new Damas();
game.size = [400,400];
game.divisions = 8;
game.Init();
