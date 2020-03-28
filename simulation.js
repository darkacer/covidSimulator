const size = 10;
const xWidth = 1280
const yWidth = 720
let mobilityPercentage = 50;
let numberOfPeople = 100;
let infectedPeople = 1;
let myGamePieces = []
let dataInfected = new Map();
let prevTime = 0
let day0 = 0
let day = 0
	function startGame() {			
		myGameArea.start();
	}
	function kickStart() {
		//document.querySelector('#line-chart').style.display = 'none'
		day = 0;
		dataInfected.clear()
		day0 = performance.now();
		myGameArea.stop()
		numberOfPeople = document.querySelector('#numberOfPeople').value;
		mobilityPercentage = document.querySelector('#mobilityPer').value;
		infectedPeople = document.querySelector('#infectedPeople').value;
		
		const quadtree = new QT.QuadTree(new QT.Box(0, 0, xWidth, yWidth), {removeEmptyNodes : true, capacity: 10});
		
		myGamePieces = []
		let count = 0;
		for(let i = 0; i < numberOfPeople; i++) {
			let x = randomNumber(xWidth)
			let y = randomNumber(yWidth)
			if (count < infectedPeople) {				
				piece = new component(size, size, "red",x, y);
				quadtree.insert(new QT.Point(x, y, {color: 'red'}));
			}
			else {
				piece = new component(size, size, "green", x, y);
				quadtree.insert(new QT.Point(x, y, {color: 'green'}));
			}
			myGamePieces.push(piece)
			count++			
		}
		myGameArea.kickStart();
	}

	var myGameArea = {
		canvas : document.createElement("canvas"),
		start : function() {
			this.canvas.width = xWidth;
			this.canvas.height = yWidth;
			this.context = this.canvas.getContext("2d");
			document.body.insertBefore(this.canvas, document.body.childNodes[0]);
		},
		clear : function() {
			this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		},
		stop : function() {
			clearInterval(this.interval);
		}, 
		kickStart : function() {
			updateGameArea()
			this.interval = setInterval(updateGameArea.bind(this), 50);
		}
	}
	
	function updateGameArea() {
		let infectedPersons = []
		let nonInfectedPersons = []
		let greenCount = 0;
		let redCount = 0;
		myGameArea.clear();
		myGamePieces.forEach( el => {
			el.newPos();
			el.update();
			if (el.color === 'green') {
				greenCount++
				nonInfectedPersons.push(el)
			}
			if (el.color === 'red') {
				redCount++
				infectedPersons.push(el)
			}
		})
		
		if (nonInfectedPersons.length == 0) {
			myGameArea.stop()
			drawChart()
		}
		
		infectedPersons.forEach(il => {
			let infectedAreasX = []
			let infectedAreasY = []
			for(let i = 0, j = size ; i < size; i++, j--) {
				infectedAreasX.push(il.x + i)
				infectedAreasY.push(il.y + i)
				infectedAreasX.push(il.x + j)
				infectedAreasY.push(il.y + j)
			}
			nonInfectedPersons.forEach(nl => {
				nlx0 = nl.x;
				nly0 = nl.y;
				nlx1 = nl.x + size;
				nly1 = nl.y;
				nlx2 = nl.x;
				nly2 = nl.y + size;
				nlx3 = nl.x + size;
				nly3 = nl.y + size;
				if (
					(infectedAreasX.includes(nlx0) && infectedAreasY.includes(nly0)) ||
					(infectedAreasX.includes(nlx1) && infectedAreasY.includes(nly1)) ||
					(infectedAreasX.includes(nlx2) && infectedAreasY.includes(nly2)) ||
					(infectedAreasX.includes(nlx3) && infectedAreasY.includes(nly3))					
				) {
					nl.color = 'red'
				}
			})
		})
		prevTime = performance.now()
		day = parseInt((performance.now() - day0) / 1000)
		if (day >= 250) myGameArea.stop();
		dataInfected.set(day, infectedPersons.length)
		document.querySelector('#days').innerHTML = day;
		document.querySelector('#infected').innerHTML = infectedPersons.length;
	}
	
	function resumeSimulation() {
		myGameArea.kickStart()
	}
	
	function component(width, height, color, x, y) {
		this.width = width;
		this.height = height;
		this.color = color;
		
		myMobile = randomNumber(100)
		if (myMobile < mobilityPercentage) {
			this.mover = true;
			xSign = randomNumber(1) ? 1 : -1
			ySign = randomNumber(1) ? 1 : -1
			this.speedX = 5 * xSign;
			this.speedY = 5 * ySign;
		} else {
			this.mover = false;
			this.speedX = 0
			this.speedY = 0
		}
		
		this.x = x;
		this.y = y;    
		this.update = function() {
			ctx = myGameArea.context;
			ctx.fillStyle = this.color;
			ctx.fillRect(this.x, this.y, this.width, this.height);
		}
		this.newPos = function() {
			this.x += this.speedX;
			this.y += this.speedY;
			if (this.x > xWidth || this.x < 0) 
				this.speedX = -this.speedX
			if (this.y > yWidth || this.y < 0) 
				this.speedY = -this.speedY
		}
	}
	
	function randomNumber(uptoNum) {
		return Math.round(Math.random() * uptoNum)
	}
	
	function drawChart() {
		document.querySelector('#line-chart').style.display = 'block'
		new Chart(document.getElementById("line-chart"), {
		  type: 'line',
		  data: {
			labels: [...dataInfected.keys()],
			datasets: [{ 
				data: [...dataInfected.values()],
				label: "MetropolisVille",
				borderColor: "#3e95cd",
				fill: false
			  }
			]
		  },
		  options: {
			title: {
			  display: true,
			  text: 'Simulation result'
			}
		  }
		});
	}
