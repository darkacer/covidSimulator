const size = 10;
const xWidth = 1280
const yWidth = 720
let mobilityPercentage = 50;
let numberOfPeople = 100;
let hospCapacity = 50
let infectedPeople = 1;
let myGamePieces = []
let dataCurrentInfected = new Map();
let dataQuaratined = new Map();
let dataDead = new Map();
let dataRecovered = new Map();
let dataThreshold = new Map();
let HC;
let prevTime = 0
let day0 = 0
let day = 0
let myChart;
//let quadtree;
alert('Press Start simulation Button at the bottom. Read the transcript below')
function startGame() {
	myGameArea.start();
	drawChart()
}
function kickStart() {
	// document.querySelector('#line-chart').style.display = 'none'
	day = 0;
	dataCurrentInfected.clear()
	dataQuaratined.clear()
	day0 = performance.now();
	myGameArea.stop()
	numberOfPeople = document.querySelector('#numberOfPeople').value;
	mobilityPercentage = document.querySelector('#mobilityPer').value;
	infectedPeople = document.querySelector('#infectedPeople').value;
	hospCapacity = document.querySelector('#hospcapacity').value;
	//quadtree = new QT.QuadTree(new QT.Box(0, 0, xWidth, yWidth), {removeEmptyNodes : true, capacity: 5});
	
	numberOfPeople = numberOfPeople > 10000 ? 10000 : numberOfPeople
	infectedPeople = infectedPeople < 1 ? 1 : infectedPeople
	HC = hospCapacity;

	myGamePieces = []
	let count = 0;
	for(let i = 0; i < numberOfPeople; i++) {
		let x = randomNumber(xWidth)
		let y = randomNumber(yWidth)
		if (count < infectedPeople) {				
			piece = new component(size, size, "red",x, y);
			//quadtree.insert(new QT.Point(x, y, {color: 'red'}));
		}
		else {
			piece = new component(size, size, "green", x, y);
			//quadtree.insert(new QT.Point(x, y, {color: 'green'}));
		}
		myGamePieces.push(piece)
		count++			
	}
	myGameArea.kickStart();
	//console.log(quadtree)
	//treeReccursive(quadtree)
	//console.log(counter)
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
		//console.log(drawChart())
		setInterval(updateChart, 1000);
	}
}

function updateGameArea() {
	let infectedPersons = []
	let quaratinedPersons = []
	let nonInfectedPersons = []
	let moverPersons = []
	let deadPersons = []
	let recoveredPersons = []
	let greenCount = 0;
	let redCount = 0;
	myGameArea.clear();
	//quadtree = {}
	//quadtree = new QT.QuadTree(new QT.Box(0, 0, xWidth, yWidth), {removeEmptyNodes : true, capacity: 5});
	
	myGamePieces.forEach( el => {		
		
		if (el.color === 'green') {
			//greenCount++
			nonInfectedPersons.push(el)
			//quadtree.insert(new QT.Point(el.x, el.y, {color: 'green'}));
		}
		if (el.color === 'red') {
			//redCount++
			infectedPersons.push(el)
			//quadtree.insert(new QT.Point(el.x, el.y, {color: 'red'}));
		}
		if (el.color == 'blue') {
			quaratinedPersons.push(el)
		}
		if (el.color == 'black') {
			deadPersons.push(el)
		}
		if (el.color == 'yellow') {
			recoveredPersons.push(el)
		}
		if (el.mover == false) {
			moverPersons.push(el)
		}
		
		if (!el.isStopped /*&& el.mover*/ && el.color == 'red') {
			day = parseInt((performance.now() - day0) / 1000)
			//console.log('checking for day ', day, el.dayInfected)
			if (Math.abs(el.dayInfected - day) > 5) {
				//console.log('im in')
				el.stopMoveMent()
			}
			
		}
		
		if (el.color == 'blue' && el.dayQuaratined != 0 && Math.abs(el.dayQuaratined - day) > 5) {
			el.fate()
		}
		el.newPos();
		el.update();
	})
	
	
	
	if (quaratinedPersons.length == 0 && moverPersons.length == 0) {
		myGameArea.stop()
	}
	
	
	
	if (infectedPersons.length < nonInfectedPersons.length)
		checkCollision(infectedPersons, nonInfectedPersons, true);
	else 
		checkCollision(nonInfectedPersons, infectedPersons, false);
	// build tree 
	// tree reccursive 
	//console.log("quadtree is ######", quadtree)
	//treeReccursive(quadtree)
	console.log('hospCapacity', hospCapacity)
	//prevTime = performance.now()
	day = parseInt((performance.now() - day0) / 1000)
	if (day >= 60) myGameArea.stop();
	dataCurrentInfected.set(day, infectedPersons.length + quaratinedPersons.length)
	dataQuaratined.set(day, quaratinedPersons.length)
	dataDead.set(day, deadPersons.length)
	dataRecovered.set(day, recoveredPersons.length)
	dataThreshold.set(day, HC)
	document.querySelector('#days').innerHTML = day;
	document.querySelector('#infected').innerHTML = infectedPersons.length;
	document.querySelector('#susceptible').innerHTML = nonInfectedPersons.length;
	document.querySelector('#quarantine').innerHTML = quaratinedPersons.length;
	document.querySelector('#deadpeople').innerHTML = deadPersons.length;
	document.querySelector('#recovered').innerHTML = recoveredPersons.length;
}
// //let counter = 0;
// function treeReccursive(tree) {
	// if (!tree.isDivided) {
		// let nonInf = []
		// let inf = []
		// //	console.log(tree.points)
		// //console.log(counter)
		// //counter += tree.points.length;
		
		// tree.points.forEach(el => {
			// if (el.data.color == "green") nonInf.push(el)
			// if (el.data.color == "red") inf.push(el)
		// })
		// if (inf.length == 0 || nonInf.length == 0) return
		// checkCollision(inf, nonInf);		
		// return;
	// }
	
	// treeReccursive(tree.ne);
	// treeReccursive(tree.nw);
	// treeReccursive(tree.se);
	// treeReccursive(tree.sw);	
	// return;
