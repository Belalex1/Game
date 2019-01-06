'use strict';

// 1. Реализовать базовые классы игры: Vector, Actor и Level.

class Vector {
	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}

	plus(vector) {
		if (vector instanceof Vector) {
			return new Vector(this.x + vector.x, this.y + vector.y);
		}
		throw new Error('Можно прибавлять к вектору только вектор типа Vector');
	}

	times(n = 1) {
		return new Vector(this.x * n, this.y * n);
	}
}

// Пример кода
/*
const start = new Vector(30, 50);
const moveTo = new Vector(5, 10);
const finish = start.plus(moveTo.times(2));

console.log(`Исходное расположение: ${start.x}:${start.y}`);
console.log(`Текущее расположение: ${finish.x}:${finish.y}`);
*/
/*
Результат выполнения кода:

Исходное расположение: 30:50
Текущее расположение: 40:70
*/

class Actor {
	constructor(
		pos = new Vector(0, 0),
		size = new Vector(1, 1),
		speed = new Vector(0, 0)
	) {
		if (
			(pos && !(pos instanceof Vector)) ||
			(size && !(size instanceof Vector)) ||
			(speed && !(speed instanceof Vector))
		) {
			throw new Error('В качестве аргумента можно передавать только вектор типа Vector');
		}
		this.pos = pos;
		this.size = size;
		this.speed = speed;
	}

	act() {}

	get left() {
		return this.pos.x;
	}

	get top() {
		return this.pos.y;
	}

	get right() {
		return this.pos.x + this.size.x;
	}

	get bottom() {
		return this.pos.y + this.size.y;
	}

	get type() {
		return 'actor';
	}

	isIntersect(actor) {
		if (!(actor instanceof Actor) || !actor) {
			throw new Error('В качестве аргумента необходимо передать объект типа Actor');
		}

		if (actor === this) {
			return false;
		}

		return (
			this.left < actor.right &&
			this.right > actor.left &&
			this.bottom > actor.top &&
			this.top < actor.bottom
		);
	}
}

// Пример кода
/*
const items = new Map();
const player = new Actor();
items.set('Игрок', player);
items.set('Первая монета', new Actor(new Vector(10, 10)));
items.set('Вторая монета', new Actor(new Vector(15, 5)));

function position(item) {
	return ['left', 'top', 'right', 'bottom']
		.map(side => `${side}: ${item[side]}`)
		.join(', ');
}

function movePlayer(x, y) {
	player.pos = player.pos.plus(new Vector(x, y));
}

function status(item, title) {
	console.log(`${title}: ${position(item)}`);
	if (player.isIntersect(item)) {
		console.log(`Игрок подобрал ${title}`);
	}
}

items.forEach(status);
movePlayer(10, 10);
items.forEach(status);
movePlayer(5, -5);
items.forEach(status);
*/
/*
Результат работы примера:

Игрок: left: 0, top: 0, right: 1, bottom: 1
Первая монета: left: 10, top: 10, right: 11, bottom: 11
Вторая монета: left: 15, top: 5, right: 16, bottom: 6
Игрок: left: 10, top: 10, right: 11, bottom: 11
Первая монета: left: 10, top: 10, right: 11, bottom: 11
Игрок подобрал Первая монета
Вторая монета: left: 15, top: 5, right: 16, bottom: 6
Игрок: left: 15, top: 5, right: 16, bottom: 6
Первая монета: left: 10, top: 10, right: 11, bottom: 11
Вторая монета: left: 15, top: 5, right: 16, bottom: 6
Игрок подобрал Вторая монета
*/

class Level {
	constructor(grid = [], actors = []) {
		this.grid = grid;
		this.actors = actors;
		this.player = this.actors.find(actor => actor.type === 'player');
		this.height = this.grid.length;
		this.width = this.grid.reduce((a, b) => {
			return b.length > a ? b.length : a;
		}, 0);
		this.status = null;
		this.finishDelay = 1;
	}

	isFinished() {
    if (this.status !== null && this.finishDelay < 0) return true;
    return false;
  }

	actorAt(actor) {
		if (!(actor instanceof Actor) || !actor) {
			throw new Error(`В качестве аргумента необходимо передать объект типа Actor`);
		}

		if (!this.actors) {
			return;
		} else {
			return this.actors.find(currentActor => currentActor.isIntersect(actor));
		}
	}

	obstacleAt(pos, size) {
		if (!(pos instanceof Vector) || !(size instanceof Vector)) {
			throw new Error(`В качестве аргумента можно передавать только вектор типа Vector`);
		}
		const leftBorder = Math.floor(pos.x);
		const rightBorder = Math.ceil(pos.x + size.x);
		const topBorder = Math.floor(pos.y);
		const bottomBorder = Math.ceil(pos.y + size.y);

		if (leftBorder < 0 || rightBorder > this.width || topBorder < 0) {
			return 'wall';
		}
		if (bottomBorder > this.height) {
			return 'lava';
		}

		for (let i = topBorder; i < bottomBorder; i++) {
			for (let j = leftBorder; j < rightBorder; j++) {
				if (this.grid[i][j]) {
					return this.grid[i][j];
				} 
			}
		}
	}

	removeActor(actor) {
		this.actors = this.actors.filter(el => el !== actor);
	}

	noMoreActors(type) {
		if (this.actors) {
			for (let actor of this.actors) {
				if (actor.type === type) {
					return false;
				}
			}
		}
		return true;
	}

	playerTouched(type, actor) {
		if (this.status === null) {
			if (type === 'lava' || type === 'fireball') {
				this.status = 'lost';
				return this.status;
			}
			if (type === 'coin') {
				this.removeActor(actor);
				if (this.noMoreActors('coin')) {
					this.status = 'won';
				}
			}
		}
	}
}

// Пример кода
/*
const grid = [[undefined, undefined], ['wall', 'wall']];

function MyCoin(title) {
	this.type = 'coin';
	this.title = title;
}
MyCoin.prototype = Object.create(Actor);
MyCoin.constructor = MyCoin;

const goldCoin = new MyCoin('Золото');
const bronzeCoin = new MyCoin('Бронза');
const player = new Actor();
const fireball = new Actor();

const level = new Level(grid, [goldCoin, bronzeCoin, player, fireball]);

level.playerTouched('coin', goldCoin);
level.playerTouched('coin', bronzeCoin);

if (level.noMoreActors('coin')) {
	console.log('Все монеты собраны');
	console.log(`Статус игры: ${level.status}`);
}

const obstacle = level.obstacleAt(new Vector(1, 1), player.size);
if (obstacle) {
	console.log(`На пути препятствие: ${obstacle}`);
}

const otherActor = level.actorAt(player);
if (otherActor === fireball) {
	console.log('Пользователь столкнулся с шаровой молнией');
}
*/

/*
Результат выполнения:

Все монеты собраны
Статус игры: won
На пути препятствие: wall
Пользователь столкнулся с шаровой молнией
*/

// 2. После этого вы уже сможете запустить игру.
/*
const grid = [
  new Array(3),
  ['wall', 'wall', 'lava']
];
const level = new Level(grid);
runLevel(level, DOMDisplay);
На экране отобразится схема уровня. Узнайте подробнее про функцию runLevel и класс DOMDisplay ниже.
*/

/*
3. Реализуйте LevelParser, что позволит вам описывать уровни с помощью текстовой схемы:
const schema = [
  '         ',
  '         ',
  '         ',
  '         ',
  '     !xxx',
  '         ',
  'xxx!     ',
  '         '
];
const parser = new LevelParser();
const level = parser.parse(schema);
runLevel(level, DOMDisplay);
*/

class LevelParser {
	constructor(gameDic) {
		this.gameDic = gameDic;
	}

	actorFromSymbol(symbol) {
	  if (!symbol) {
      return;
    }
    return this.gameDic[symbol];
	}

	obstacleFromSymbol(symbol) {
		switch (symbol) {
			case 'x':
				return 'wall';
			case '!':
				return 'lava';
			default:
				return;
		}
	}

	createGrid(stringsArr = []) {
    return stringsArr.map(item => {
      return item.split('').map(i => {
        return this.obstacleFromSymbol(i);
      });
    });
	}

	createActors(stringsArr = []) {
	  const actors = [];
	  const arr = stringsArr.map(string => string.split(''));
	  
    arr.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (this.gameDic && this.gameDic[cell] && typeof this.gameDic[cell] === 'function') {
          const actor = new this.gameDic[cell](new Vector(x, y));
          if (actor instanceof Actor) {
            actors.push(actor);
          }
        }
      });
    });
    return actors;
	}

	parse(stringsArr = []) {
		const grid = this.createGrid(stringsArr);
		const actors = this.createActors(stringsArr);
		return new Level(grid, actors);
	}
}

// Пример использования
/*
const plan = [' @ ', 'x!x'];

const actorsDict = Object.create(null);
actorsDict['@'] = Actor;

const parser = new LevelParser(actorsDict);
const level = parser.parse(plan);

level.grid.forEach((line, y) => {
	line.forEach((cell, x) => console.log(`(${x}:${y}) ${cell}`));
});

level.actors.forEach(actor =>
	console.log(`(${actor.pos.x}:${actor.pos.y}) ${actor.type}`)
);
*/