// }

function checkCollision(infectedPersons, nonInfectedPersons, flag) {
	//console.log('hi', infectedPersons, nonInfectedPersons)
	infectedPersons.forEach(il => {
		let infectedAreasX = []
		let infectedAreasY = []
		for(let i = 0, j = size ; i < size; i++, j--) {
			infectedAreasX.push(il.x + i)
			infectedAreasY.push(il.y + i)
			infectedAreasX.push(il.x + j)
			infectedAreasY.push(il.y + j)
		}
		
		for(let i = 0; i < nonInfectedPersons.length; i++) {
		//nonInfectedPersons.forEach(nl => {
			let nl = nonInfectedPersons[i]
			if (Math.abs(nl.x - il.x) > size || Math.abs(nl.y - il.y) > size)
				continue
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
				// console.log('more ', nl)
				if (flag) {					
					nl.color = 'red'
					nl.updateInfected()
				}
				else {					
					il.color = 'red'
					il.updateInfected()
				}
				
			}
		}
	})
}


function resumeSimulation() {
	myGameArea.kickStart()
}

function component(width, height, color, x, y) {
	this.width = width;
	this.height = height;
	this.color = color;
	this.mover = false;
	this.isStopped = false;
	this.dayInfected = 0;
	this.dayQuaratined = 0;
	this.gotHospital = false;
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
	
	this.fate = function(quarCount) {
		if (this.gotHospital) {			
			if (probability(0.05)) {
				this.color = 'black'
				//hospCapacity++
				console.log('inside hosp', hospCapacity)
			} else {
				this.color = 'yellow'
			}
		} else {
			if (probability(0.35)) {
				this.color = 'black'
				console.log('outside hosp', hospCapacity)
				//hospCapacity++
			} else {
				this.color = 'yellow'
				//hospCapacity++
			}
		}		
		hospCapacity = hospCapacity > HC ? HC : hospCapacity + 1
		
	}
	
	this.x = x;
	this.y = y;    
	this.updateInfected = function() {
		// console.log('im infected ', parseInt((performance.now() - day0) / 1000))
		this.dayInfected = parseInt((performance.now() - day0) / 1000)
	}
	this.update = function() {
		ctx = myGameArea.context;
		ctx.fillStyle = this.color;
		ctx.fillRect(this.x, this.y, this.width, this.height);
	}
	this.stopMoveMent = function() {
		this.isStopped = true;
		this.speedX = 0
		this.speedY = 0		
		this.color = 'blue'
		this.dayQuaratined = parseInt((performance.now() - day0) / 1000);
		hospCapacity = (hospCapacity > 0) ? hospCapacity - 1 : 0
		this.gotHospital = hospCapacity > 0 ? true : false
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

function probability(decimal) {
	return randomNumber(1000) < decimal * 1000 ? true : false
}

function drawChart() {
	// document.querySelector('#line-chart').style.display = 'block'
	document.querySelector('#line-chart').innerHTML = ''
	myChart = new Chart(document.getElementById("line-chart"), {
	  type: 'line',
	  data: {
		labels: [...dataCurrentInfected.keys()],
		datasets: [{
			data: [...dataCurrentInfected.values()],
			label: "Current Infected Persons",
			borderColor: "#ff0000",
			fill: false
		  },
		  {
			data: [...dataQuaratined.values()],
			label: "Hospital Demand",
			borderColor: "#3e95cd",
			fill: false
		  },
		  {
			data: [...dataDead.values()],
			label: "Dead People",
			borderColor: "#000000",
			fill: false
		  },
		  {
			data: [...dataRecovered.values()],
			label: "Recovered People",
			borderColor: "#ffff00",
			fill: false
		  },
		  {
			data: [...dataThreshold.values()],
			label: "HealthCare Capacity",
			borderColor: "#00ff00",
			fill: false
		  }
		]
	  },
	  options: {
		annotation: {
		  annotations: [{
			type: 'line',
			mode: 'horizontal',
			scaleID: 'y-axis-0',
			value: 5,
			borderColor: 'rgb(75, 192, 192)',
			borderWidth: 4,
			label: {
			  enabled: true,
			  content: 'Test label'
			}
		  }]
		},
		tooltips: {
		  mode: 'index',
		  intersect: true
		},
		title: {
		  display: true,
		  text: 'Simulation result'
		}, 
		responsive: true
	  }
	});
	
	return myChart
}

var updateChart = function() {
	myChart.data.labels = [...dataCurrentInfected.keys()];
	myChart.data.datasets[0].data = [...dataCurrentInfected.values()];
	myChart.data.datasets[1].data = [...dataQuaratined.values()];
	myChart.data.datasets[2].data = [...dataDead.values()];
	myChart.data.datasets[3].data = [...dataRecovered.values()];
	myChart.data.datasets[4].data = [...dataThreshold.values()];
	myChart.update();
};