/*
Результат выполнения кода:

(0:0) undefined
(1:0) undefined
(2:0) undefined
(0:1) wall
(1:1) lava
(2:1) wall
(1:0) actor
*/

/*
4. Реализуйте Player, поместите его символ на схему и добавьте словарь при создании парсера:
const schema = [
  '         ',
  '         ',
  '         ',
  '         ',
  '     !xxx',
  ' @       ',
  'xxx!     ',
  '         '
];
const actorDict = {
  '@': Player
}
const parser = new LevelParser(actorDict);
const level = parser.parse(schema);
runLevel(level, DOMDisplay);
*/

class Player extends Actor {
  constructor(pos) {
    super(pos);
    this.pos = this.pos.plus(new Vector(0, -0.5));
    this.size = new Vector(0.8, 1.5);
    this.speed = new Vector(0, 0);
  }
  
  get type() {
    return 'player';
  }
}

// 5. Реализуйте другие движущиеся объекты игрового поля и помещайте их символы на схему и в словарь парсера.

class Fireball extends Actor {
  constructor(pos = new Vector(0, 0), speed = new Vector(0, 0)) {
    super(pos, new Vector(1, 1), speed);
  }
  
  get type() {
    return 'fireball';
  }
  
  getNextPosition(time = 1) {
    return new Vector(this.pos.x + this.speed.x * time, this.pos.y + this.speed.y * time);
  }
  
  handleObstacle() {
    this.speed.x = -this.speed.x;
    this.speed.y = -this.speed.y;
  }
  
  act(time, level) {
    if (level.obstacleAt(this.getNextPosition(time), this.size)) {
      this.handleObstacle();
    } else {
      this.pos = this.getNextPosition(time);
    }
  }
}

/*
const time = 5;
const speed = new Vector(1, 0);
const position = new Vector(5, 5);

const ball = new Fireball(position, speed);

const nextPosition = ball.getNextPosition(time);
console.log(`Новая позиция: ${nextPosition.x}: ${nextPosition.y}`);

ball.handleObstacle();
console.log(`Текущая скорость: ${ball.speed.x}: ${ball.speed.y}`);
*/

/*
Результат работы кода:

Новая позиция: 10: 5
Текущая скорость: -1: 0
*/

class HorizontalFireball extends Fireball {
  constructor(pos) {
    super(pos);
    this.speed = new Vector(2, 0);
    this.size = new Vector(1, 1);
  }
}

class VerticalFireball extends Fireball {
  constructor(pos) {
    super(pos);
    this.speed = new Vector(0, 2);
    this.size = new Vector(1, 1);
  }
}

class FireRain extends Fireball {
  constructor(pos) {
    super(pos);
    this.speed = new Vector(0, 3);
    this.size = new Vector(1, 1);
    this.currentPos = pos;
  }
  
  handleObstacle() {
    this.pos = this.currentPos;
  }
}

class Coin extends Actor {
  constructor(pos = new Vector(0, 0)) {
    super(pos.plus(new Vector(0.2, 0.1)), new Vector(0.6, 0.6));
    this.springSpeed = 8;
    this.springDist = 0.07;
    this.spring = Math.random() * Math.PI * 2;
    this.startPosition = new Vector(this.pos.x, this.pos.y);
  }
  
  get type() {
    return 'coin';
  }
  
  updateSpring(time = 1) {
    this.spring += this.springSpeed * time;
  }
  
  getSpringVector() {
    return new Vector(0, Math.sin(this.spring) * this.springDist);
  }
  
  getNextPosition(time = 1) {
    this.updateSpring(time);
    return this.startPosition.plus(this.getSpringVector());
  }
  
  act(time) {
    this.pos = this.getNextPosition(time);
  }
}

// 6. Реализуйте загрузку уровней с помощью функции loadLevels и запуск игры с помощью runGame.
// 7. Когда игрок пройдет все уровни, используйте функцию alert, чтобы сообщить о победе.

const schemas = [
  [
    '         ',
    '         ',
    '    =    ',
    '       o ',
    '     !xxx',
    ' @       ',
    'xxx!     ',
    '         '
  ],
  [
    '      v  ',
    '    v    ',
    '  v      ',
    '        o',
    '        x',
    '@   x    ',
    'x        ',
    '         '
  ]
];
const actorDict = {
  '@': Player,
  'v': FireRain,
  '=': HorizontalFireball,
  '|': VerticalFireball,
  'o': Coin
};

const parser = new LevelParser(actorDict);
runGame(schemas, parser, DOMDisplay)
  .then(() => console.log('Вы выиграли приз!'));
